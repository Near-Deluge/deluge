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
  pub_key: String;
  products: Array<String>;
}

export interface Product {
  pid: string;
  cid: CIDString;
  media: string;
  inventory: Number;
  name: string;
  // Price will be a string as U128 expects a string
  price: string;
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

// Storage Specification for Ordering Details
export interface Order_Specification {
  name: String;
  address: String;
  district: String;
  state: String;
  country: String;
  pincode: String;
  phone?: String;
  email: String;
  userId: String;
  // orderId: String;
}

export enum Status {
  PENDING,
  INTRANSIT,
  COMPLETED,
  SCHEDULED,
  CANCELLED,
}

export interface LineItem {
  count: Number;
  product_id: string;
  // Price will be a string as U128 expects a string
  price: string;
}

export interface Order {
  id: string;
  customer_account_id: string;
  seller_id: string;
  status: Status;
  cid: CIDString;
  customer_secret: string;
  payload: {
    amount: string;
    line_items: Array<LineItem>;
  };
}

export interface Rating {
  buyer: string;
  cid: string | null;
  rate: number;
  status: "UNRATED" | "RATED";
}

export interface Rating_Storage {
  buyer_id: string;
  seller_id: string;
  product_id: string;
  body: string;
  image?: Array<string>;
  videos?: Array<string>;
}

export interface LocalAddress {
  name: string,
  email: string,
  address: string,
  state: string,
  country: string,
  pincode: string,
  district: string,
  phone: string
}