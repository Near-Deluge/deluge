
use near_sdk::Promise;

use crate::*;


// Min Storage Requirement be 0.1 Near
pub const STORAGE_ADD_STORE: u128 = 100_000_000_000_000_000_000_000;


#[near_bindgen]
impl DelugeBase {

    // Storage Implementation will be similar to that of Paras Marketplace.

    // When a Store Adds a Product, it stores some data and needed to be store for that.
    // There will be assumption that user will have some base storage already when he creates a new store

    // 4 Functions
    // Storage Deposit
    // Storage Withdraw
    // Storage Check
    // Basic Storage

    #[payable]
    pub fn storage_deposit(&mut self, account_id: Option<AccountId>) {

        let storage_account_id = account_id
            .map(|a| a.into())
            .unwrap_or_else(env::predecessor_account_id);

        let deposit = env::attached_deposit();
        assert!(
            deposit >= STORAGE_ADD_STORE,
            "Requires minimum deposit of {}",
            STORAGE_ADD_STORE
        );

        let mut balance: u128 = self.storage_deposits.get(&storage_account_id).unwrap_or(0);
        balance += deposit;
        self.storage_deposits.insert(&storage_account_id, &balance);
    }

    #[payable]
    pub fn storage_withdraw(&mut self) {
        assert_one_yocto();

        let owner_id = env::predecessor_account_id();
        let amount = self.storage_deposits.remove(&owner_id).unwrap_or(0);

        // This is current Storage Staking for current account
        let mut amount_x = amount.clone();

        // This returns the products which this store has in the marketplace
        let store_data = self.list_store_products(owner_id.clone());
        
        let len: Vec<usize> = store_data.iter().map(|s| s.try_to_vec().unwrap().len()).collect();
        
        // Total Bytes consumed by this account in the marketplace contract
        let sum = len.into_iter().reduce(|a, b| a+b).unwrap_or(0) as u128;

        // TODO: Add costs for store storage itself

        // Total Cost to store those amount of bytes in the smart contract
        let diff = sum * env::STORAGE_PRICE_PER_BYTE;
        
        log!("Sum: {}, Diff: {} ", sum, diff );

        // Amount difference which can withdrawn
        amount_x -= diff;

        if amount_x > 0 {
            Promise::new(owner_id.clone()).transfer(amount_x);
        }
        if diff > 0 {
            self.storage_deposits.insert(&owner_id, &diff);
        }
    }

    pub fn storage_minimum_balance(&self) -> U128 {
        U128(STORAGE_ADD_STORE)
    }

    pub fn storage_balance_of(&self, account_id: AccountId) -> U128 {
        self.storage_deposits.get(&account_id).unwrap_or(0).into()
    }

}