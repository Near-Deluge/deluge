use std::fmt::format;
use std::thread::AccessError;

use near_sdk::env::sha256;
use near_sdk::serde_json::json;
use near_sdk::{AccountId, Gas, Promise};

use crate::*;

const BASIC_GAS: Gas = 5_000_000_000_000;

#[near_bindgen]
impl DelugeBase {
    #[payable]
    pub fn cancel_order(&mut self, customer_account_id:AccountId, order_id: String) -> String {
        assert_one_yocto();

        // Either Store or Customer can cancel the order
        let okey = format!("{}:{}", customer_account_id, order_id);
        let order = self.orders.get(&okey).expect("Order does not exist");

        // Customer can only cancel the order if it is still pending and store haven't scheduled it.
        log!("Order key: {}", okey);
        // check unique storeid
        assert!(
            env::predecessor_account_id() == order.seller_id
                || env::predecessor_account_id() == order.customer_account_id,
            "Error. Not authorised"
        );

        match order.status {
            // If order is pending then user or store can cancel the order
            OrderStatus::PENDING => {}
            // If order is scheduled then store can cancel an order if his stock empties
            OrderStatus::SCHEDULED => {
                assert!(
                    env::predecessor_account_id() == order.seller_id,
                    "Error. Only Seller can cancel."
                );
            }
            OrderStatus::INTRANSIT => {
                assert!(
                    env::predecessor_account_id() == order.seller_id,
                    "Error. Only Seller can cancel."
                );
            }
            OrderStatus::CANCELLED => {
                // Since the order is already cancelled, Do nothing here.
                return "CANCELLED".to_string();
            }
            OrderStatus::COMPLETED => {
                // Since order is already completed, Do nothing here.
                return "COMPLETED".to_string();
            }
        }

        // TODO: On successful cancellation of order, do increase the amount of inventory

        // Can progress here only if OrderStatus is PENDING | SCHEDULED | INTRANSIT

        self.finalize_cancel_order(okey);
        // Transfer funds back from marketplace contract to customer
        let contract_id: AccountId = AccountId::from(&self.ft_contract_name);
        transfer_funds(
            &contract_id,
            order.payload.amount,
            order.customer_account_id,
        );
        "OK".to_string()
    }

    fn finalize_cancel_order(&mut self, okey: String) {
        // Either Store or Customer can cancel the order
        let mut order = self.orders.get(&okey).expect("Order does not exist");

        order.status = OrderStatus::CANCELLED;
        self.orders.insert(&okey, &order);
    }

    #[payable]
    pub fn intransit_order(&mut self, customer_account_id: AccountId, order_id: String) -> String {
        assert_one_yocto();

        // Only Store/Seller can SCHEDULE an Order
        let okey = format!("{}:{}", customer_account_id, order_id);
        let mut order = self.orders.get(&okey).expect("Order does not exist");

        // check storeid
        assert!(
            env::predecessor_account_id() == order.seller_id,
            "Error. Not authorised"
        );

        assert!(
            matches!(order.status, OrderStatus::SCHEDULED),
            "Only scheduled orders can be sent to transit."
        );

        order.status = OrderStatus::INTRANSIT;
        self.orders.insert(&okey, &order);
        "OK".to_string()

    }

    #[payable]
    pub fn schedule_order(&mut self, customer_account_id: AccountId, order_id: String) -> String {
        assert_one_yocto();

        // Only Store/Seller can SCHEDULE an Order
        let okey = format!("{}:{}", customer_account_id, order_id);
        let mut order = self.orders.get(&okey).expect("Order does not exist");

        // check storeid
        assert!(
            env::predecessor_account_id() == order.seller_id,
            "Error. Not authorised"
        );

        assert!(
            matches!(order.status, OrderStatus::PENDING),
            "Only Pending orders can be scheduled"
        );

        order.status = OrderStatus::SCHEDULED;
        self.orders.insert(&okey, &order);
        "OK".to_string()
    }

    pub fn retrieve_order(self, customer_account_id: AccountId, order_id: String) -> Order {
        let okey = format!("{}:{}", customer_account_id, order_id);
        log!("Order Key: {}", okey);
        self.orders.get(&okey).expect("Order does not exist")
    }

    // Can complete the order once supplied with orig_seed for hash value. 
    // If not given, transaction can't be completed
    #[payable]
    pub fn complete_order(&mut self, orig_seed: String, order_id: String) -> String {
        // Can be done by the anyone as long as orig_seed matches
        assert_one_yocto();
        // Either Store or Customer can cancel the order
        let order = self.orders.get(&order_id).expect("Order does not exist");

        assert!(
            matches!(order.status, OrderStatus::INTRANSIT),
            "Only In transit orders can be Completed"
        );
        
        // Asset that indeed customer seed which has been supplied
        assert!(
            String::from_utf8(sha256(&orig_seed.try_to_vec().unwrap())).unwrap() == order.customer_secret,
            "Error. Seed is not correct!!"
        );

        let okey = format!("{}:{}", order.customer_account_id, order_id);
        self.finalize_complete_order(okey);

        // Transfer funds back from marketplace contract to store
        let contract_id: AccountId = AccountId::from(&self.ft_contract_name);
        transfer_funds(&contract_id, order.payload.amount, order.seller_id);
        "OK".to_string()
    }

    pub fn finalize_complete_order(&mut self, okey: String) {
        let mut order = self.orders.get(&okey).expect("Order does not exist");
        
        order.status = OrderStatus::COMPLETED;
        self.orders.insert(&okey, &order);
    }

    pub fn list_customer_orders(self, customer_account_id: String) -> Vec<Order> {
        // TODO: improve performance
        self.orders
            .values()
            .filter(|vec| vec.customer_account_id == customer_account_id)
            .collect()
    }
    pub fn list_store_orders(self, store_account_id: String) -> Vec<Order> {
        // TODO: improve performance
        self.orders
            .values()
            .filter(|vec| vec.seller_id == store_account_id)
            .collect()
    }

    // Testing Function
    pub fn get_storage_keys(self) -> Vec<String> {
        self.orders.keys().collect()
    }

    pub fn get_storage_values(self) -> Vec<Order> {
        self.orders.values().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "marketplace.test.near".to_string(),
            signer_account_id: "customer.test.near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "usdt.test.near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn test_list_store_orders() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = DelugeBase::default();
        contract.ft_contract_name = String::from("usdt.test.near");
        let stores = contract.list_store_orders("fabrics-delivery.test.near".to_string());
        assert_eq!(0, stores.len());
    }

    #[test]
    fn test_list_customer_orders() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = DelugeBase::default();
        contract.ft_contract_name = String::from("usdt.test.near");
        let stores = contract.list_customer_orders("fabrics-delivery.test.near".to_string());
        assert_eq!(0, stores.len());
    }

    #[test]
    fn test_cancel_non_existing_order_should_fail() {
        assert_panic!(
            {
                let mut context = get_context(vec![], false);
                context.attached_deposit = 1;
                testing_env!(context);
                let mut contract = DelugeBase::default();
                contract.ft_contract_name = String::from("usdt.test.near");
                contract.cancel_order(
                    "fabrics-delivery.test.near".to_string(),
                    "order-1".to_string(),
                );
            },
            String,
            "Order does not exist"
        );
    }
}
