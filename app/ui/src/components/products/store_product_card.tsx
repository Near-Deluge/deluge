import { Paper, Grid, Typography } from "@mui/material";
import React from "react";
import { Product } from "../../utils/interface";
import BN from "big.js";
//@ts-ignore
import Jdenticon from "react-jdenticon";
import { Link } from "react-router-dom";

const StoreProductCard: React.FC<Product> = ({
  cid,
  inventory,
  name,
  pid,
  price,
}) => {
  return (
    <Link to={`/products/${cid}`}>
      <Paper>
        <Grid container padding={"10px"}>
          <Grid item xs={12} sm={3}>
            <Jdenticon size="60" value={cid} />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography variant="h6" fontWeight={"bold"}>
              {name}
            </Typography>
            <Typography>Product Id: {pid}</Typography>
            <Typography fontWeight={"bold"}>
              Price:{" "}
              {new BN(price.toString())
                .div(10 ** 8)
                .toFixed()
                .toString()}
            </Typography>
            <Typography
              fontWeight={"bold"}
            >{`Inventory: ${inventory}`}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Link>
  );
};

export default StoreProductCard;
