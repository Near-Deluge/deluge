import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import React, { useContext, useRef } from "react";
import {
  BaseContractContext,
  DLGTContractContext,
  KeyStoreContext,
  WalletConnectionContext,
  WebContext,
} from "..";
import { ONE_NEAR } from "../config";

import BN from "big.js";
import { useSelector } from "react-redux";
import { Order } from "../utils/interface";
import { change_stable_to_human } from "../utils/utils";
import { Status } from "../utils/interface";
import { ATTACHED_GAS } from "./cart";
import { CIDString } from "web3.storage";
import bs58 from "bs58";

// Icons
// @ts-ignore
import { Icon } from "react-icons-kit";
import { ecommerce_money } from "react-icons-kit/linea/ecommerce_money";
import { shield } from "react-icons-kit/fa/shield";
import { hashtag } from "react-icons-kit/fa/hashtag";
import { pigMoney } from "react-icons-kit/metrize/pigMoney";

// @ts-ignore
import { ecDecrypt } from "deluge-helper";
import DelugeIcon from "../icons/deluge";
import { AccountBox, AddCircle } from "@mui/icons-material";
import { PaddedDividerSpacer } from "./product";
import useLocalStorageKey from "../hooks/useLocalStorageKey";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

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
  const web3Instance = useContext(WebContext);
  const userDetails = useSelector((state: any) => state.contractSlice.user);

  const { enqueueSnackbar } = useSnackbar();
  const navigation = useNavigate();

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

  const [decryptedShopOrder, setDecryptedShopOrder] = React.useState<any>({});
  const [localKeyPair] = useLocalStorageKey();

  const getDecryptedAddress = (cid: CIDString) => {
    (async () => {
      if (
        decryptedShopOrder[cid] === undefined ||
        decryptedShopOrder[cid] === null
      ) {
        const instance = await web3Instance;

        const res = await instance.get(cid);
        if (res && res.ok) {
          const files = await res.files();
          const content = await files[0].text();

          if (localKeyPair.secretKey && localKeyPair.secretKey.length > 0) {
            
            const userPrivateKey = bs58.decode(localKeyPair.secretKey.split("ed25519:")[1]);

            let dataObj = JSON.parse(content);

            const decryptedData = ecDecrypt(
              dataObj.encryptedData,
              dataObj.encryptedKey,
              dataObj.ephPubKey,
              dataObj.authTag,
              userPrivateKey
            );

            const decryptedAddress = JSON.parse(
              Buffer.from(decryptedData.decrypted[0]).toString()
            );

            setDecryptedShopOrder({
              ...decryptedShopOrder,
              [cid]: decryptedAddress,
            });
          } else {
            enqueueSnackbar("Import Your Shop SeedPhrases!!");
            navigation("/recover_shop_seeds", {replace: true});
          }
        }
      }
    })();

    let objVal = decryptedShopOrder[cid];

    if (objVal) {
      return (
        <Box>
          <Typography>Customer Name: {objVal.name}</Typography>
          <Typography color="primary" variant="caption">
            Customer Account: {objVal.userId}
          </Typography>
          <Typography variant="body2" fontWeight={"bold"}>
            Customer Email: {objVal.email}
          </Typography>
          <Typography variant="body2" fontWeight={"bold"}>
            Customer Phone No.: {objVal.phone}
          </Typography>
          <Typography variant="body2" fontWeight={"bold"}>
            Customer Address: {objVal.address}, {objVal.district},{" "}
            {objVal.state}, {objVal.country}
          </Typography>
          <Typography variant="body2" fontWeight={"bold"}>
            Customer PinCode: {objVal.pincode}
          </Typography>
        </Box>
      );
    }
    return <Typography color="error">Address Not Decrypted Yet</Typography>;
  };

  return (
    <Paper sx={{ padding: "10px" }}>
      <Typography
        fontWeight={"bold"}
        variant="h5"
        textAlign={"center"}
        color="primary"
      >
        {walletConnection?.getAccountId()}
      </Typography>
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          alignContent={"center"}
          justifyContent={"center"}
          margin={"10px 0px"}
        >
          <Paper sx={{ padding: "10px" }}>
            <Typography textAlign={"center"} fontWeight="bold" variant="h6">
              Account Stats
            </Typography>
            {accountDetails.balance ? (
              <Grid container>
                <Grid item xs={12} sm={6} sx={{ paddingRight: "10px" }}>
                  <Grid container alignItems={"center"}>
                    <Icon icon={ecommerce_money} size={32} color={"#0000ff"} />
                    <Typography
                      fontWeight={"bold"}
                      sx={{ marginLeft: "5px" }}
                      fontSize={24}
                    >
                      {accountDetails.balance &&
                        (accountDetails.balance.total / 10 ** 24).toFixed(
                          2
                        )}{" "}
                      Near
                    </Typography>
                  </Grid>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    CodeHash:{" "}
                    {accountDetails.state && accountDetails.state.code_hash}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    Block Height:{" "}
                    {accountDetails.state && accountDetails.state.block_height}
                  </Typography>
                  <Typography>
                    Storage Used:{" "}
                    {accountDetails.state && accountDetails.state.storage_usage}{" "}
                    bytes
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <CircularProgress color="primary" />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} margin="10px 0px">
          <Grid item xs={12} sm={6}>
            <Paper sx={{ padding: "10px" }}>
              <Typography fontWeight={"bold"} variant="h5">
                Deluge Ecosystem
              </Typography>
              <PaddedDividerSpacer v_m={15} />
              <Grid container>
                <DelugeIcon />
                <Typography color={"primary"} sx={{ marginLeft: "5px" }}>
                  Balance:{" "}
                  {change_stable_to_human(contract_details.stable_balance)} DLGT
                </Typography>
              </Grid>
              <Typography>
                Storage Staking in Deluge Base:{" "}
                {(contract_details.storage_staking / 10 ** 24).toFixed(2)} Near
              </Typography>
              <PaddedDividerSpacer v_m={10} />
              <Button onClick={handleBuy} variant="outlined">
                <Typography sx={{ textTransform: "none", marginRight: "10px" }}>
                  Buy
                </Typography>
                <DelugeIcon />
              </Button>
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ paddingRight: "5px" }}>
          <Paper sx={{ padding: "10px" }}>
            <Typography textAlign={"center"} variant="h5" fontWeight={"bold"}>
              Your Orders
            </Typography>
            {customerOrder.length > 0 ? (
              <Typography fontWeight={"bold"}>OnGoing Orders</Typography>
            ) : (
              <Typography>
                Looks like you don't have any active order at the moment.
              </Typography>
            )}

            {customerOrder.map((order: any, index: number) => {
              return (
                <Paper
                  sx={{ padding: "10px", margin: "10px 0px" }}
                  key={order.cid}
                >
                  <Typography
                    color={"primary"}
                    textAlign="center"
                    fontWeight={"bold"}
                  >
                    ID: {order.id}
                  </Typography>
                  <Typography
                    sx={{ wordBreak: "break-word" }}
                    fontWeight="bold"
                  >
                    <Icon icon={shield} /> Hashed Secret <Icon icon={hashtag} />
                    {order.customer_secret}
                  </Typography>
                  <PaddedDividerSpacer v_m={10} />
                  <Grid container>
                    <Typography sx={{ marginRight: "5px" }} gutterBottom>
                      Order Value:{" "}
                      {change_stable_to_human(order.payload.amount)}{" "}
                    </Typography>
                    <DelugeIcon size={18} />
                  </Grid>
                  <Typography color="primary">
                    Seller's <AccountBox />: {order.seller_id}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-all" }}>
                    Address Details: {order.cid}
                  </Typography>
                  <Grid container alignItems={"center"}>
                    <Typography marginRight={"5px"} fontWeight="bold">
                      Current status:{" "}
                    </Typography>
                    {parseStatusToUi(order.status)}
                  </Grid>
                  <PaddedDividerSpacer v_m={15} />
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
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ paddingLeft: "5px" }}>
          <Paper sx={{ padding: "10px" }}>
            <Typography textAlign={"center"} variant="h5" fontWeight={"bold"}>
              Shop Orders
            </Typography>
            {shopOrder.length > 0 ? (
              <Typography fontWeight={"bold"}>Ongoing Orders</Typography>
            ) : (
              <Typography fontWeight={"bold"}>
                No Ongoing Shop Orders.
              </Typography>
            )}
            {shopOrder.map((order: any, index: number) => {
              return (
                <Paper
                  sx={{ padding: "10px", margin: "10px 0px" }}
                  key={order.id}
                >
                  <Typography
                    color={"primary"}
                    textAlign="center"
                    fontWeight={"bold"}
                  >
                    ID: {order.id}
                  </Typography>
                  <Typography
                    sx={{ wordBreak: "break-word" }}
                    fontWeight="bold"
                  >
                    <Icon icon={shield} /> Hashed Secret <Icon icon={hashtag} />
                    {order.customer_secret}
                  </Typography>
                  <PaddedDividerSpacer v_m={10} />
                  <Grid container>
                    <Typography sx={{ marginRight: "5px" }} gutterBottom>
                      Order Value:{" "}
                      {change_stable_to_human(order.payload.amount)}{" "}
                    </Typography>
                    <DelugeIcon size={18} />
                  </Grid>
                  <Typography color="primary">
                    Seller's <AccountBox />: {order.seller_id}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-all" }}>
                    Address Details: {order.cid}
                  </Typography>
                  <Grid container alignItems={"center"}>
                    <Typography marginRight={"5px"} fontWeight="bold">
                      Current status:{" "}
                    </Typography>
                    {parseStatusToUi(order.status)}
                  </Grid>
                  <PaddedDividerSpacer v_m={15} />
                  <Paper
                    elevation={4}
                    sx={{ padding: "10px 20px", margin: "10px 0px" }}
                  >
                    <Typography fontWeight={"bold"} gutterBottom>
                      Decrypted User Details
                    </Typography>
                    <Divider />
                    {getDecryptedAddress(order.cid)}
                  </Paper>
                  <PaddedDividerSpacer v_m={15} />
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
                          sx={{ marginRight: "10px" }}
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
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Account;
