import { createSlice, PayloadAction, Store } from "@reduxjs/toolkit";

import { Product, Product_Storage } from "../../utils/interface";

export interface ProductsState {
  userProducts: Array<Product>;
  allProducts: Array<Product>;
  product_to_store: any;
  user_cid_details: Array<Product_Storage>;
  all_cid_details: Array<Product_Storage>;
  allCids: { [key: string]: Product_Storage };
}

const initialState = {
  userProducts: [],
  allProducts: [],
  product_to_store: {},
  user_cid_details: [],
  all_cid_details: [],
  allCids: {},
} as ProductsState;

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setUserProducts(state, action: PayloadAction<Array<Product>>) {
      state.userProducts = action.payload;
    },
    addUserProduct(state, action: PayloadAction<Product>) {
      state.userProducts = [action.payload, ...state.userProducts];
    },
    removeOneUserProduct(state, action: PayloadAction<string>) {
      state.userProducts = state.userProducts.filter(
        (item) => item.pid !== action.payload
      );
    },
    addOneCidUserDetails(state, action: PayloadAction<Product_Storage>) {
      // Do a checked Add
      let res = state.user_cid_details.filter(
        (item) => item.product_id === action.payload.product_id
      );
      if (res.length === 0) {
        state.user_cid_details = [action.payload, ...state.user_cid_details];
      }
      // In Else case object will be already in the state
    },
    addOneCidAllUserDetails(state, action: PayloadAction<Product_Storage>) {
      // Do a checked Add
      let res = state.all_cid_details.filter(
        (item) => item.product_id === action.payload.product_id
      );
      if (res.length === 0) {
        state.all_cid_details = [action.payload, ...state.all_cid_details];
      }
      // In Else case object will be already in the state
    },
    removeOneCidUserDetails(state, action: PayloadAction<string>) {
      state.user_cid_details = state.user_cid_details.filter(
        (item) => item.product_id !== action.payload
      );
    },
    addAllProducts(state, action: PayloadAction<Array<Product>>) {
      state.allProducts = [...action.payload, ...state.allProducts];
    },
    setAllProducts(state, action: PayloadAction<Array<Product>>) {
      state.allProducts = action.payload;
    },
    addOneAllProducts(state, action: PayloadAction<Product>) {
      state.allProducts = [action.payload, ...state.allProducts];
    },
    removeOneAllProduct(state, action: PayloadAction<string>) {
      state.allProducts = state.allProducts.filter(
        (item) => item.pid !== action.payload
      );
    },
    setProductToStore(state, action: PayloadAction<any>) {
      state.product_to_store = action.payload;
    },
    addToAllCids(
      state,
      action: PayloadAction<{ cid: string; product_details: Product_Storage }>
    ) {
      let newState = {
        ...state,
      };
      if (state.allCids[action.payload.cid] === undefined) {
        newState.allCids[action.payload.cid] = action.payload.product_details;
      }

      return newState;
    },
  },
});

export const {
  setUserProducts,
  setAllProducts,
  addAllProducts,
  addOneAllProducts,
  addUserProduct,
  removeOneAllProduct,
  removeOneUserProduct,
  addOneCidUserDetails,
  removeOneCidUserDetails,
  addOneCidAllUserDetails,
  addToAllCids
} = productSlice.actions;

export default productSlice.reducer;
