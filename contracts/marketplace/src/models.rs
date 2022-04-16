
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::BorshStorageKey;
use near_sdk::{AccountId};

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    Stores,
    Orders, 
    Products,
    StorageDeposits // ByOwnerId,
            // ByOwnerIdInner { account_id_hash: CryptoHash },
            // ByNFTContractId,
            // ByNFTContractIdInner { account_id_hash: CryptoHash },
            // ByNFTTokenType,
            // ByNFTTokenTypeInner { token_type_hash: CryptoHash },
            // FTTokenIds,
            // StorageDeposits
}

// // Scrapyard Code
// #[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
// #[serde(crate = "near_sdk::serde")]
// //TODO: Each currency will have a rate associated with the stable coin of the marketplace itself.
// pub struct Currency {
//     name: String,
//     symbol: [u8; 3],
//     // Rate is how much you can get for 1 Stable Coin.
//     // Consider if user wants to but with near and near rate is 10$ , now considering marketplace stablecoin is pegged to the 1$ mark rate then,
//     // rate would be 1N = 10 Stable Coins => rate = 10
//     // Considering precision of 8.
//     precision: u8,
//     address: AccountId,
//     rate: u32
// }

// Each product will mainly have a CID whose content will be according to the product specification
// Will help to accurately find the at which price product is listed and can find product market pricing listing in past from the indexers
// No need to have currency as we will be using DELUGE TOKEN
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Product {
    pub pid: String,
    pub cid: String,
    pub price: U128, 
    pub inventory: U128,
    pub name: String,
}

// Latitude and Longitude Structure.
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct LatLng {
    pub latitude: f64,
    pub longitude: f64,
}

// Store Structure and Store Details
// Stores will have products nested inside it, will be easier to calculate storage costs.
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Store {
    pub id: String,
    pub lat_lng: LatLng,
    pub address: String,
    pub name: String,
    pub website: String,
    pub logo: String, // CID or link to the hosted logo
    pub country : String,
    pub state: String,
    pub city: String,
    pub products: Vec<String>
}

// Payload that will be sent to the FT Contract which will hook to the callback for this conrtacts callback function.
// Payload.
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct OrderPayload {
    // pub token: String, // This is the stablecoin token - we'll know if it is usdt or inr, cad etc.
    pub amount: U128, // this is how much we received in the stablecoin
    pub line_items: Vec<LineItem>,
}

//  Every line item will have a price also associated as products can have dynamic pricing as per product demand and supply. 
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct LineItem {
    pub product_id: String,
    pub count: u32,
    pub price: U128
}

//  This structure helps finding the current status of Active Order.
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum OrderStatus {
    PENDING, SCHEDULED, COMPLETED, INTRANSIT, CANCELLED
}

// If from cart user selects different sellers, try to make multiple transactions in that case to keep contracts simple.
// This is a active order.
// Each Order will have address, phone no. and email address, which will be encrypted by seller public key. (or theit implicit account id for the store account.)
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Order {
    pub id: String,
    pub customer_account_id: String,
    pub seller_id: AccountId,
    pub cid: String,
    pub payload: OrderPayload,
    pub status: OrderStatus,
    pub customer_secret: String,
}
