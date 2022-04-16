import { BaseAPI } from "./base";
import {
  Order_Specification,
  Countries,
  Catergories,
  Product_Storage,
} from "./models";

const API = new BaseAPI();

let sample_order: Order_Specification = {
  address: "2/24E Gandhi Nagar, Old Delhi",
  country: Countries.India,
  district: "Delhi",
  email: "sample@email.com",
  pincode: "4400001",
  phone: "99103423287",
};

let sample_product: Product_Storage = {
  name: "Super Cool Watergun",
  product_id: "SKU-00045",
  description:
    "A Super Cool Water Gun which can even push moon further. Super Durable and Build like a metal.",
  brand: "NESKO",
  category: [Catergories.Others, Catergories.Utility],
  usecase: "PLay thing and Super Cool to show off.",
  physical_details: {
    dimensions: {
      h: 23,
      w: 34,
      l: 54,
      unit: "inch",
    },
    size: "L",
    weight: {
      value: 36.5,
      unit: "Kg"
    },
  },
  images: [],
  videos: [],
  expected_delivery: "3 Days all India",
  available_in: [],
};



(async () => {
  let cid = await API.uploadFile(
    API.getFileFromJSON(sample_product, "product_1.deluge")
  );
  console.log("Uploaded Successfully with CID: ", cid);

  if (cid) {
    let res = await API.getFile(cid);
    console.log(res);
    if (res) {
      let JSON = await API.getJSONFromFile(res[0]);
      console.log("Parse JSON: ", JSON);
    }
  }
})();
