import { Grid, Link, Typography } from "@mui/material";
import React from "react";

const BrandKit = () => {
  return (
    <Grid container>
      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={6} padding="20px">
        <Typography variant="h4" textAlign={"center"} fontWeight="bold">
          Brand Kit
        </Typography>
        <Typography>
          This page is a WIP
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3}></Grid>
    </Grid>
  );
};

export default BrandKit;
