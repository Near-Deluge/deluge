import React from "react";
import { useSelector } from "react-redux";
import { LineItem, Order } from "../utils/interface";

const useProductIsInCart = (
  productId: string,
  sellerId: string
): { isInCart: boolean, orderId: string } => {
  const cartOrders = useSelector((state: any) => state.cartSlice.orders);

  let isInCart = false;
  let orderId: string = "";
  let sellerOrder = cartOrders.filter(
    (order: Order) => order.seller_id === sellerId
  );

  if (sellerOrder.length > 0) {
    let prodInCart = sellerOrder[0].payload.line_items.filter(
      (lineItem: LineItem) => lineItem.product_id === productId
    );
    if (prodInCart.length > 0) {
      isInCart = true;
      orderId = sellerOrder[0].id
    }
  }
  return { isInCart, orderId };
};

export default useProductIsInCart;
