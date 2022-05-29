import React from "react";

import { Grid, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const NotFound404 = () => {
  return (
    <Grid container sx={{ minHeight: "90vh" }}>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Typography color="primary" variant="h1" textAlign={"center"} fontSize={"20em"}>
          404
        </Typography>
        <Typography variant="h2" gutterBottom textAlign={"center"}>
          Uh Oh!
        </Typography>
        <Typography textAlign={"center"}>
          Looks like the page you are trying to access doesn't exist.
        </Typography>

        <Typography color="primary" textAlign={"center"}>
          <ArrowBack fontSize="small" />
          <Link to="/">Go Back to Home </Link>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default NotFound404;
