import React, { useContext, useRef, useState } from "react";
import { BaseContractContext, WalletConnectionContext, WebContext } from "..";

import {
  Grid,
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { Order, Status } from "../utils/interface";
import { parseStatusToUi } from "./account";
import OrderView from "../components/orders/orderView";
import { ATTACHED_GAS } from "./cart";

export const parseStatusToString = (status: any) => {

  if (status === "PENDING") return "pending";
  if (status === "CANCELLED") return "cancelled";
  if (status === "COMPLETED") return "completed";
  if (status === "INTRANSIT") return "intransit";
  if (status === "SCHEDULED") return "scheduled";

  return "pending";
};

const CompleteOrder = () => {
  const instance = useContext(WebContext);
  const base_contract = useContext(BaseContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  const orderRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const fetchOrder = async () => {
    if (orderRef.current !== null && customerRef.current !== null) {
      const orderID = orderRef.current?.value;
      const accountId = customerRef.current?.value;
      console.log(orderID);
      console.log(accountId);
      if (orderID.length === 0 || accountId.length === 0) {
        alert("Make Sure you have inserted Order ID and accountId");
        return;
      }
      setLoading(true);
      // Get the Order Details from the Contract

      try {
        //@ts-ignore
        const res = await base_contract?.retrieve_order({
          customer_account_id: accountId,
          order_id: orderID,
        });

        console.log(res);

        setOrderDetails({
          ...res,
        });
        setLoading(false);
      } catch (e) {
        console.log(e);
        alert("Looks like order you are trying to fetch does not exists!!");
        setLoading(false);
      }
    } else {
      alert("Make Sure you have inserted Order ID and Customer AccountID.");
    }
  };

  const completeOrder = async () => {
    if (secretRef.current !== null && orderDetails !== null) {
      const secret = secretRef.current.value;

      secret.trim();
      if (secret.length > 5) {
        console.log(secret);
        // @ts-ignore
        const response = await base_contract?.complete_order({
          args: {
            orig_seed: secret,
            customer_account_id: orderDetails.customer_account_id,
            order_id: orderDetails.id,
          },
          gas: ATTACHED_GAS,
          amount: "1",
          meta: "complete_order",
        });
      } else {
        alert("Make sure to enter secret correctly. (atleast 5 chars)");
      }
    } else {
      alert("Make Sure you have inserted Secret to Complete Order.");
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={1}></Grid>
      <Grid item xs={12} sm={8}>
        <Paper sx={{ padding: "20px" }}>
          <Typography variant="h4" textAlign={"center"} gutterBottom>
            Complete / View an Order
          </Typography>
          <Divider sx={{ margin: "10px 0px" }} />
          <Typography variant="body1">Enter the Order ID</Typography>
          <TextField
            fullWidth
            placeholder="Type Order ID..."
            sx={{ marginBottom: "20px" }}
            disabled={orderDetails !== null}
            inputRef={orderRef}
          />
          <Typography variant="body1" gutterBottom>
            Enter the User ID
          </Typography>
          <TextField
            fullWidth
            placeholder="Type User ID..."
            disabled={orderDetails !== null}
            sx={{ marginBottom: "20px" }}
            inputRef={customerRef}
          />
          <Button
            variant="contained"
            onClick={fetchOrder}
            disabled={loading || orderDetails !== null}
          >
            {loading ? (
              <CircularProgress color="primary" size={40} />
            ) : (
              "Fetch Order Details"
            )}
          </Button>
          <Divider sx={{ margin: "20px 0px" }} />
          {orderDetails !== null && <OrderView orderDetails={orderDetails} />}
          <Divider sx={{ margin: "10px 0px" }} />
        
          {orderDetails !== null &&
            parseStatusToString(orderDetails.status) !== "intransit" && (
              <Typography color="error" variant="caption" gutterBottom>
                Only Intransit Orders can be Completed !!
              </Typography>
            )}
          {orderDetails !== null &&
            parseStatusToString(orderDetails.status) === "intransit" && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Enter the Secret to Complete Order
                </Typography>
                <TextField
                  fullWidth
                  label="Secret"
                  placeholder="Type Secret Here..."
                  sx={{ marginBottom: "20px" }}
                  inputRef={secretRef}
                />
                <Button variant="contained" color="success" onClick={completeOrder}>
                  Complete the Order
                </Button>
              </Box>
            )}
        </Paper>
      </Grid>
      <Grid item xs={12} sm={2}></Grid>
    </Grid>
  );
};

export default CompleteOrder;
