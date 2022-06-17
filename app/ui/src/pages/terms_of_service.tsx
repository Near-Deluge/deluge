import { Grid, Link, Typography } from "@mui/material";
import React from "react";

const TermsOfService = () => {
  return (
    <Grid container>
      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={6} padding="20px">
        <Typography variant="h4" textAlign={"center"} fontWeight="bold">
          Terms of Service
        </Typography>
        <Typography>
          This page is a WIP
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3}></Grid>
    </Grid>
  );
};

export default TermsOfService;
