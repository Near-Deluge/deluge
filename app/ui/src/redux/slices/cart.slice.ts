import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LineItem, Order, Product, Status, Store } from "../../utils/interface";

import { v4 as uuid } from "uuid";
import { store } from "../store";

export interface CartState {
  items: Array<Product>;
  orders: Array<Order>;
  total: string;
}

const blank_order: Order = {
  id: "",
  customer_account_id: "",
  seller_id: "",
  status: Status.PENDING,
  cid: "",
  customer_secret: "",
  payload: {
    amount: "",
    line_count: [],
  },
};

const initialState = {
  items: [],
  orders: [],
  total: "0",
} as unknown as CartState;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{ product: Product; store: Store; qty: number }>
    ) {
      // Check if already present
      if (
        state.items.filter((item) => item.pid === action.payload.product.pid)
          .length === 0
      ) {
        state.total = (
          parseFloat(state.total) + parseFloat(action.payload.product.price)
        ).toString();
        state.items = [action.payload.product, ...state.items];
        // Find the seller for this product and prefill Order Details in here.
        // Order should be in format for each seller one order.
        
        let res = state.orders.filter(
          (order) => order.seller_id === action.payload.store.id
        );
        if (res.length > 0) {
          // Order for this seller already exist so update that one
          let update_order = res[0];
          
          // Check is this order contains this product.
          let res2 = update_order.payload.line_count.filter(
            (item: LineItem) => item.product_id === action.payload.product.pid
          );

          if (res2.length > 0) {
            // Product Already Exists on LineItem
            let newLineItem = res2[0];
            newLineItem = {
              ...newLineItem,
              count: action.payload.qty,
            };
            let newLineCount = update_order.payload.line_count.filter(
              (item: LineItem) => item.product_id !== action.payload.product.pid
            );
            newLineCount = [...newLineCount, newLineItem];
            update_order.payload.line_count = newLineCount;
          } else {
            // Product is not on the LineItem
            update_order.payload.line_count = [
              ...update_order.payload.line_count,
              {
                price: action.payload.product.price,
                count: action.payload.qty,
                product_id: action.payload.product.pid,
              },
            ];
          }
          
          // Order Values have been update here
          let newOrders = state.orders.filter(
            (item: Order) => item.seller_id !== action.payload.store.id
          );

          newOrders = [...newOrders, update_order];
          state.orders = newOrders;
        } else {
          // Order does not exist yet.
          // Create a new Order with this product as only payload item
          let new_order: Order = {
            ...blank_order,
            id: uuid(),
            seller_id: action.payload.store.id.toString(),
            payload: {
              ...blank_order.payload,
              line_count: [
                ...blank_order.payload.line_count,
                {
                  price: action.payload.product.price,
                  count: action.payload.qty,
                  product_id: action.payload.product.pid,
                },
              ],
            },
          };
          state.orders = [...state.orders, new_order];
        }

        // Calculate Totals for Ordering
        
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      let newState = state.items.filter((item) => {
        if (item.pid === action.payload) {
          state.total = (
            parseFloat(state.total) - parseFloat(item.price)
          ).toString();
        }
        return item.pid !== action.payload;
      });

      state.items = [...newState];
    },
    setState(state, action: PayloadAction<CartState>) {
      state = action.payload;
    },
  },
});

export const { addItem, setState, removeItem } = cartSlice.actions;

export default cartSlice.reducer;
