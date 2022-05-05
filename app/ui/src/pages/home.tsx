import React from "react";

import "./home.css";

// Components Imports

import { Divider, Grid, Typography } from "@mui/material";
import Placeholder_Square from "../components/utils/placeholder_square";
import ProductCard from "../components/products/product_card";

import dummy_products from "../components/utils/dummy_products";
import { get_fake_products_list } from "../components/utils/dummy_data";

import HorizontalList from "../components/horizontal_list";

const Home = () => {
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
          <Typography>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas
            similique, in cumque error assumenda omnis ipsa recusandae debitis
            vero quasi.
          </Typography>
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
      <Divider sx={{margin: "20px 0px"}}/>
      <Typography variant="h3">Top Picks</Typography>
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
      </Grid>
      <Divider sx={{margin: "20px 0px"}}/>
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
      </Grid>
    </div>
  );
};

export default Home;
