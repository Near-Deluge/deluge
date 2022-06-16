import { Delete, Edit } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import {
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  IconButton,
  Box,
  Divider,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import useLocalAddresses from "../hooks/useLocalAddress";
import { LocalAddress } from "../utils/interface";

const initLocalAddressState: LocalAddress = {
  name: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  district: "",
  pincode: "",
  state: "",
};

const AddressViewItem: React.FC<{
  localAddr: LocalAddress;
  handleDelete: any;
  handleUpdate: any;
}> = ({ localAddr, handleDelete, handleUpdate }) => {
  return (
    <Paper sx={{ padding: "20px", margin: "5px" }}>
      <Grid container>
        <Grid item xs={12} sm={8}>
          <Typography gutterBottom>Name: {localAddr.name}</Typography>
          <Typography gutterBottom>Email: {localAddr.email}</Typography>
          <Typography gutterBottom>Phone No.: {localAddr.phone}</Typography>
          <Typography fontWeight={"bold"}>Address</Typography>
          <Typography>
            {localAddr.address}, {localAddr.district} {localAddr.state},{" "}
            {localAddr.country}, {localAddr.pincode}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display={"flex"} justifyContent={"flex-end"}>
            <IconButton color={"info"} onClick={handleUpdate}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LocalAddresses = () => {
  const [localAddresses, addAddress, removeAddress, deleteAllAddresses] =
    useLocalAddresses();

  const [localAddress, setLocalAddress] = React.useState<LocalAddress>({
    ...initLocalAddressState,
  });

  const [isAddressFormOpen, setAddressFormOpen] = useState(false);

  const handleAddAddress = () => {
    console.log(localAddress);
    // TODO: Add checks here
    addAddress(localAddress);

    setAddressFormOpen(false);
    setLocalAddress({ ...initLocalAddressState });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAddress({
      ...localAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = (index: number, obj: LocalAddress) => {
    setLocalAddress({
      ...obj,
    });
    removeAddress(index);
    setAddressFormOpen(true);
  };

  return (
    <Paper>
      <Grid container>
        <Dialog open={isAddressFormOpen}>
          <Paper sx={{ padding: "20px" }}>
            <Box sx={{ minWidth: "20vw" }}>
              <Box display={"flex"} justifyContent={"space-between"}>
                <Typography variant="h5" fontWeight={"bold"}>
                  Enter Address Details
                </Typography>
                <IconButton onClick={() => setAddressFormOpen(false)}>
                  <Close color="error" />
                </IconButton>
              </Box>
              <Divider sx={{ margin: "20px 0px", width: "100%" }} />
              <Box
                sx={{
                  maxWidth: "600px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <TextField
                  value={localAddress.name}
                  name="name"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Name"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.email}
                  name="email"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Email"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.address}
                  name="address"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Address"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.district}
                  name="district"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"District/City"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.state}
                  name="state"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"State"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.country}
                  name="country"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Country"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.pincode}
                  name="pincode"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Pincode"}
                  variant="outlined"
                  onChange={handleChange}
                />
                <TextField
                  value={localAddress.phone}
                  name="phone"
                  fullWidth
                  required
                  sx={{ margin: "10px" }}
                  label={"Phone/Contact No."}
                  variant="outlined"
                  onChange={handleChange}
                />

                <Button variant="contained" onClick={handleAddAddress}>
                  "Add Address"
                </Button>
              </Box>
            </Box>
          </Paper>
        </Dialog>
        <Grid item xs={12} padding={"10px"}>
          <Typography
            variant="h5"
            textAlign={"center"}
            fontWeight="bold"
            gutterBottom
          >
            Locally Stored Addresses
          </Typography>
          <Typography>
            These addresses are stored locally on your browser, you can add,
            remove and view these addresses here. And you can select one of
            these addresses on the checkout page to prefill the form for you.
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          padding={"5px"}
        >
          <Button variant="contained" onClick={() => setAddressFormOpen(true)}>
            Add a New Address
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          padding={"5px"}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteAllAddresses()}
          >
            Delete All Addresses
          </Button>
        </Grid>
        <Grid item xs={12} padding="20px 0px">
          <Typography textAlign={"center"} variant="h6" fontWeight={"bold"}>
            Your Addresses
          </Typography>
          {localAddresses.length > 0 ? (
            localAddresses.map((localAddress, index) => {
              return (
                <AddressViewItem
                  localAddr={localAddress}
                  key={index + localAddress.address + localAddress.pincode}
                  handleDelete={() => removeAddress(index)}
                  handleUpdate={() => handleUpdate(index, localAddress)}
                />
              );
            })
          ) : (
            <Typography textAlign={"center"}>
              Looks like, you have saved no addresses. Try Adding a new one.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LocalAddresses;
