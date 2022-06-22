import {
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  TextField,
  Link as MuiLink,
  MenuItem,
  Modal,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  ListItem,
  Select,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BaseContractContext,
  DLGTContractContext,
  WalletConnectionContext,
  WebContext,
} from "..";
import {
  LineItem,
  LocalAddress,
  Order,
  Order_Specification,
  Product,
  Status,
  Store,
} from "../utils/interface";
import { change_stable_to_human } from "../utils/utils";
import CryptoJS from "crypto-js";
import Randomstring from "randomstring";

// @ts-ignore
import { ecEncrypt } from "deluge-helper";

// Jdenticon doesn't have type interface so ts-ignore
// @ts-ignore
import Jdenticon from "react-jdenticon";

import { Link, useNavigate } from "react-router-dom";
import { removeItem, setQuantityItem } from "../redux/slices/cart.slice";
import { Close, ShuffleOutlined } from "@mui/icons-material";
import { KeyStore } from "near-api-js/lib/key_stores";
import bs58 from "bs58";
import { useSnackbar } from "notistack";
import { PaddedDividerSpacer } from "./product";
import useLocalAddresses from "../hooks/useLocalAddress";

import BigNumber from "big.js";

// Boatload of Gas
export const ATTACHED_GAS = "300000000000000";

function add_two_percent(amount: string) {
  let amt = new BigNumber(amount);
  let two_percent = amt.div(100).mul(2);
  const MAX_FEES = new BigNumber(200000000);

  if (two_percent.cmp(MAX_FEES) !== -1) {
    return amt.add(MAX_FEES).toString();
  } else {
    return amt.add(two_percent).toString();
  }
}

export const AddressForm: React.FC<{
  loading: boolean;
  addressState: Order_Specification;
  secretInputRef: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
  handleSubmitClick: () => any;
  handleClose: () => any;
  handleAddressChange: (e: any) => any;
  localAddresses: Array<LocalAddress>;
  currentAddressIdx: number;
}> = ({
  loading,
  addressState,
  secretInputRef,
  handleChange,
  handleSubmitClick,
  handleClose,
  handleAddressChange,
  localAddresses,
  currentAddressIdx,
}) => {
  useEffect(() => {
    if (secretInputRef.current !== null) {
      secretInputRef.current.value = Randomstring.generate(16);
    }
  }, []);

  return (
    <Grid container maxHeight={"100vh"} sx={{ overflowY: "scroll" }}>
      <Grid item xs={1} />
      <Grid
        item
        xs={10}
        padding={"10px"}
        display="flex"
        alignItems="center"
        justifyContent={"center"}
      >
        <Paper sx={{ padding: "20px" }}>
          <Box display={"flex"}>
            <Typography textAlign={"center"} variant="h4">
              Enter Your Address Details
            </Typography>
            <IconButton onClick={handleClose}>
              <Close color="error" />
            </IconButton>
          </Box>
          <PaddedDividerSpacer v_m={10} />
          <Box display={"flex"} justifyContent={"space-between"}>
            <Link to={"/local_addresses"}>
              {" "}
              <Button variant="contained">View all Addresses </Button>
            </Link>
            {currentAddressIdx >= 0 ? (
              <Select value={currentAddressIdx} onChange={handleAddressChange}>
                {localAddresses.map((item, idx) => {
                  return (
                    <MenuItem
                      value={idx}
                    >{`${item.name} ${item.email}`}</MenuItem>
                  );
                })}
                <MenuItem value={-1}>{"New Address"}</MenuItem>
              </Select>
            ) : (
              <Typography color={"primary"}>Type New Address</Typography>
            )}
          </Box>
          <Divider sx={{ margin: "10px 0px" }} />
          <Box
            sx={{
              maxWidth: "600px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <TextField
              value={addressState.name}
              name="name"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Name"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.email}
              name="email"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Email"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.address}
              name="address"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Address"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.district}
              name="district"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"District/City"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.state}
              name="state"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"State"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.country}
              name="country"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Country"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.pincode}
              name="pincode"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Pincode"}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              value={addressState.phone}
              name="phone"
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Phone/Contact No."}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              sx={{ margin: "10px" }}
              label={"Secret"}
              helperText="Keep this secret until you get you delivery at your place."
              variant="outlined"
              inputRef={secretInputRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        if (secretInputRef.current !== null) {
                          secretInputRef.current.value =
                            Randomstring.generate(16);
                        }
                      }}
                    >
                      <ShuffleOutlined />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSubmitClick}
              disabled={loading}
            >
              {loading ? <CircularProgress /> : "Send Order Details"}
            </Button>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
};

export const CartItem: React.FC<{
  product: Product;
  lineItem: LineItem;
  orderId: string;
}> = ({ product, lineItem, orderId }) => {
  const dispatcher = useDispatch();

  const navigation = useNavigate();

  const allStore = useSelector((state: any) => state.storeSlice.allStore);

  const { enqueueSnackbar } = useSnackbar();

  const getStoreFromPid = (pid: string) => {
    let res = "";
    for (let i = 0; i < allStore.length; ++i) {
      let res2 = allStore[i].products.filter((item: string) => item === pid);
      if (res2.length > 0) {
        return allStore[i].id;
      }
    }
  };

  const handleRemoveItem = () => {
    dispatcher(
      removeItem({
        orderId: orderId,
        productId: lineItem.product_id,
      })
    );

    enqueueSnackbar(
      `Removed Product :${lineItem.product_id} from OrderID: ${orderId}`,
      {
        variant: "info",
      }
    );
  };

  return (
    <Paper sx={{ maxWidth: "500px", padding: "10px", margin: "10px" }}>
      <Grid container>
        <Grid item xs={3}>
          <Jdenticon value={product.cid} />
        </Grid>
        <Grid item xs={9}>
          <Typography color={"primary"} variant="h5">
            {product.name}
          </Typography>
          <Typography variant="caption" gutterBottom fontWeight={"bold"}>
            {product.pid}
          </Typography>
          <Typography>
            Product CID: {product.cid.slice(0, 5)}...
            {product.cid.slice(product.cid.length - 5, product.cid.length)}
          </Typography>
          <Typography>
            Priced at: {change_stable_to_human(product.price)} DLGT
          </Typography>
          <TextField
            required
            select
            id="quantity"
            label="Qty"
            value={lineItem.count}
            variant="filled"
            onChange={(e) => {
              console.log(e.target.value);
              console.log(getStoreFromPid(product.pid));
              dispatcher(
                setQuantityItem({
                  seller_id: getStoreFromPid(product.pid),
                  product_id: product.pid,
                  qty: parseInt(e.target.value),
                })
              );
            }}
          >
            {new Array(10).fill(0).map((_, index) => {
              return (
                <MenuItem key={product.cid + index} value={index + 1}>
                  {index + 1}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent={"space-evenly"}
          margin={"10px 0px"}
        >
          <Button variant="contained" color="error" onClick={handleRemoveItem}>
            Remove from Cart
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              navigation(`/products/${product.cid}`, { replace: false });
            }}
          >
            View More Information
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Cart Function Component
const Cart = () => {
  const dlgt_contract = useContext(DLGTContractContext);
  const base_contract = useContext(BaseContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const cartOrders = useSelector((state: any) => state.cartSlice.orders);
  const userDetails = useSelector((state: any) => state.contractSlice.user);
  const allStores = useSelector((state: any) => state.storeSlice.allStore);

  const { enqueueSnackbar } = useSnackbar();

  const allProducts = useSelector(
    (state: any) => state.productSlice.allProducts
  );

  const [loading, setLoading] = useState(false);

  const getProductBCFromPid = (pid: string) => {
    let res = allProducts.filter((prod: Product) => prod.pid === pid);
    if (res.length > 0) {
      return res[0];
    } else {
      return null;
    }
  };

  const getStoreFromStoreId = (store_id: string) => {
    let res = allStores.filter((store: Store) => store.id === store_id);
    if (res.length > 0) {
      return res[0];
    } else {
      return null;
    }
  };

  // User Details Hooks Stuff

  const web3Instance = useContext(WebContext);
  const secretInputRef = useRef<HTMLInputElement>(null);

  const [currentOrderId, setCurrentOrderId] = React.useState<string>("");

  React.useEffect(() => {
    setAddressState({
      ...addressState,
      userId: userDetails.accountId,
    });
  }, [userDetails]);

  const initAddressState = {
    address: "",
    country: "",
    district: "",
    email: "",
    state: "",
    name: "",
    pincode: "",
    phone: "",
    userId: "",
  };

  const [addressState, setAddressState] = React.useState<Order_Specification>({
    ...initAddressState,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressState({
      ...addressState,
      [e.target.name]: e.target.value,
    });
  };

  const convertObjectValuesToHex = (object: any) => {
    const keys = Object.keys(object);
    let newObj: any = {};
    keys.map((key) => {
      newObj[key] = Buffer.from(object[key]).toString("hex");
    });
    return newObj;
  };

  const handleSubmitClick = async () => {
    const ipfsClient = await web3Instance;

    if (secretInputRef !== null) {
      const secret = secretInputRef.current?.value;

      if (secret && secret.length > 5) {
        let res = cartOrders.filter(
          (order: Order) => order.id === currentOrderId
        );
        if (res.length > 0) {
          // Fail Fast
          if (userDetails.accountId === res[0].seller_id) {
            enqueueSnackbar("You can't buy from your own store.", {
              variant: "error",
            });
            return;
          }

          setLoading(true);
          let hash = await CryptoJS.SHA256(secret).toString(CryptoJS.enc.Hex);

          let seller = getStoreFromStoreId(res[0].seller_id);
          console.log(seller);
          console.log(JSON.stringify(addressState), seller);

          const publicObjectEncrypted = ecEncrypt(
            JSON.stringify(addressState),
            seller.pub_key
          );

          // Parse All data to Hex before storing in bc
          const dataObj = convertObjectValuesToHex(publicObjectEncrypted);

          let file = new File(
            [JSON.stringify(dataObj)],
            "encryptedAddressDetails.txt"
          );
          const cid = await ipfsClient.put([file]);
          console.log(cid);

          let finalObj: Order = {
            ...res[0],
            customer_account_id: userDetails.accountId,
            customer_secret: hash,
            cid: cid,
            status: Status[Status.PENDING],
          };

          const base_contract_name = base_contract?.contractId;

          const args = {
            receiver_id: base_contract_name,
            amount: add_two_percent(finalObj.payload.amount.toString()),
            memo: finalObj.id,
            msg: JSON.stringify({ ...finalObj }),
          };

          setLoading(false);

          // Send transaction to the Blockchain
          // @ts-ignore
          dlgt_contract?.ft_transfer_call({
            args: {
              ...args,
            },
            gas: ATTACHED_GAS,
            amount: "1", // attached deposit in yoctoNEAR 
          });
        }
      }
    }
    return;
  };

  const handleBuy = async (order_id: string) => {
    // Steps to buy
    // Search all the products for pids
    // Filter all the products for a seller
    // Store all the other items on browser storage
    // Once stored then place order for one seller in this transaction

    setCurrentOrderId(order_id);
    if (localAddresses.length > 0) {
      setAddressState({
        ...addressState,
        ...localAddresses[0],
      });
      setCurrentAddressIdx(0);
    }
    handleOpen();
  };

  const [open, setOpen] = React.useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (parseInt(e.target.value) >= 0) {
      setAddressState({
        ...addressState,
        ...localAddresses[parseInt(e.target.value)],
      });
      setCurrentAddressIdx(parseInt(e.target.value));
    } else {
      setAddressState({
        ...initAddressState,
      });
      setCurrentAddressIdx(-1);
    }
  };

  const [localAddresses] = useLocalAddresses();
  const [currentAddressIdx, setCurrentAddressIdx] = useState(() => {
    if (localAddresses.length > 0) {
      return 0;
    }
    return -1;
  });

  return (
    <Paper sx={{ padding: "10px" }}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="order-address-form"
        aria-describedby="order-address-buyer-form"
      >
        <AddressForm
          loading={loading}
          addressState={addressState}
          secretInputRef={secretInputRef}
          handleChange={handleChange}
          handleSubmitClick={handleSubmitClick}
          handleClose={handleClose}
          handleAddressChange={handleAddressChange}
          localAddresses={localAddresses}
          currentAddressIdx={currentAddressIdx}
        />
      </Modal>
      {cartOrders.length <= 0 ? (
        <Typography>
          Looks like cart is Empty. Try adding something from{" "}
          <Link to="/">
            {" "}
            <MuiLink>home. </MuiLink>{" "}
          </Link>
        </Typography>
      ) : (
        <React.Fragment>
          {" "}
          <Grid
            container
            display={"flex"}
            flexWrap="wrap"
            justifyContent={"center"}
          >
            {cartOrders.length > 0 &&
              cartOrders.map((order: Order, index: number) => {
                return (
                  <Paper sx={{ padding: "10px" }} key={order.seller_id + index}>
                    <Typography textAlign={"center"}>
                      Seller ID: {order.seller_id}
                    </Typography>
                    {order.payload.line_items.map(
                      (item: LineItem, index: React.Key | null | undefined) => {
                        let prod = getProductBCFromPid(item.product_id);
                        return (
                          <CartItem
                            key={item.product_id + index}
                            product={prod}
                            lineItem={item}
                            orderId={order.id}
                          />
                        );
                      }
                    )}
                    <Box
                      display={"flex"}
                      flexDirection={"column"}
                      alignItems="end"
                      justifyContent={"end"}
                    >
                      <Typography fontWeight={"bold"}>
                        Total: {change_stable_to_human(order.payload.amount)}{" "}
                        DLGT
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleBuy(order.id)}
                      >
                        Place Order
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
          </Grid>
        </React.Fragment>
      )}
    </Paper>
  );
};

export default Cart;
