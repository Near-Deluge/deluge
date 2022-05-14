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
import { useSelector } from "react-redux";
import {
  BaseContractContext,
  DLGTContractContext,
  WalletConnectionContext,
} from "..";
import { Product } from "../utils/interface";
import { change_stable_to_human } from "../utils/utils";

// @ts-ignore
import Jdenticon from "react-jdenticon";
import { Link } from "react-router-dom";

export const CartItem: React.FC<{
  product: Product;
}> = ({ product }) => {
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
          >
            {new Array(10).fill(0).map((_, index) => {
              return (
                <MenuItem key={index} value={index}>
                  {index}
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
  const cartTotal = useSelector((state: any) => state.cartSlice.total);

  const [cartOrder, setCartOrder] = React.useState();

  const handleBuy = () => {
    // Steps to buy
    // Search all the products for pids
    // Filter all the products for a seller
    // Store all the other items on browser storage
    // Once stored then place order for one seller in this transaction
    // @ts-ignore
    // dlgt_contract?.ft_transfer_call({
    //   args: {
    //     receiver_id: base_contract?.account,
    //     amount: order.payload.amount.toString(),
    //     memo: options.memo,
    //     msg: JSON.stringify({ ...order, id: options.orderId }),
    //   },
    //   gas: ATTACHED_GAS, // attached GAS (optional)
    //   amount: "1", // attached deposit in yoctoNEAR (optional)
    // });
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
            {cartItems.map((item: any, index: React.Key | null | undefined) => {
              return <CartItem key={index} product={item} />;
            })}
          </Grid>
          <Box
            display={"flex"}
            flexDirection="column"
            alignItems={"flex-end"}
            justifyContent="flex-end"
          >
            <Typography fontWeight={"bold"} textAlign="end">
              Total Payable: {change_stable_to_human(cartTotal)} DLGT
            </Typography>
            <Button variant="contained" onClick={handleBuy}>
              Proceed to Buy
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Paper>
  );
};

export default Cart;
