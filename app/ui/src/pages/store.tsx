import {
  Container,
  Paper,
  Typography,
  Link,
  Grid,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as ReduxLink, useNavigate } from "react-router-dom";
import Collapse from "@mui/material/Collapse";

import AddProduct from "../components/products/addProduct";
import { Add, Close } from "@mui/icons-material";
import { Product } from "../utils/interface";
import StoreProductCard from "../components/products/store_product_card";

import isIPFS from "is-ipfs";
import { StorageContext } from "..";
import { setStore } from "../redux/slices/contract.slice";

type IStore = {};

const Store: React.FC<IStore> = ({}) => {
  const navigation = useNavigate();
  const { store } = useSelector((state: any) => state.contractSlice.user);

  React.useEffect(() => {
    if (store === null) {
      navigation("/add_store", { replace: true });
    }
  });

  const userProducts = useSelector(
    (state: any) => state.productSlice.userProducts
  );
  const userCids = useSelector(
    (state: any) => state.productSlice.user_cid_details
  );
  const [isAddProductOpen, setAddProductOpen] = React.useState(false);
  const storageContext = useContext(StorageContext);
  const dispatcher = useDispatch();
  useEffect(() => {
    (async () => {
      if (store.logo !== null && isIPFS.cid(store.logo)) {
        const value = await storageContext.getFirstFile(store.logo);
        if (value) {
          let ObjLink = URL.createObjectURL(value);
          dispatcher(
            setStore({
              ...store,
              logo: ObjLink,
            })
          );
        }
      }
    })();
  }, []);

  return (
    <Container>
      {store && (
        <Paper sx={{ padding: 2 }}>
          <Grid container>
            <Grid item xs={12} sm={3}>
              <img src={store.logo} alt={store.name + " logo"} />
            </Grid>
            <Grid
              item
              xs={12}
              sm={7}
              sx={{
                padding: "0px 20px ",
              }}
            >
              <Typography color="primary" variant="h4">
                {store.id}
              </Typography>
              <Typography color="success" variant="body2" fontWeight={"bold"}>
                Public Key: {store.pub_key}
              </Typography>
              <Typography>Shop Name: {store.name}</Typography>
              <Typography>
                Address: {store.address} {store.city} {store.state},{" "}
                {store.country}
              </Typography>
              <Link href={store.website} target="_blank">
                {store.website}
              </Link>
              <Typography>Located at:</Typography>
              <Typography>
                Longitude: {store.lat_lng.longitude}, Latitude:{" "}
                {store.lat_lng.latitude}
              </Typography>
              {store.products.length <= 0 && (
                <Typography>
                  Oops. Looks like you have no product yet.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={2}>
              <ReduxLink to="/update_store">
                <Button variant="contained">Update Store</Button>
              </ReduxLink>
            </Grid>
          </Grid>
        </Paper>
      )}
      <Grid container padding={"10px 0px"}>
        {!isAddProductOpen ? (
          <Tooltip title="Open Add New Product">
            <Button
              onClick={() => {
                setAddProductOpen(true);
              }}
              variant="contained"
            >
              <Add />
              <Typography>Create New Product</Typography>
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="Close Add New Product">
            <IconButton
              onClick={() => {
                setAddProductOpen(false);
              }}
            >
              <Close color="error" />
            </IconButton>
          </Tooltip>
        )}
        <Collapse in={isAddProductOpen}>
          <AddProduct />
        </Collapse>
      </Grid>
      <Grid container>
        <Typography variant="h5">Your Listed Products</Typography>
        <Grid container>
          {userProducts.map((item: Product) => {
            return (
              <StoreProductCard
                cid={item.cid}
                inventory={item.inventory}
                name={item.name}
                pid={item.pid}
                price={item.price}
                key={item.cid}
              />
            );
          })}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Store;
