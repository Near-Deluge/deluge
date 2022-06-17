import { Grid, Link, Typography } from "@mui/material";
import React from "react";

const RoadMap = () => {
  return (
    <Grid container>
      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={6} padding="20px">
        <Typography variant="h4" textAlign={"center"} fontWeight="bold">
          Roadmap
        </Typography>
        <Typography>
          This is in WIP{" "}
          <Link href="https://github.com/Near-Deluge/deluge/issues/31" target={"_blank"}>
            #32
          </Link>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3}></Grid>
    </Grid>
  );
};

export default RoadMap;
