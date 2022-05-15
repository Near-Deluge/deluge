import {
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  TextField,
  Link as MuiLink,
  MenuItem,
} from "@mui/material";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BaseContractContext,
  DLGTContractContext,
  WalletConnectionContext,
} from "..";
import { LineItem, Order, Product, Status, Store } from "../utils/interface";
import { change_stable_to_human } from "../utils/utils";
import CryptoJS from "crypto-js";

import { fromJSON, stringify } from "flatted";

// @ts-ignore
import Jdenticon from "react-jdenticon";
import { Link } from "react-router-dom";
import { setQuantityItem } from "../redux/slices/cart.slice";

export const ATTACHED_GAS = "300000000000000";

export const CartItem: React.FC<{
  product: Product;
}> = ({ product }) => {
  const dispatcher = useDispatch();

  const allStore = useSelector((state: any) => state.storeSlice.allStore);

  const getStoreFromPid = (pid: string) => {
    let res = "";
    for (let i = 0; i < allStore.length; ++i) {
      let res2 = allStore[i].products.filter((item: string) => item === pid);
      if (res2.length > 0) {
        return allStore[i].id;
      }
    }
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
          <Typography variant="caption" gutterBottom>
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
            defaultValue={1}
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
                <MenuItem key={index} value={index + 1}>
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
          <Button variant="contained" color="error">
            Remove from Cart
          </Button>
          <Button variant="contained" color="info">
            View More Information
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

const Cart = () => {
  const dlgt_contract = useContext(DLGTContractContext);
  const base_contract = useContext(BaseContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const cartItems = useSelector((state: any) => state.cartSlice.items);
  const cartOrders = useSelector((state: any) => state.cartSlice.orders);
  const cartTotal = useSelector((state: any) => state.cartSlice.total);
  const userDetails = useSelector((state: any) => state.contractSlice.user);

  const allProducts = useSelector(
    (state: any) => state.productSlice.allProducts
  );

  const getProductBCFromPid = (pid: string) => {
    let res = allProducts.filter((prod: Product) => prod.pid === pid);
    if (res.length > 0) {
      return res[0];
    } else {
      return null;
    }
  };

  const handleBuy = async (order_id: string) => {
    // Steps to buy
    // Search all the products for pids
    // Filter all the products for a seller
    // Store all the other items on browser storage
    // Once stored then place order for one seller in this transaction
    console.log(cartOrders);

    let res = cartOrders.filter((order: Order) => order.id === order_id);
    if (res.length > 0) {
      // DO IPFS Call here to store Delivery Stuff

      let dummyCid = "Queresjdfigusiyegibuifgwf";
      let secret = "0001";

      let hash = await CryptoJS.SHA256(secret).toString(CryptoJS.enc.Hex);

      let finalObj: Order = {
        ...res[0],
        customer_account_id: userDetails.accountId,
        customer_secret: hash,
        cid: dummyCid,
        status: Status[Status.PENDING],
      };

      let strMsg = stringify(finalObj);
      const base_contract_name = base_contract?.contractId;
      console.log(base_contract_name);
      console.log(typeof strMsg);

      const args = {
        receiver_id: base_contract_name,
        amount: finalObj.payload.amount.toString(),
        memo: finalObj.id,
        msg: JSON.stringify({ ...finalObj }),
      };

      if(finalObj.customer_account_id === finalObj.seller_id) {
        alert("You can't buy from your own store.")
        return;
      }

      // Send transaction to the Blockchain

      // @ts-ignore
      dlgt_contract?.ft_transfer_call({
        args: {
          ...args
        },
        gas: ATTACHED_GAS,
        amount: "1", // attached deposit in yoctoNEAR (optional)
      });
    }
  };

  return (
    <Paper sx={{ padding: "10px" }}>
      {parseFloat(cartTotal) <= 0 ? (
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
              cartOrders.map((order: Order) => {
                return (
                  <Paper sx={{ padding: "10px" }}>
                    <Typography textAlign={"center"}>
                      Seller ID: {order.seller_id}
                    </Typography>
                    {order.payload.line_items.map(
                      (item: LineItem, index: React.Key | null | undefined) => {
                        let prod = getProductBCFromPid(item.product_id);
                        return <CartItem key={index} product={prod} />;
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
          <Box
            display={"flex"}
            flexDirection="column"
            alignItems={"flex-end"}
            justifyContent="flex-end"
          >
            {/* <Typography fontWeight={"bold"} textAlign="end">
              Total Payable: {change_stable_to_human(cartTotal)} DLGT
            </Typography>
            <Button variant="contained" onClick={handleBuy}>
              Proceed to Buy
            </Button> */}
          </Box>
        </React.Fragment>
      )}
    </Paper>
  );
};

export default Cart;
