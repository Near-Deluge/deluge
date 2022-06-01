import React from "react";

import {
  setField,
  setStore,
  setLat,
  setLon,
} from "../../redux/slices/store.slice";

import { Store } from "../../utils/interface";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { store } from "../../redux/store";

const UpdateStore: React.FC<{
  base_contract: any;
  wallet: any;
}> = ({ base_contract, wallet }) => {
  const dispatcher = useDispatch();
  let navigation = useNavigate();
  const { user } = useSelector((state: any) => state.contractSlice);
  const curStore = useSelector((state: any) => state.storeSlice.currentStore);
  const curStoreState = useSelector((state: any) => state.storeSlice);

  // Do Inital Stuff Here
  React.useEffect(() => {
    // TODO: If no store  then redirect to add_store page
    if (!user.store) {
      navigation("/add_store", { replace: true });
    }
  }, []);

  const handleSubmit = async () => {
    console.log(curStore);
    console.log(wallet.getAccountId());
    let finalState = {
      ...curStore,
      lat_lng: {
        ...curStore.lat_lng,
        latitude: parseFloat(curStore.lat_lng.latitude),
        longitude: parseFloat(curStore.lat_lng.longitude),
      },
    };
    console.log(finalState);
    // Send Update Transaction Here.
    const res = await base_contract.update_store({
      args: { id: wallet.getAccountId(), ...finalState },
      meta: "update_store",
    });
    console.log(res);
  };

  const handleChange = (e: any) => {
    dispatcher(
      setField({
        field: e.target.name,
        value: e.target.value,
      })
    );
  };

  return (
    curStore && (
      <Container>
        <Typography variant="h4" gutterBottom textAlign={"center"}>
          Update Store
        </Typography>
        <TextField
          name="id"
          disabled
          value={curStore.id}
          label="Id"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="pub_key"
          disabled
          value={curStore.pub_key}
          label="Public Key"
          fullWidth
        />
        <Divider sx={{ margin: "20px 0px" }} />
        <TextField
          name="name"
          value={curStore.name}
          onChange={handleChange}
          required
          label="Name"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="address"
          value={curStore.address}
          onChange={handleChange}
          required
          label="Address"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="country"
          value={curStore.country}
          onChange={handleChange}
          required
          label="Country"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="state"
          value={curStore.state}
          onChange={handleChange}
          required
          label="State"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="city"
          value={curStore.city}
          onChange={handleChange}
          required
          label="City"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <Divider sx={{ margin: "20px 0px" }} />
        <TextField
          name="website"
          value={curStore.website}
          onChange={handleChange}
          required
          label="Website"
          fullWidth
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="logo"
          value={curStore.logo}
          onChange={handleChange}
          required
          label="Logo"
          fullWidth
          helperText={"It can be a url to image or a cid"}
          sx={{
            marginBottom: "10px",
          }}
        />
        <TextField
          name="lat"
          value={curStore.lat_lng.latitude}
          onChange={(e: any) => {
            dispatcher(setLat(e.target.value));
          }}
          required
          label="Latitude"
          type={"number"}
          sx={{
            marginBottom: "10px",
            width: "49%",
          }}
        />
        <TextField
          name="lng"
          value={curStore.lat_lng.longitude}
          required
          label="Longitude"
          type={"number"}
          onChange={(e: any) => {
            dispatcher(setLon(e.target.value));
          }}
          sx={{
            marginBottom: "10px",
            marginLeft: "2%",
            width: "49%",
          }}
        />
        <Divider sx={{ margin: "20px 0px" }} />
        <Button variant="contained" onClick={handleSubmit}>
          {" "}
          Update Store{" "}
        </Button>
      </Container>
    )
  );
};

export default UpdateStore;
