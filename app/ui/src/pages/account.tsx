import { Balance } from "@mui/icons-material";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  TextField,
} from "@mui/material";
import React, { useContext, useRef } from "react";
import {
  BaseContractContext,
  DLGTContractContext,
  WalletConnectionContext,
} from "..";
import { ONE_NEAR } from "../config";

import BN from "big.js";
import { useSelector } from "react-redux";
import { Order } from "../utils/interface";
import { change_stable_to_human } from "../utils/utils";
import { Status } from "../utils/interface";
import { ATTACHED_GAS } from "./cart";

export const parseStatusToUi = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Chip color="info" label="PENDING" />;
    case "INTRANSIT":
      return <Chip color="secondary" label="INTRANSIT" />;
    case "COMPLETED":
      return <Chip color="success" label="COMPLETED" />;
    case "SCHEDULED":
      return <Chip color="primary" label="SCHEDULED" />;
    case "CANCELLED":
      return <Chip color="error" label="CANCELLED" />;
  }
};

const Account = () => {
  const base_contract = useContext(BaseContractContext);
  const dlgt_contract = useContext(DLGTContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const userDetails = useSelector((state: any) => state.contractSlice.user);

  const [contract_details, setContractDetails] = React.useState<{
    stable_balance: any;
    storage_staking: any;
  }>({
    stable_balance: "",
    storage_staking: "",
  });

  const [accountDetails, setAccountDetails] = React.useState<{
    balance: any;
    details: any;
    state: any;
  }>({
    balance: "",
    details: "",
    state: "",
  });

  const [customerOrder, setCustomerOrders] = React.useState<any>([]);
  const [shopOrder, setShopOrders] = React.useState<any>([]);

  React.useEffect(() => {
    (async () => {
      if (userDetails.store) {
        // @ts-ignore
        const storeOrder = await base_contract.list_store_orders({
          account_id: walletConnection?.getAccountId(),
          store_account_id: walletConnection?.getAccountId(),
        });

        setShopOrders([...storeOrder]);
      }
    })();
  }, [userDetails]);

  const seedRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      const balance = await walletConnection?.account().getAccountBalance();
      const details = await walletConnection?.account().getAccountDetails();
      const state = await walletConnection?.account().state();

      setAccountDetails({
        balance,
        details,
        state,
      });
      // Fetch Token Balance

      const arg = {
        account_id: walletConnection?.getAccountId(),
      };

      // @ts-ignore
      const bal = await dlgt_contract?.ft_balance_of(arg);

      // Get Storage Staking in Deluge Contract
      // @ts-ignore
      const stake = await base_contract?.storage_balance_of({
        ...arg,
      });

      // list_customer_orders
      // @ts-ignore
      const activeOrders = await base_contract.list_customer_orders({
        account_id: walletConnection?.getAccountId(),
        customer_account_id: walletConnection?.getAccountId(),
      });

      setCustomerOrders([...activeOrders]);

      // list this stores order (id already store exists)

      if (userDetails.store) {
        // @ts-ignore
        const storeOrder = await base_contract.list_store_orders({
          account_id: walletConnection?.getAccountId(),
          store_account_id: walletConnection?.getAccountId(),
        });

        setShopOrders([...storeOrder]);
      }

      setContractDetails({
        stable_balance: bal,
        storage_staking: stake,
      });
    })();
  }, []);

  const handleBuy = () => {
    // @ts-ignore
    base_contract.buy_ft({
      args: {},
      amount: new BN(ONE_NEAR).toFixed(0).toString(),
    });
  };

  const cancelOrder = async (order: Order) => {
    console.log("Cancel Order Triggered.");
    // @ts-ignore
    const res = await base_contract?.cancel_order({
      args: {
        customer_account_id: order.customer_account_id,
        order_id: order.id,
      },
      gas: ATTACHED_GAS,
      amount: "1",
      meta: "cancel_order",
    });
    console.log(res);
  };

  const scheduleOrder = async (order: Order) => {
    // @ts-ignore
    const response = await base_contract?.schedule_order({
      args: {
        customer_account_id: order.customer_account_id,
        order_id: order.id,
      },
      gas: ATTACHED_GAS,
      amount: "1",
      meta: "schedule_order",
    });
    console.log(response);
  };

  const intransitOrder = async (order: Order) => {
    //@ts-ignore
    const response = await base_contract?.intransit_order({
      args: {
        customer_account_id: order.customer_account_id,
        order_id: order.id,
      },
      gas: ATTACHED_GAS,
      amount: "1",
      meta: "intransit_order",
    });
    console.log(response);
  };

  const completeOrder = async (order: Order, seed: string) => {
    try {
      // @ts-ignore
      const response = await base_contract?.complete_order({
        args: {
          orig_seed: seed,
          customer_account_id: order.customer_account_id,
          order_id: order.id,
        },
        gas: ATTACHED_GAS,
        amount: "1",
        meta: "complete_order",
      });
      console.log("response", { response });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Paper sx={{ padding: "10px" }}>
      <Typography fontWeight={"bold"} variant="h5" textAlign={"center"}>
        {walletConnection?.getAccountId()}
      </Typography>
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          alignContent={"center"}
          justifyContent={"center"}
          border="1px solid black"
          margin={"10px 0px"}
        >
          <Box>
            <Typography textAlign={"center"} fontWeight="bold" variant="h6">
              Account Stats
            </Typography>
            <Typography>
              {accountDetails.balance &&
                (accountDetails.balance.total / 10 ** 24).toFixed(2)}{" "}
              Near
            </Typography>
            <Typography>
              CodeHash: {accountDetails.state && accountDetails.state.code_hash}
            </Typography>
            <Typography>
              Block Height:{" "}
              {accountDetails.state && accountDetails.state.block_height}
            </Typography>
            <Typography>
              Storage Used:{" "}
              {accountDetails.state && accountDetails.state.storage_usage} bytes
            </Typography>

            <Typography>{}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} padding="10px">
          <Typography fontWeight={"bold"}>Deluge Ecosystem</Typography>
          <Typography color={"primary"}>
            DLG Token Balance:{" "}
            {(contract_details.stable_balance / 10 ** 8).toFixed(2)}
          </Typography>
          <Typography>
            Storage Staking in Deluge Base:{" "}
            {(contract_details.storage_staking / 10 ** 24).toFixed(2)} Near
          </Typography>
          <Button onClick={handleBuy} variant="contained">
            Buy Deluge Tokens
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          {customerOrder.length > 0 ? (
            <Typography>OnGoing Orders</Typography>
          ) : (
            <Typography>
              Looks like you don't have any active order at the moment.
            </Typography>
          )}
          {customerOrder.map((order: any, index: number) => {
            return (
              <Paper sx={{ padding: "10px" }}>
                <Typography>Order ID: {order.id}</Typography>
                <Typography>
                  Customer Secret: {order.customer_secret}
                </Typography>
                <Typography>
                  Order Value: {change_stable_to_human(order.payload.amount)}{" "}
                  DLGT
                </Typography>
                <Typography>Seller ID: {order.seller_id}</Typography>
                <Typography>CID to Address Details: {order.cid}</Typography>
                <Box marginBottom={"20px"}>
                  <Typography>Status</Typography>
                  {parseStatusToUi(order.status)}
                </Box>
                <Box>
                  {order.status === "PENDING" && (
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ marginRight: "10px" }}
                      onClick={() => cancelOrder(order)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {order.status === "INTRANSIT" && (
                    <React.Fragment>
                      <TextField
                        inputRef={seedRef}
                        placeholder="Enter Secret to Complete Order"
                      />
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          if (seedRef.current !== null) {
                            completeOrder(order, seedRef.current.value);
                          }
                        }}
                      >
                        Complete Order
                      </Button>
                    </React.Fragment>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Grid>
        <Grid item xs={12} sm={6}>
          {shopOrder.length > 0 && <Typography>Shop Orders</Typography>}
          {shopOrder.map((order: any, index: number) => {
            return (
              <Paper sx={{ padding: "10px" }}>
                <Typography>Order ID: {order.id}</Typography>
                <Typography>
                  Customer Secret: {order.customer_secret}
                </Typography>
                <Typography>
                  Order Value: {change_stable_to_human(order.payload.amount)}{" "}
                  DLGT
                </Typography>
                <Typography>Seller ID: {order.seller_id}</Typography>
                <Typography>CID to Address Details: {order.cid}</Typography>
                <Box marginBottom={"20px"}>
                  <Typography>Status</Typography>
                  {parseStatusToUi(order.status)}
                </Box>
                <Box>
                  {order.status === "PENDING" && (
                    <React.Fragment>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ marginRight: "10px" }}
                        onClick={() => cancelOrder(order)}
                      >
                        Cancel Order
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => scheduleOrder(order)}
                      >
                        Schedule Order
                      </Button>
                    </React.Fragment>
                  )}
                  {order.status === "SCHEDULED" && (
                    <React.Fragment>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => intransitOrder(order)}
                        sx={{marginRight: "10px"}}
                      >
                        Order INTRASIT
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ marginRight: "10px" }}
                        onClick={() => cancelOrder(order)}
                      >
                        Cancel Order
                      </Button>
                    </React.Fragment>
                  )}
                  
                </Box>
              </Paper>
            );
          })}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Account;
