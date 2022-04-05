use crate::*;

#[near_bindgen]
impl DelugeBase {
    // Every Product is associated with it's product
    #[payable]
    pub fn create_product(&mut self, store_id: String, product: Product) -> String {
        assert_one_yocto();
        // TODO: Store keys with storeid : SOme mechanism to have predictable key structure
        let mut store = self.stores.get(&store_id).expect("Store does not exist");

        let pkey = format!("{}:{}", store_id, product.pid);
        store.products.push(product.pid.clone());

        // Update the persistent store
        self.products.insert(&pkey, &product);
        self.stores.insert(&store_id, &store);

        "OK".to_string()
    }
    pub fn retrieve_product(self, store_id: String, pid: String) -> Product {
        // Match the cid and return the dereferenced value back
        let pkey = format!("{}:{}", store_id, pid);
        self.products
            .get(&pkey)
            .expect("Product does not exists!")
            .clone()
    }
    pub fn update_product(
        &mut self,
        pid: String,
        store_id: String,
        inventory: Option<u128>,
        cid: Option<String>,
        name: Option<String>,
        price: Option<u128>,
    ) -> String {
        self.stores.get(&store_id).expect("Store does not exist");

        let pkey = format!("{}:{}", store_id, pid);

        let mut product = self.products.get(&pkey).expect("Product does not exist");

        // Mutate Store State
        match price {
            Some(x) => product.price = U128::from(x),
            None => {}
        }
        match name {
            Some(x) => product.name = x,
            None => {}
        }
        match inventory {
            Some(x) => product.inventory = U128::from(x),
            None => {}
        }
        match cid {
            Some(x) => product.cid = x,
            None => {}
        }

        self.products.insert(&pkey, &product);

        "OK".to_string()
    }
    pub fn delete_product(&mut self, store_id: String, pid: String) -> String {
        assert_one_yocto();
        // TODO: Delete product
        self.stores.get(&store_id).expect("Store doesn't exits. ");

        self.products.remove(&pid);
        
        "OK".to_string()

        // TODO: Refund storage
    }
}
