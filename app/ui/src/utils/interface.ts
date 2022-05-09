
//@ts-ignore
import { CIDString } from "web3.storage";

 
export interface Store {
  id: String;
  address: String;
  name: String;
  lat_lng: {
    latitude: Number;
    longitude: Number;
  };
  website: String;
  logo?: String;
  country: String;
  state: String;
  city: String;
  products: Array<String>;
}

export interface Product {
  pid: String;
  cid: CIDString;
  inventory: Number;
  name: String;
  // Price will be a string as U128 expects a string
  price: String;
}

// Product Details for Storing
export interface Product_Storage {
  name: String;
  product_id: String;
  description: String;
  brand: String;
  category: Array<String>;
  usecase: String;
  physical_details: {
    dimensions: {
      h: Number;
      w: Number;
      l: Number;
      unit: String;
    };
    size: String;
    weight: {
      value: Number;
      unit: String;
    };
  };
  images: Array<any>;
  videos: Array<any>;
  expected_delivery: String;
  available_in: Array<String>;
  additiional_detials?: any;
}