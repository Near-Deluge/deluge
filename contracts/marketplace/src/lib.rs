// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use assert_panic::assert_panic;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet, LookupMap};
use near_sdk::env::STORAGE_PRICE_PER_BYTE;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{env, log, near_bindgen, setup_alloc, AccountId, Balance};

use crate::models::*;
use crate::utils::*;

mod internal_orders;
mod internal_products;
mod internal_stores;
mod internal_storage;
mod models;
mod utils;

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct DelugeBase {
    orders: UnorderedMap<String, Order>,
    // Considering Products will be inside stores. (Maximum store product actively listed can be in range of 1000. So that much can be efficiently handled within reasonable bounds.)
    stores: UnorderedMap<String, Store>,
    products: UnorderedMap<String, Product>,
    storage_deposits: LookupMap<AccountId, Balance>,
    ft_contract_name: AccountId,
    rating_contract_name: AccountId,
    nft_marketplace_name: AccountId,
}

impl Default for DelugeBase {
    fn default() -> Self {
        // We set default storages here.
        Self {
            orders: UnorderedMap::new(StorageKey::Orders),
            stores: UnorderedMap::new(StorageKey::Stores),
            products: UnorderedMap::new(StorageKey::Products),
            ft_contract_name: AccountId::from(String::from("")),
            rating_contract_name: AccountId::from(String::from("")),
            nft_marketplace_name: AccountId::from(String::from("")),
            storage_deposits: LookupMap::new(StorageKey::StorageDeposits)
        }
    }
}

#[near_bindgen]
impl DelugeBase {
    #[payable]
    pub fn set_ft_contract_name(&mut self, ft_contract_name: AccountId) -> String {
        // only contract owner can call this method
        assert_eq!(env::predecessor_account_id(), env::signer_account_id());
        assert_one_yocto();
        self.ft_contract_name = ft_contract_name;
        String::from("OK")
    }

    #[payable]
    pub fn set_nft_marketplace_contract_name(&mut self, nft_marketplace_name: AccountId) -> String {
        // only contract owner can call this method
        assert_eq!(env::predecessor_account_id(), env::signer_account_id());
        assert_one_yocto();
        self.nft_marketplace_name = nft_marketplace_name;
        String::from("OK")
    }

    #[payable]
    pub fn set_rating_contract_name(&mut self, rating_contract_name: AccountId) -> String {
        // only contract owner can call this method
        assert_eq!(env::predecessor_account_id(), env::signer_account_id());
        assert_one_yocto();
        self.rating_contract_name = rating_contract_name;
        String::from("OK")
    }

    // This is the entrypoint into actually creating an order
    // We must receive valid funds from the stablecoin contract to create the order
    pub fn ft_on_transfer(&mut self, sender_id: String, amount: String, msg: String) -> String {
        // assert that sender is usdt.test.near, we only support USDT for this POC
        assert_eq!(
            self.ft_contract_name,
            env::predecessor_account_id().to_string()
        );

        env::log(
            format!(
                "received ft_on_transfer: sender_id {} amount {} msg {} pred_account_id {}",
                sender_id,
                amount,
                msg.to_string(),
                env::predecessor_account_id().to_string()
            )
            .as_bytes(),
        );
        let mut order: Order = near_sdk::serde_json::from_str(&msg).unwrap();
        env::log(format!("ft_on_transfer: order.id {}", order.id.to_string()).as_bytes());

        // Reappending status as PENDING as anyone can set it to different flag
        order.status = OrderStatus::PENDING;

        // TODO: Cross check the orders prices with the products listing here
        // TODO : Check the total amount paid matches with the sum of all prices in line items.
        // TODO : Subtract the ordered items from the inventory.
        // TODO : Consider checks on the hash length for the secret length since will be considering sha256 hash values
        
        // Verify that payload amount is same as the amount received
        // order.payload.amount == amount-=
        let parsed_amount: u128 = amount.parse().unwrap();
        assert_eq!(order.payload.amount, U128::from(parsed_amount));

        // Verify that the products are valid

        let mut l_total: u128 = 0;
        for line_item in order.payload.line_items.iter() {
            let pkey = format!("{}:{}", order.seller_id, line_item.product_id);

            let prod = self
                .products
                .get(&pkey)
                .expect("Store doesn't have this product.");

            // Check for that line item price matches with the listing price.
            assert!(
                prod.price == line_item.price,
                "Price for product haven't matched. "
            );

            // Implicitly casting the price to u128
            let price: u128 = prod.price.into();
            l_total += price;
        }

        assert!(
            parsed_amount == l_total,
            "Paid amount in Coins does not matches with actual sum of prices on product listing."
        );

        // TODO: validate msg deserializes to an Order struct
       
        // Order Id will be stored with ID formatted as {buyer_id}:{order_id}

        let okey = format!("{}:{}", order.customer_account_id, order.id);
        
        // TODO: Check for order if already exists, reject it an return everything.
        match self.orders.get(&okey) {
            Some(val) => {
                log!("Order already exists!!. Try with a new order-id.");
                log!("Refunding for the order...");
                log!("Order details: {:?}", val);
                parsed_amount.to_string()
            }
            None => {
                // Subtract the inventory here. Need to do it just before pushing order.
                for line_item in order.payload.line_items.iter() {
                    let pkey = format!("{}:{}", order.seller_id, line_item.product_id);

                    let mut prod = self
                        .products
                        .get(&pkey)
                        .expect("Store doesn't have this product.");

                    let mut o_inventory: u128 = prod.inventory.into();
                    let i_count: u128 = line_item.count.into();
                    o_inventory -= i_count;
                    prod.inventory = U128::from(o_inventory);
                    self.products.insert(&pkey, &prod);
                }
                self.orders.insert(&okey, &order);
                "0".to_string() // funds to return
            }
        }
    }

    #[payable]
    pub fn buy_ft(&mut self) {
        log!("This contract expects atleast 1 NEAR in deposit, but will only give you 100 NEAR-SMT. Use at your own risk. :) ");
        assert_eq!(env::attached_deposit() >= 1000000000000000000000000, true);
        let account_id = env::signer_account_id();

        transfer_funds(
            &self.ft_contract_name,
            U128::from(10000000000 as u128),
            account_id,
        );
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
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
    fn test_successful_ft_transfer_call_with_order_creation() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = DelugeBase::default();
        contract.ft_contract_name = String::from("usdt.test.near");
        let data = json!({
          "id": "order-id",
          "customer_account_id": "customer.test.near",
          "store_account_id": "fabrics-delivery.test.near",
          "payload": {
            "token": "usdt.test.near",
            "amount": "1000000",
            "line_items": []
          },
          "status": OrderStatus::PENDING
        })
        .to_string();
        assert_eq!(
            "0".to_string(),
            contract.ft_on_transfer(
                "customer.test.near".to_string(),
                "1000000".to_string(),
                data
            )
        );
    }

    #[test]
    fn test_failure_ft_transfer_call_with_incorrect_amounts() {
        assert_panic!(
          {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = DelugeBase::default();
            contract.ft_contract_name = String::from("usdt.test.near");
            let data = json!({
              "id": "order-id",
              "customer_account_id": "customer.test.near",
              "store_account_id": "fabrics-delivery.test.near",
              "payload": {
                "token": "usdt.test.near",
                "amount": "1000001",
                "line_items": []
              },
              "status": OrderStatus::PENDING
            })
            .to_string();
            contract.ft_on_transfer(
              "customer.test.near".to_string(),
              "1000000".to_string(),
              data,
            );
          },
          String,
          starts with "assertion failed:"
        );
    }
}
