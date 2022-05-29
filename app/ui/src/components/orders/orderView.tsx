import { Grid, Typography, Paper } from "@mui/material";
import React from "react";
import { parseStatusToUi } from "../../pages/account";
import { parseStatusToString } from "../../pages/completeOrder";
import { Order } from "../../utils/interface";

const OrderView: React.FC<{
  orderDetails: Order;
}> = ({ orderDetails }) => {
  const productsView = () => {
    return orderDetails.payload.line_items.map((item, index) => {
      return (
        <Paper key={item.product_id + index} sx={{ padding: "10px" }}>
          <Typography>{`Product ID: ${item.product_id}`}</Typography>
          <Typography>{`Product Qty: ${item.count}`}</Typography>
          <Typography>{`Priced at: ${(parseFloat(item.price) / 10 ** 8).toFixed(
            2
          )} DLGT`}</Typography>
        </Paper>
      );
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={700} textAlign="center">
          {" "}
          Order Details
        </Typography>
      </Grid>
      <Typography gutterBottom variant="h6" fontWeight={600}>
        Order ID: {orderDetails.id}
      </Typography>
      <Grid item xs={12} sm={8}>
        <Typography>Customer ID: {orderDetails.customer_account_id}</Typography>
        <Typography color="primary">
          Seller ID: {orderDetails.seller_id}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography gutterBottom fontWeight={700}>
          Order Status
        </Typography>
        {parseStatusToUi(
          parseStatusToString(orderDetails.status).toUpperCase()
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography gutterBottom fontWeight={700}>
          Hash to Secret: {orderDetails.customer_secret}
        </Typography>
      </Grid>
      <Typography variant="body2" fontWeight={600} color={"primary"}>
        Total Amount Locked:{" "}
        {(parseFloat(orderDetails.payload.amount) / 10 ** 8).toFixed(2)} DLGT
      </Typography>
      <Grid item xs={12}>
        {productsView()}
      </Grid>
    </Grid>
  );
};

export default OrderView;
