import {
  Facebook,
  GitHub,
  Instagram,
  LinkedIn,
  Send,
  Twitter,
} from "@mui/icons-material";
import {
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { Link } from "react-router-dom";
import DelugeIcon from "../icons/deluge";
import DiscordIcon from "../icons/discord";
import { PaddedDividerSpacer } from "../pages/product";

const Footer = () => {
  return (
    <Grid container minHeight={"200px"} padding={"10px"}>
      <Paper sx={{ width: "100%" }} variant="outlined">
        <Grid container height={"100%"}>
          <Grid
            item
            xs={12}
            sm={4}
            borderRight="1px solid #ccc"
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            padding={"20px"}
          >
            <DelugeIcon height={40} width={180} variant="full" />
            <Box display={"flex"}>
              <Link to="/support">
                <Typography color={"gray"} marginRight={"20px"}>
                  Support
                </Typography>
              </Link>
              <Link to="/terms_of_service">
                <Typography color={"gray"} marginRight={"20px"}>
                  Term of Service
                </Typography>
              </Link>
              <Link to="/brand">
                <Typography color={"gray"} marginRight={"20px"}>
                  Brand Kit
                </Typography>
              </Link>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            borderRight="1px solid #ccc"
            padding={"20px"}
          >
            <Box display={"flex"} flexDirection="column">
              <Link to="/">
                <Button sx={{ textTransform: "none", color: "#0a0a0a" }}>
                  Top Sellers
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button sx={{ textTransform: "none", color: "#0a0a0a" }}>
                  Roadmap
                </Button>
              </Link>
              <Link to="/">
                <Button sx={{ textTransform: "none", color: "#0a0a0a" }}>
                  Discover
                </Button>
              </Link>
              <Link to="/">
                <Button sx={{ textTransform: "none", color: "#0a0a0a" }}>
                  Blogs
                </Button>
              </Link>
            </Box>
            <PaddedDividerSpacer v_m={20} />
            <Box display={"flex"} justifyContent={"space-between"}>
              <Link to="/account">
                <Button sx={{ textTransform: "none" }} variant="contained">
                  My Account
                </Button>
              </Link>
              <Box>
                <Tooltip title="Facebook. Coming Soon!">
                  <IconButton>
                    <Facebook />
                  </IconButton>
                </Tooltip>
                <Tooltip title="LinkedIn. Coming Soon!">
                  <IconButton>
                    <LinkedIn />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Explore Code on Github">
                  <IconButton
                    href="https://github.com/Near-Deluge"
                    target={"_blank"}
                  >
                    <GitHub />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Twitter. Coming Soon!">
                  <IconButton>
                    <Twitter />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Instagram. Coming Soon!">
                  <IconButton>
                    <Instagram />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Join Us on Discord.">
                <IconButton
                  href="https://discord.gg/tCt2yp94Dt"
                  target={"_blank"}
                >
                  <DiscordIcon />
                </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            padding={"20px"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
          >
            <Typography sx={{ maxWidth: "70%" }} variant="body1">
              Deluge is still young, and growing at a rapid pace. Why not join
              us in our journey with our newsletter.
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter you email to join us"
              type={"email"}
              InputProps={{
                endAdornment: (
                  <Button
                    sx={{ textTransform: "none" }}
                    variant="contained"
                    startIcon={<Send />}
                  >
                    Send
                  </Button>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default Footer;
