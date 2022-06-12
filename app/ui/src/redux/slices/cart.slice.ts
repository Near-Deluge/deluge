import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LineItem, Order, Product, Status, Store } from "../../utils/interface";

import { v4 as uuid } from "uuid";

import { change_stable_to_human } from "../../utils/utils";

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
    amount: "0",
    line_items: [],
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
      // Find the seller for this product and prefill Order Details in here.
      // Order should be in format for each seller one order.

      let res = state.orders.filter(
        (order) => order.seller_id === action.payload.store.id
      );
      if (res.length > 0) {
        // Order for this seller already exist so update that one
        let update_order = res[0];

        // Check is this order contains this product.
        let res2 = update_order.payload.line_items.filter(
          (item: LineItem) => item.product_id === action.payload.product.pid
        );

        if (res2.length > 0) {
          // Product Already Exists on LineItem
          let newLineItem = res2[0];
          newLineItem = {
            ...newLineItem,
            count: action.payload.qty,
          };
          let newLineCount = update_order.payload.line_items.filter(
            (item: LineItem) => item.product_id !== action.payload.product.pid
          );
          newLineCount = [...newLineCount, newLineItem];
          update_order.payload.line_items = newLineCount;
        } else {
          // Product is not on the LineItem
          update_order.payload.line_items = [
            ...update_order.payload.line_items,
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
            line_items: [
              ...blank_order.payload.line_items,
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

      let newOrders = state.orders.map((order: Order) => {
        let lineItemTotal = order.payload.line_items.reduce(
          (total, nextElem) => {
            return (
              total +
              parseFloat(nextElem.price) * parseInt(nextElem.count.toString())
            );
          },
          0
        );

        order.payload.amount = lineItemTotal.toString();

        return order;
      });
      state.orders = [...newOrders];
    },
    setQuantityItem(
      state,
      action: PayloadAction<{
        seller_id: string;
        product_id: string;
        qty: number;
      }>
    ) {
      let oldOrder = state.orders.filter(
        (order: Order) => order.seller_id === action.payload.seller_id
      );
      if (oldOrder.length > 0) {
        let payloadItem = oldOrder[0].payload.line_items.filter(
          (lineItem: LineItem) =>
            lineItem.product_id === action.payload.product_id
        );
        if (payloadItem.length > 0) {
          let modItem = payloadItem[0];
          modItem.count = action.payload.qty;
          let newPayload = oldOrder[0].payload.line_items.filter(
            (lineItem: LineItem) =>
              lineItem.product_id !== action.payload.product_id
          );
          newPayload = [...newPayload, modItem];

          // New Order Item
          let orderItem: Order = {
            ...oldOrder[0],
            payload: {
              ...oldOrder[0].payload,
              line_items: newPayload,
            },
          };

          // Mutate the State
          let newOrders = state.orders.filter(
            (item: Order) => item.seller_id !== action.payload.seller_id
          );
          state.orders = [...newOrders, orderItem];
        }
      }

      // Calculate Totals for Ordering

      let newOrders = state.orders.map((order: Order) => {
        let lineItemTotal = order.payload.line_items.reduce(
          (total, nextElem) => {
            return (
              total +
              parseFloat(nextElem.price) * parseInt(nextElem.count.toString())
            );
          },
          0
        );

        order.payload.amount = lineItemTotal.toString();

        return order;
      });
      state.orders = [...newOrders];
    },
    removeItem(
      state,
      action: PayloadAction<{
        orderId: string;
        productId: string;
      }>
    ) {
    
      let oldStateOrders = [...state.orders];

      let res1 = oldStateOrders.filter(
        (order: Order) => order.id === action.payload.orderId
      );
      if (res1.length > 0) {
        let payloadItemsNew = res1[0].payload.line_items.filter(
          (lineItem: LineItem) =>
            lineItem.product_id !== action.payload.productId
        );
        let newOrderObj: Order = { ...blank_order };
        newOrderObj = {
          ...res1[0],
          payload: {
            ...res1[0].payload,
            line_items: [...payloadItemsNew],
          },
        };

        let allOrderExceptThis = oldStateOrders.filter(
          (order: Order) => order.id !== action.payload.orderId
        );

        if (newOrderObj.payload.line_items.length === 0) {
          state.orders = [...allOrderExceptThis];
        } else {
          state.orders = [...allOrderExceptThis, newOrderObj];
        }
      }

      // Calculate Totals for Ordering

      let newOrders = state.orders.map((order: Order) => {
        let lineItemTotal = order.payload.line_items.reduce(
          (total, nextElem) => {
            return (
              total +
              parseFloat(nextElem.price) * parseInt(nextElem.count.toString())
            );
          },
          0
        );

        order.payload.amount = lineItemTotal.toString();

        return order;
      });
      state.orders = [...newOrders];
    },
    setState(state, action: PayloadAction<CartState>) {
      state = action.payload;
    },
  },
});

export const { addItem, setState, removeItem, setQuantityItem } =
  cartSlice.actions;

export default cartSlice.reducer;
