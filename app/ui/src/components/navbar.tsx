import React, { useState } from "react";

// Components Imports
import {
  Paper,
  Grid,
  Button,
  Typography,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import HomeIcon from "@mui/icons-material/Home";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

// Images Imports
import img from "../assets/imgs/logos/logo_full.png";
import logo from "../assets/imgs/logos/logo.png";
import "./navbar.css";

import AppsIcon from "@mui/icons-material/Apps";

const Navbar = () => {
  const matches = useMediaQuery("(max-width: 600px)");
  const [isOpen, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Paper
      sx={{
        padding: "20px 10px",
      }}
      elevation={0}
    >
      <Grid container spacing={2}>
        <Grid
          item
          xs={6}
          sm={2}
          className="grid_wrapper wrapper-1"
          sx={{ justifyContent: "flex-start" }}
        >
          <img src={img} className="logo" />
        </Grid>
        {matches ? (
          <React.Fragment>
            <Grid item xs={6} sm={2} display="flex" justifyContent={"flex-end"}>
              <IconButton onClick={handleClick}>
                {isOpen ? (
                  <CloseIcon color="error" fontSize="large" />
                ) : (
                  <AppsIcon color="primary" fontSize="large" />
                )}
              </IconButton>
            </Grid>
          </React.Fragment>
        ) : (
          <React.Fragment>
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
            <Grid
              item
              xs={12}
              sm={2}
              className="grid_wrapper wrapper-3"
              sx={{ justifyContent: "flex-end" }}
            >
              <Button variant="contained">Create</Button>
            </Grid>
          </React.Fragment>
        )}
        {/* {matches && (
          <Grid item xs={12}>
            <Collapse in={isOpen}>
              <div className="mob_wrapper">
                <div className="grid_wrapper">
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
                </div>
                <Divider sx={{ margin: "10px 0px" }} />
                <Button variant="contained">Create</Button>
              </div>
            </Collapse>
          </Grid>
        )} */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <ListItemIcon>
              <img src={logo} style={{ width: "25px" }} />
            </ListItemIcon>
            <div>
              <Typography
                variant="h6"
                fontWeight={"bold"}
                sx={{ marginBottom: "-10px" }}
              >
                345.56
              </Typography>
              <Typography variant="caption">Deluge Tokens</Typography>
            </div>
            <div>
              <AddCircleIcon color="primary" />
            </div>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <HomeIcon color="primary" />
            </ListItemIcon>
            Home
          </MenuItem>
          <MenuItem>
          <ListItemIcon>
              <AccountCircleIcon color="primary"/>
            </ListItemIcon>
             Account
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <ShoppingCartIcon color="primary" />
            </ListItemIcon>
            Cart
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <AddBusinessIcon color="primary" />
            </ListItemIcon>
            Add Store
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <QueryStatsIcon color="primary" />
            </ListItemIcon>
            Store Stats
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <ShoppingCartCheckoutIcon color="primary" />
            </ListItemIcon>
            Pending Orders
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <LogoutIcon color="primary" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Grid>
    </Paper>
  );
};

export default Navbar;
