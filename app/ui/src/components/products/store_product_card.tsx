import { Paper, Grid, Typography } from "@mui/material";
import React from "react";
import { Product } from "../../utils/interface";
import BN from "big.js";
//@ts-ignore
import Jdenticon from "react-jdenticon";
import { Link } from "react-router-dom";
import { change_stable_to_human } from "../../utils/utils";

const StoreProductCard: React.FC<Product> = ({
  cid,
  inventory,
  name,
  pid,
  price,
}) => {
  return (
    <Link to={`/products/${cid}`}>
      <Paper sx={{ margin: "10px" }}>
        <Grid container padding={"10px"}>
          <Grid item xs={12} sm={3} justifyContent="center" alignItems={"flex-start"} display="flex">
            <Jdenticon size="60" value={cid} />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography variant="h6" fontWeight={"bold"}>
              {name}
            </Typography>
            <Typography>Product Id: {pid}</Typography>
            <Typography fontWeight={"bold"}>
              Price:{" "}
              {change_stable_to_human(price)} DLGT
            </Typography>
            <Typography fontWeight={"bold"}>CID to details: {cid.slice(0, 10)}...{cid.slice(cid.length - 10, cid.length)}</Typography>
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
