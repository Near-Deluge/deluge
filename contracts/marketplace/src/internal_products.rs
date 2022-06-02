use crate::*;

#[near_bindgen]
impl DelugeBase {
    // Every Product is associated with it's store
    #[payable]
    pub fn create_product(&mut self, store_id: String, product: Product) -> String {
        assert_one_yocto();
        // TODO: Store keys with storeid : Some mechanism to have predictable key structure
        let mut store = self.stores.get(&store_id).expect("Store does not exist");
        assert!(
            env::predecessor_account_id() == store_id,
            "Only Store Owner can create product"
        );

        let pkey = format!("{}:{}", store_id, product.pid);
        store.products.push(product.pid.clone());

        // TODO: Check if enough NEAR is present in storage costs.
        self.check_storage_product(product.clone());

        // TODO: Check if product already exists in the store.

        // Update the persistent store
        self.products.insert(&pkey, &product);
        self.stores.insert(&store_id, &store);

        "OK".to_string()
    }

    fn check_storage_product(&self, product: Product) {
        // Calculate total borsh bytes for store

        let prod_bytes = product.try_to_vec().unwrap().len() as u128;

        let store_data = self.list_store_products(env::predecessor_account_id());

        let vec_bytes: Vec<usize> = store_data
            .iter()
            .map(|s| s.try_to_vec().unwrap().len())
            .collect();

        let sum_bytes = vec_bytes.into_iter().reduce(|a, b| a + b).unwrap_or(0) as u128;

        let all_bytes = prod_bytes + sum_bytes;

        log!("Sum of all products bytes : {}", all_bytes);

        assert!(
            all_bytes * STORAGE_PRICE_PER_BYTE
                <= self
                    .storage_balance_of(env::predecessor_account_id())
                    .into(),
            "Near is not Enough in Storage Staking to cover storage costs!!"
        );
    }

    pub fn update_product(
        &mut self,
        pid: String,
        store_id: String,
        inventory: Option<U128>,
        cid: Option<String>,
        name: Option<String>,
        price: Option<U128>,
    ) -> String {
        self.stores.get(&store_id).expect("Store does not exist");

        assert!(
            env::predecessor_account_id() == store_id,
            "Only Owner can update his store!!"
        );

        let pkey = format!("{}:{}", store_id, pid);

        let mut product = self.products.get(&pkey).expect("Product does not exist");

        // Mutate Store State
        match price {
            Some(x) => product.price = x,
            None => {}
        }
        match name {
            Some(x) => product.name = x,
            None => {}
        }
        match inventory {
            Some(x) => product.inventory = x,
            None => {}
        }
        match cid {
            Some(x) => product.cid = x,
            None => {}
        }

        // TODO: Check if enough NEAR is present in storage costs.
        self.check_storage_product(product.clone());

        self.products.insert(&pkey, &product);

        "OK".to_string()
    }

    pub fn delete_product(&mut self, store_id: String, pid: String) -> String {
        let mut store = self.stores.get(&store_id).expect("Store doesn't exits. ");

        // TODO: Once product is deleted successfully refund the storage to the store owner.

        let pkey = format!("{}:{}", store_id, pid);
        self.products.get(&pkey).expect("Product doesn't exists!!");

        assert!(
            env::predecessor_account_id() == store.id,
            "Only Store owner can delete his own product!!"
        );

        // Find the index from the products vector
        let index = store.products.iter().position(|p| *p == pid).unwrap();

        store.products.remove(index);

        self.products.remove(&pkey);
        self.stores.insert(&store_id, &store);

        "OK".to_string()
    }

    // View Methods
    pub fn retrieve_product(self, store_id: String, pid: String) -> Product {
        let pkey = format!("{}:{}", store_id, pid);
        self.products
            .get(&pkey)
            .expect("Product does not exists!")
            .clone()
    }
}
