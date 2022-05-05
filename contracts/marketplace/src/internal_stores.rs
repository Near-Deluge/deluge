use crate::{internal_storage::STORAGE_ADD_STORE, *};
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};

#[near_bindgen]
impl DelugeBase {
    #[payable]
    pub fn create_store(&mut self, store: Store) -> String {
        assert_at_least_one_yocto();

        // check unique storeid
        assert!(
            env::predecessor_account_id() == store.id,
            "Store ID must match the account name"
        );

        assert!(
            STORAGE_ADD_STORE
                <= self
                    .storage_balance_of(env::predecessor_account_id())
                    .into(),
            "Make a storage Deposit of {} before creating a store!",
            STORAGE_ADD_STORE,
        );

        let existing_store = self.stores.get(&store.id);
        assert!(existing_store.is_none(), "Store with ID already exists");

        // TODO: Check if enought NEAR has been supplied for storage costs.
        self.check_storage_requirement(store.clone());

        // Typical Usecase: Creates a New Store -> Generates a new NFT Contract for that store

        // Account IDs are in format of shop_name_deluge

        let signer = env::signer_account_id();
        let signer_name: Vec<&str> = signer.split(".").collect();
        log!("signer_name: {}", signer_name[0]);
        let account_id: AccountId = get_formatted_nft_account_name(signer_name[0].to_string());
        log!("Account Id to be created: {}", account_id);

        let callback_args = serde_json::to_vec(&json!({
            "account_id": account_id,
            "attached_deposit": U128(env::attached_deposit()),
            "predecessor_account_id": env::predecessor_account_id(),
            "store": store
        }))
        .expect("Failed to serialize");

        let meta = NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: store.name.to_string(),
            symbol: store.id.to_string(),
            icon: Some(store.logo.to_string()),
            base_uri: None,
            reference: None,
            reference_hash: None,
        };

        let args = serde_json::to_vec(&json!({
            "owner_id": env::current_account_id(),
            "metadata": &meta
        }))
        .expect("Failed to serialize `new` args");

        self.create_contract(
            self.get_latest_codehash(),
            account_id,
            b"new",
            &args,
            b"on_create",
            &callback_args,
        );

        "OK".to_string()
    }

    pub fn update_store(
        &mut self,
        id: String,
        name: Option<String>,
        address: Option<String>,
        lat_lng: Option<LatLng>,
        website: Option<String>,
        logo: Option<String>,
        country: Option<String>,
        state: Option<String>,
        city: Option<String>,
    ) {
        let mut store = self.stores.get(&id).expect("Store does not exist");

        assert!(
            env::predecessor_account_id() == id,
            "Only Owner of Store ID can edit it's own store details."
        );

        match name {
            Some(x) => store.name = x,
            None => {}
        }
        match address {
            Some(x) => store.address = x,
            None => {}
        }
        match lat_lng {
            Some(x) => store.lat_lng = x,
            None => {}
        }
        match website {
            Some(x) => store.website = x,
            None => {}
        }
        match logo {
            Some(x) => store.logo = x,
            None => {}
        }
        match country {
            Some(x) => store.country = x,
            None => {}
        }
        match state {
            Some(x) => store.state = x,
            None => {}
        }
        match city {
            Some(x) => store.city = x,
            None => {}
        }

        // TODO: Check if enough NEAR has been supplied for storage changes. (If lessen the storage then refund for the same).
        self.check_storage_requirement(store.clone());

        self.stores.insert(&id, &store);
    }

    #[payable]
    pub fn delete_store(&mut self, store_id: AccountId) -> String {
        assert_one_yocto();
        // TODO: Delete all products
        // 1. Delete all products from products
        // 2. (Optional) Delete all pending orders.
        // 3. Delete the store itself

        let store = self.stores.get(&store_id).expect("Store doesn't exists.");

        // Store deleting the store must be the deleting store one
        assert!(
            env::predecessor_account_id() == store.id,
            "Unauthorized access"
        );

        let mut pkeys = Vec::new();
        for pid in store.products {
            pkeys.push(format!("{}:{}", store_id, pid));
        }

        for key in pkeys {
            self.products.remove(&key);
        }

        self.stores.remove(&store_id);

        // No need to refund storage as store can claim it back with the function `storage_withdraw`
        "OK".to_string()
    }

    fn check_storage_requirement(&self, store: Store) {
        assert!(
            store.try_to_vec().unwrap().len() as u128 * STORAGE_PRICE_PER_BYTE
                <= self
                    .storage_balance_of(env::predecessor_account_id())
                    .into(),
            "Near is not Enough in Storage Staking to cover storage costs!!"
        );
    }

    // View Functions

    pub fn retrieve_store(self, store_id: String) -> Option<Store> {
        let store = self.stores.get(&store_id);
        store
    }
    pub fn list_stores(self) -> Vec<Store> {
        self.stores.values().collect()
    }

    pub fn list_store_products(&self, store_id: AccountId) -> Vec<Product> {
        let store = self.stores.get(&store_id).expect("Store does not exist.");
        let mut prods = Vec::new();
        for pid in store.products {
            prods.push(self.products.get(&format!("{}:{}", store_id, pid)).unwrap());
        }
        prods
    }
}

// TEST: update store
// TEST: retrieve store
// TEST: list_store_products

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
    fn test_list_stores_with_empty_state() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let contract = DelugeBase::default();
        let stores = contract.list_stores();
        assert_eq!(0, stores.len());
    }

    // TEST: create store fails when no deposit provided
    #[test]
    fn test_create_store_fail_when_no_deposit_provided() {
        assert_panic!({
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = DelugeBase::default();
            let store: Store = Store {
                id: "fabrics-delivery.test.near".to_string(),
                lat_lng: LatLng {
                    latitude: 43.651070,
                    longitude: -79.347015,
                },
                address: "21/3 Main Street Gandhi Nagar".to_string(),
                name: "Fabrics Delivery".to_string(),
                country: "India".to_string(),
                state: "Delhi".to_string(),
                logo: "https://ramesh_store.com/logo.png".to_string(),

                website: "https://ramesh_store.com".to_string(),
                city: "South Delhi".to_string(),
                products: vec![]
            };
            contract.create_store(store);
        }, String, starts with "assertion failed:");
    }

    // TEST: create store fails when pred account doesn't match
    #[test]
    fn test_create_store_fail_when_pred_account_does_not_match() {
        assert_panic!({
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = DelugeBase::default();
            let store: Store =  Store {
                id: "fabrics-delivery.test.near".to_string(),
                lat_lng: LatLng {
                    latitude: 43.651070,
                    longitude: -79.347015,
                },
                address: "21/3 Main Street Gandhi Nagar".to_string(),
                name: "Fabrics Delivery".to_string(),
                country: "India".to_string(),
                state: "Delhi".to_string(),
                logo: "https://ramesh_store.com/logo.png".to_string(),

                website: "https://ramesh_store.com".to_string(),
                city: "South Delhi".to_string(),
                products: vec![]
            };
            contract.create_store(store);
        }, String, starts with "assertion failed:");
    }

    // TEST: create store success
    #[test]
    fn test_create_store_success() {
        let mut context = get_context(vec![], false);
        context.attached_deposit = 1;
        context.predecessor_account_id = "fabrics-delivery.test.near".to_string();
        testing_env!(context);
        let mut contract = DelugeBase::default();
        let store: Store = Store {
            id: "fabrics-delivery.test.near".to_string(),
            lat_lng: LatLng {
                latitude: 43.651070,
                longitude: -79.347015,
            },
            address: "21/3 Main Street Gandhi Nagar".to_string(),
            name: "Fabrics Delivery".to_string(),
            country: "India".to_string(),
            state: "Delhi".to_string(),
            logo: "https://ramesh_store.com/logo.png".to_string(),
            website: "https://ramesh_store.com".to_string(),
            city: "South Delhi".to_string(),
            products: vec![],
        };
        let result = contract.create_store(store);
        assert_eq!(result, "OK".to_string());
    }

    // TODO: Modify below tests
    #[test]
    fn test_failure_ft_transfer_call_with_incorrect_amounts() {
        assert_panic!(
          {
            let context = get_context(vec![], false);
            testing_env!(context);
            let mut contract = DelugeBase::default();
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
