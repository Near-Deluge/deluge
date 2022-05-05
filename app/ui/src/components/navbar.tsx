import React from "react";

// Components Imports
import { Paper, Grid, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

// Images Imports
import img from "../assets/imgs/logos/logo_full.png";
import "./navbar.css";

const Navbar = () => {
  return (
    <Paper
      sx={{
        padding: "20px 10px",
      }}
      elevation={0}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2} className="grid_wrapper wrapper-1" sx={{justifyContent: "flex-start"}}>
          <img src={img} className="logo" />
        </Grid>
        <Grid item xs={12} sm={8} className="grid_wrapper wrapper-2">
          <div className="nav-link">
            <Link to="/">
              <Typography fontWeight={800} component={"p"}>
                Home{" "}
              </Typography>{" "}
            </Link>
          </div>
          <div className="nav-link">
            <Link to="/account">
              <Typography fontWeight={800} component={"p"}>
                Account{" "}
              </Typography>{" "}
            </Link>
          </div>
          <div className="nav-link">
            <Link to="/cart">
              <Typography fontWeight={800} component={"p"}>
                Cart{" "}
              </Typography>{" "}
            </Link>
          </div>
          <div className="nav-link">
            <Link to="/add_store">
              <Typography fontWeight={800} component={"p"}>
                Add Store{" "}
              </Typography>{" "}
            </Link>
          </div>
        </Grid>
        <Grid item xs={12} sm={2} className="grid_wrapper wrapper-3" sx={{justifyContent: "flex-end"}}>
          <Button variant="contained">Create</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Navbar;
