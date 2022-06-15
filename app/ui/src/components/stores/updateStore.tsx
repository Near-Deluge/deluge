import React, { useContext, useState } from "react";

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
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { store } from "../../redux/store";
import { useSnackbar } from "notistack";
import { StorageContext } from "../..";

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
    enqueueSnackbar("Successfully Updated the Store :)", {variant: "success"});
  };

  const handleChange = (e: any) => {
    dispatcher(
      setField({
        field: e.target.name,
        value: e.target.value,
      })
    );
  };

  const [loading, setLoading] = useState(false);
  const storageContext = useContext(StorageContext);
  const { enqueueSnackbar } = useSnackbar();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      setLoading(true);
      const files = e.target.files;
      const cid = await storageContext.putFile(files[0]);
      if (cid && cid.length > 0) {
        dispatcher(setField({ field: "logo", value: cid }));
      } else {
        enqueueSnackbar("Some Error Happened in Uploading Files!!!", {
          variant: "error",
        });
      }
      setLoading(false);
    } else {
      enqueueSnackbar("Please Select a Image as Logo for you store!");
    }
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
        {/* <TextField
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
        /> */}
        <Typography sx={{margin: "10px 0px"}} variant="body2" fontWeight={"bold"}>Logo: {curStore.logo}</Typography>
        <TextField
          variant="outlined"
          placeholder="Click to Add Logo"
          type={"file"}
          fullWidth
          required
          onChange={handleLogoUpload}
          name="logo"
          helperText="Select a Logo"
          disabled={loading}
          color="success"
          sx={{
            marginBottom: "10px",
          }}
          InputProps={{
            endAdornment: loading && <CircularProgress />
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
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {" "}
          Update Store{" "}
        </Button>
      </Container>
    )
  );
};

export default UpdateStore;
