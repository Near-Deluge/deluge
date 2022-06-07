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
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import HomeIcon from "@mui/icons-material/Home";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import {
  Checkroom,
  CheckRounded,
  LoginOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

// Images Imports
import img from "../assets/imgs/logos/logo_full.png";
import logo from "../assets/imgs/logos/logo.png";
import "./navbar.css";

import AppsIcon from "@mui/icons-material/Apps";
import { ONE_NEAR, CONTRACT_NAME } from "../config";
import BN from "big.js";
import { useSelector } from "react-redux";

type INavbar = {
  balance: number;
  wallet: any;
  user: any;
  base_contract: any;
};

const Navbar: React.FC<INavbar> = ({
  balance,
  user,
  base_contract,
  wallet,
}) => {
  const matches = useMediaQuery("(max-width: 600px)");
  const [walletDetails, setWalletDetails] = useState<any>({});
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const curUserState = useSelector((state: any) => state.contractSlice.user);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    (async () => {
      const bal = await wallet.account().getAccountBalance();
      setWalletDetails({
        ...walletDetails,
        ...bal,
      });
    })();
  }, []);

  const viewBal = balance / 10 ** 8;

  const handleBuy = () => {
    base_contract.buy_ft({
      args: {},
      amount: new BN(ONE_NEAR).toFixed(0).toString(),
    });
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
                {open ? (
                  <CloseIcon color="error" fontSize="large" />
                ) : (
                  <AppsIcon color="primary" fontSize="large" />
                )}
              </IconButton>
            </Grid>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Grid item xs={12} sm={6} className="grid_wrapper wrapper-2">
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
                {curUserState.store === null ? (
                  <Link to="/add_store">
                    <Typography fontWeight={800} component={"p"}>
                      Create Store{" "}
                    </Typography>{" "}
                  </Link>
                ) : (
                  <Link to="/store">
                    <Typography fontWeight={800} component={"p"}>
                      Your Store
                    </Typography>{" "}
                  </Link>
                )}
              </div>
              <div className="nav-link">
                <Link to="complete_order">
                  <Typography fontWeight={800} component={"p"}>
                    Complete Order
                  </Typography>
                </Link>
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              className="grid_wrapper wrapper-3"
              sx={{ justifyContent: "flex-end" }}
            >
              {wallet.isSignedIn() && <CheckRounded color="success" />}
              {wallet.isSignedIn() ? (
                <IconButton
                  onClick={() => {
                    wallet.signOut();
                  }}
                >
                  <Tooltip title="Logout">
                    <LogoutOutlined />
                  </Tooltip>
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    wallet.requestSignIn({ contractId: CONTRACT_NAME });
                  }}
                >
                  <Tooltip title="Logout">
                    <LoginOutlined />
                  </Tooltip>
                </IconButton>
              )}
              <div style={{ marginLeft: 10 }}>
                <Typography color="primary">
                  {user && user.accountId}{" "}
                </Typography>
                <Tooltip title="1 N = 100 DLGT">
                  <Typography>
                    {walletDetails.total
                      ? (walletDetails.total / ONE_NEAR).toFixed(2)
                      : "0"}{" "}
                    Near
                  </Typography>
                </Tooltip>
              </div>

              <MenuItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
                onClick={handleBuy}
              >
                <ListItemIcon>
                  <img src={logo} style={{ width: "25px" }} />
                </ListItemIcon>
                <div style={{ margin: "0px 30px 0px 5px" }}>
                  <Typography
                    variant="h6"
                    fontWeight={"bold"}
                    sx={{ marginBottom: "-10px" }}
                  >
                    {viewBal}
                  </Typography>
                  <Typography variant="caption">DLGT</Typography>
                </div>
                <div>
                  <AddCircleIcon color="primary" />
                </div>
              </MenuItem>
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
            onClick={handleBuy}
          >
            <ListItemIcon>
              <img src={logo} style={{ width: "25px" }} />
            </ListItemIcon>
            <div style={{ margin: "0px 30px 0px 5px" }}>
              <Typography
                variant="h6"
                fontWeight={"bold"}
                sx={{ marginBottom: "-10px" }}
              >
                {viewBal}
              </Typography>
              <Typography variant="caption">DLGT</Typography>
            </div>
            <div>
              <AddCircleIcon color="primary" />
            </div>
          </MenuItem>

          <MenuItem>
            {wallet.isSignedIn() && <CheckRounded color="success" />}

            <div style={{ marginLeft: 10 }}>
              <Typography color="primary">{user && user.accountId} </Typography>
              <Tooltip title="1 N = 100 DLGT">
                <Typography>
                  {walletDetails.total
                    ? (walletDetails.total / ONE_NEAR).toFixed(2)
                    : "0"}{" "}
                  Near
                </Typography>
              </Tooltip>
            </div>
          </MenuItem>
          <Divider />
          <Link to={"/"}>
            <MenuItem>
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              Home
            </MenuItem>
          </Link>
          <Link to="complete_order">
            <MenuItem>
              <ListItemIcon>
                <Checkroom color="primary" />
              </ListItemIcon>
              Complete Order
            </MenuItem>
          </Link>
          <Link to="/account">
            <MenuItem>
              <ListItemIcon>
                <AccountCircleIcon color="primary" />
              </ListItemIcon>
              Account
            </MenuItem>
          </Link>
          <Divider />
          <Link to="/cart">
            <MenuItem>
              <ListItemIcon>
                <ShoppingCartIcon color="primary" />
              </ListItemIcon>
              Cart
            </MenuItem>
          </Link>
          {curUserState === null ? (
            <Link to={"/add_store"}>
              <MenuItem>
                <ListItemIcon>
                  <AddBusinessIcon color="primary" />
                </ListItemIcon>
                Add Store
              </MenuItem>
            </Link>
          ) : (
            [
              <Link to={"/store"} key="store">
                <MenuItem>
                  <ListItemIcon>
                    <AddBusinessIcon color="primary" />
                  </ListItemIcon>
                  View Store
                </MenuItem>
              </Link>,
              <Link to="/store_stats" key="store_stat">
                <MenuItem>
                  <ListItemIcon>
                    <QueryStatsIcon color="primary" />
                  </ListItemIcon>
                  Store Stats
                </MenuItem>
              </Link>,
              <Link to="store_pending" key="store_pending">
                <MenuItem>
                  <ListItemIcon>
                    <ShoppingCartCheckoutIcon color="primary" />
                  </ListItemIcon>
                  Pending Orders
                </MenuItem>
              </Link>,
            ]
          )}
          {wallet.isSignedIn() ? (
            <MenuItem>
              <ListItemIcon>
                <LogoutIcon color="primary" />
              </ListItemIcon>
              Logout
            </MenuItem>
          ) : (
            <MenuItem>
              <ListItemIcon>
                <LogoutIcon color="primary" />
              </ListItemIcon>
              Login
            </MenuItem>
          )}
        </Menu>
      </Grid>
    </Paper>
  );
};

export default Navbar;
