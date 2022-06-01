import React, { useContext } from "react";

import {
  setField,
  setStore,
  setLat,
  setLon,
} from "../../redux/slices/store.slice";

import { Store } from "../../utils/interface";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Divider, TextField } from "@mui/material";
import { KeyStoreContext, WalletConnectionContext } from "../..";

const CreateStore: React.FC<{
  handleSubmit: () => any;
}> = ({ handleSubmit }) => {
  const dispatcher = useDispatch();
  const contract = useSelector((state: any) => state.contractSlice);
  const curStore = useSelector((state: any) => state.storeSlice.currentStore);
  const walletConnection = useContext(WalletConnectionContext);
  const keyStore = useContext(KeyStoreContext);

  React.useEffect(() => {
    (async () => {
      const keyP = await keyStore?.getKey(
        walletConnection?._networkId || "testnet",
        contract.user.accountId
      );

      let shopPKey = "";

      if (keyP) {
        shopPKey = Buffer.from(keyP.getPublicKey().data).toString("hex");
        console.log(shopPKey);
      }

      let store: Store = {
        id: contract.user.accountId,
        address: "",
        name: "",
        lat_lng: {
          latitude: 0.0,
          longitude: 0.0,
        },
        website: "",
        logo: "",
        country: "",
        state: "",
        pub_key: shopPKey,
        city: "",
        products: [],
      };

      dispatcher(setStore(store));
    })();
  }, []);

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
        <TextField
          name="id"
          disabled
          value={curStore.id}
          label="Id"
          fullWidth
          sx={{marginBottom: "15px"}}
        />
        <TextField
          name="Current Public Key"
          disabled
          value={curStore.pub_key}
          label="Public Key"
          helperText="Buyers will use this key to encrypt their addresses so that only you would be able to unlock it."
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
          value={curStore.lat_lng.lat}
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
          value={curStore.lat_lng.lng}
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
          Create Store{" "}
        </Button>
      </Container>
    )
  );
};

export default CreateStore;
