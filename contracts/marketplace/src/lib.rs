// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use assert_panic::assert_panic;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::env::sha256;
use near_sdk::env::STORAGE_PRICE_PER_BYTE;
use near_sdk::json_types::{Base58CryptoHash, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::{self, json};
use near_sdk::{env, log, near_bindgen, setup_alloc, AccountId, Balance, CryptoHash, Gas, Promise, PanicOnDefault};

use crate::models::*;
use crate::utils::*;

mod internal_orders;
mod internal_products;
mod internal_storage;
mod internal_stores;
mod models;
mod utils;

/// Gas spent on the call & account creation.
const CREATE_CALL_GAS: Gas = 40_000_000_000_000;

/// Gas allocated on the callback.
const ON_CREATE_CALL_GAS: Gas = 10_000_000_000_000;

const NO_DEPOSIT: Balance = 0;

const NFT_CONTRACT_INITIAL_CODE: &[u8] = include_bytes!("../../NFT/res/non_fungible_token.wasm");

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct DelugeBase {
    orders: UnorderedMap<String, Order>,
    // Considering Products will be inside stores. (Maximum store product actively listed can be in range of 1000. So that much can be efficiently handled within reasonable bounds.)
    stores: UnorderedMap<String, Store>,
    products: UnorderedMap<String, Product>,
    storage_deposits: LookupMap<AccountId, Balance>,
    ft_contract_name: AccountId,
    rating_contract_name: AccountId,
    nft_marketplace_name: AccountId,
    latest_codehash: Vec<u8>,
    nfts: UnorderedSet<AccountId>,
}

// TODO: Store the NFT .wasm to deploy.
// Store the key as hash for the active wasm file

#[near_bindgen]
impl DelugeBase {

    #[init]
    pub fn new() -> Self{
        let mut contract = Self {
            orders: UnorderedMap::new(StorageKey::Orders),
            stores: UnorderedMap::new(StorageKey::Stores),
            products: UnorderedMap::new(StorageKey::Products),
            ft_contract_name: AccountId::from(String::from("")),
            rating_contract_name: AccountId::from(String::from("")),
            nft_marketplace_name: AccountId::from(String::from("")),
            storage_deposits: LookupMap::new(StorageKey::StorageDeposits),
            latest_codehash: Vec::new(),
            nfts: UnorderedSet::new(b"n"),
        };
        contract.internal_store_initial_contract();
        contract
    }

    // Interna Function to store the NFT Contract data Initially    
    fn internal_store_initial_contract(&mut self) {
        
        assert_eq!(env::predecessor_account_id(), env::current_account_id());
        let code = NFT_CONTRACT_INITIAL_CODE.to_vec();
        let sha256_hash = env::sha256(&code);
        env::storage_write(&sha256_hash, &code);

        self.latest_codehash = sha256_hash;
    }

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

    // NFTs

    // Stores the Contract in this Contract
    // TODO: This is not working fix this.
    #[payable]
    pub fn store_contract(&mut self) -> String {
        // Check for owner
        // assert_eq!(env::predecessor_account_id(), env::current_account_id());
        assert_eq!(env::predecessor_account_id(), env::current_account_id());

        assert_one_yocto();
        
        let raw_code = env::input().expect("NO INPUT ATTACHED");
        log!("Recieved code as : {:?}", raw_code);

        let sha256_hash = env::sha256(&raw_code);
        assert!(!env::storage_has_key(&sha256_hash), "ERR_ALREADY_EXISTS");
        env::storage_write(&sha256_hash, &raw_code);

        self.latest_codehash = sha256_hash.clone();
        let mut blob_hash = [0u8; 32];
        blob_hash.copy_from_slice(&sha256_hash);
        let blob_hash_str = serde_json::to_string(&Base58CryptoHash::from(blob_hash)).unwrap();
        blob_hash_str
    }

    /// Delete code from the contract.
    pub fn delete_contract(&self, code_hash: Base58CryptoHash) {
        assert_eq!(env::predecessor_account_id(), env::current_account_id());
        let code_hash: CryptoHash = code_hash.into();
        env::storage_remove(&code_hash);
    }

    /// Create given contract with args and callback factory.
    fn create_contract(
        &self,
        code_hash: Base58CryptoHash,
        account_id: AccountId,
        new_method: &[u8],
        args: &[u8],
        callback_method: &[u8],
        callback_args: &[u8],
    ) {
        let code_hash: CryptoHash = code_hash.into();
        let attached_deposit = env::attached_deposit();
        let factory_account_id = env::current_account_id();

        // Check that such contract exists.
        assert!(env::storage_has_key(&code_hash), "Contract doesn't exist");
        // Load input (wasm code).
        let code = env::storage_read(&code_hash).expect("ERR_NO_HASH");
        // Compute storage cost.
        let code_len = code.len();
        let storage_cost = ((code_len + 32) as Balance) * env::storage_byte_cost();
        log!("Attached Deposits: {}", attached_deposit);
        assert!(
            attached_deposit >= storage_cost,
            "ERR_NOT_ENOUGH_DEPOSIT:{}",
            storage_cost
        );
        // Schedule a Promise tx to account_id.
        let promise_id = env::promise_batch_create(&account_id);
        // Create account first.
        env::promise_batch_action_create_account(promise_id);
        // Transfer attached deposit.
        env::promise_batch_action_transfer(promise_id, attached_deposit);
        // Deploy contract.
        env::promise_batch_action_deploy_contract(promise_id, &code);
        // call `new` with given arguments.
        env::promise_batch_action_function_call(
            promise_id,
            new_method,
            args,
            NO_DEPOSIT,
            CREATE_CALL_GAS,
        );
        // attach callback to the factory.
        let _ = env::promise_then(
            promise_id,
            factory_account_id,
            callback_method,
            callback_args,
            NO_DEPOSIT,
            ON_CREATE_CALL_GAS,
        );
        env::promise_return(promise_id);
    }

    pub fn get_latest_codehash(&self) -> Base58CryptoHash {
        let mut result: CryptoHash = [0; 32];
        result.copy_from_slice(&self.latest_codehash);
        Base58CryptoHash::from(result)
    }

    // Callback function on creation of NFTs Creation from the store
    #[private]
    pub fn on_create(
        &mut self,
        account_id: AccountId,
        attached_deposit: U128,
        predecessor_account_id: AccountId,
        store: Store
    ) -> bool {
        if near_sdk::is_promise_success() {
            self.nfts.insert(&account_id);
            // TODO: Flush the products before pushing into the storage as initially store would have 0 Products.
            self.stores.insert(&store.id, &store);
            true
        } else {
            Promise::new(predecessor_account_id).transfer(attached_deposit.0);
            false
        }
    }

    // Get all nfts contracts account IDs from this contract
    pub fn get_nfts(&self) -> Vec<AccountId> {
        self.nfts.as_vector().iter().collect()
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
