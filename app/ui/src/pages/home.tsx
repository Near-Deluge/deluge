import React from "react";

import "./home.css";

// Components Imports

import { Divider, Grid, Typography } from "@mui/material";
import Placeholder_Square from "../components/utils/placeholder_square";
import ProductCard from "../components/products/product_card";

import dummy_products from "../components/utils/dummy_products";
import { get_fake_products_list } from "../components/utils/dummy_data";

import HorizontalList from "../components/horizontal_list";
import { useSelector } from "react-redux";
import { Product, Product_Storage, Store } from "../utils/interface";

const Home = () => {
  let allProductsCids = useSelector(
    (state: any) => state.productSlice.all_cid_details
  );
  let allProductsBC = useSelector(
    (state: any) => state.productSlice.allProducts
  );

  let allStores = useSelector((state: any) => state.storeSlice.allStore);

  const getProductBCFromPid = (pid: string) => {
    let res = allProductsBC.filter((item: Product) => item.pid === pid);
    if (res.length > 0) {
      return res[0];
    } else {
      return null;
    }
  };

  const getSellerFromProductId = (pid: string) => {
    let fRes = "";
    allStores.map((store: Store) => {
      let res = store.products.filter((ipid) => ipid === pid);
      if(res.length > 0) {
        fRes = store.id.toString()
      }
    });
    return fRes
  };

  return (
    <div>
      <Grid container className="flex-main-wrapper">
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          height="100%"
        >
          <Typography variant="h1" fontWeight={800} gutterBottom>
            Deluge
          </Typography>
          <Typography>Deluge is an Ecommerce Platform.</Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Placeholder_Square size="400px" />
        </Grid>
      </Grid>
      <Divider sx={{ margin: "20px 0px" }} />
      <Typography variant="h3">All Products</Typography>
      <Grid
        container
        display={"flex"}
        justifyContent="center"
        alignItems={"center"}
      >
        {allProductsCids.map((prod: Product_Storage, index: number) => {
          let prodBC = getProductBCFromPid(prod.product_id.toString());
          return (
            <ProductCard
              itemId={`${prod.name}${index}`}
              key={`${prod.name}${index}`}
              img={prod.images[0]}
              seller={getSellerFromProductId(prod.product_id.toString())}
              description={prod.description.toString()}
              name={prod.name.toString()}
              price={prodBC.price}
              currency={"DLGT"}
              productBC={prodBC}
              // rating={prod.rating}
              // ratings_count={prod.ratings_count}
            />
          );
        })}
      </Grid>
      {/* <Divider sx={{margin: "20px 0px"}}/>
      <Typography variant="h3">Item you might be Interested In</Typography>
      <Grid
        container
        display={"flex"}
        justifyContent="center"
        alignItems={"center"}
      >
        {get_fake_products_list(8).map((prod, index) => {
          return (
            <ProductCard
              itemId={`${prod.name}${index}`}
              key={`${prod.name}${index}`}
              img={prod.img}
              seller={prod.seller}
              description={prod.description}
              name={prod.name}
              price={prod.price}
              currency={prod.currency}
              rating={prod.rating}
              ratings_count={prod.ratings_count}
            />
          );
        })}
      </Grid> */}
    </div>
  );
};

export default Home;
