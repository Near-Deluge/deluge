import React, { useContext, useRef, useState } from "react";

import {
  setField,
  setStore,
  setLat,
  setLon,
} from "../../redux/slices/store.slice";

import { Store } from "../../utils/interface";
import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Button,
  CircularProgress,
  Container,
  Dialog,
  Divider,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import useLocalStorageKey, {
  generateKeyPair,
  ILocalStorageKey,
  retrieveKeyPair,
} from "../../hooks/useLocalStorageKey";
import base58 from "bs58";

import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Close from "@mui/icons-material/Close";
import { PaddedDividerSpacer } from "../../pages/product";
import { useSnackbar } from "notistack";
import { StorageContext } from "../..";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateStore: React.FC<{
  handleSubmit: () => any;
}> = ({ handleSubmit }) => {
  const dispatcher = useDispatch();
  const contract = useSelector((state: any) => state.contractSlice);
  const curStore = useSelector((state: any) => state.storeSlice.currentStore);
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = React.useState(false);
  const [seedPhrases, setSeedPhrases] = React.useState("");
  const [stateIndex, setStateindex] = React.useState(0);
  const [random, setRandom] = React.useState(Math.floor(Math.random() * 12));

  const verifyInputRef = useRef<HTMLInputElement>();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [localKeyPair, setLocalKeypair] = useLocalStorageKey();

  // If no Key then create one with random seedphrases and let shop owner write it down, Additionally verify it.
  React.useEffect(() => {
    (async () => {
      let shopPKey = "";
      if (localKeyPair.publicKey.length === 0) {
        console.log("No Public Key ATM Gen One.");
        const { seedPhrase } = generateKeyPair();
        console.log(seedPhrase);
        setSeedPhrases(seedPhrase);
        setOpen(true);
      } else {
        const { publicKey } = localKeyPair;
        const publicKeyHex = Buffer.from(
          base58.decode(publicKey.split("ed25519:")[1])
        ).toString("hex");
        shopPKey = publicKeyHex;
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

  const handleVerifySeedPhrase = () => {
    if (
      random >= 0 &&
      random < 12 &&
      verifyInputRef.current &&
      seedPhrases.length > 0
    ) {
      if (
        seedPhrases.split(" ")[random] === verifyInputRef.current.value.trim()
      ) {
        enqueueSnackbar(
          "Successfully Verified Seed Phrase Word. Retrieved in Local Storage.",
          {
            variant: "success",
          }
        );

        const { publicKey, secretKey } = retrieveKeyPair(seedPhrases.trim());

        const newKeypair: ILocalStorageKey = {
          publicKey,
          secretKey,
        };
        const publicKeyHex = Buffer.from(
          base58.decode(publicKey.split("ed25519:")[1])
        ).toString("hex");

        setLocalKeypair(newKeypair);

        dispatcher(
          setStore({
            ...curStore,
            pub_key: publicKeyHex,
          })
        );
        setOpen(false);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const storageContext = useContext(StorageContext);

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
      <Grid container>
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <Close />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Save your Secret Seed Phrase
              </Typography>
            </Toolbar>
          </AppBar>
          <Grid container>
            <Grid item xs={12} sm={4}></Grid>
            <Grid
              item
              xs={12}
              sm={4}
              display="flex"
              flexDirection={"column"}
              justifyContent={"center"}
              alignContent="center"
              padding={"20px 0px"}
            >
              {stateIndex === 0 && (
                <React.Fragment>
                  <Typography
                    variant="h4"
                    fontWeight={"bold"}
                    textAlign="center"
                    gutterBottom
                  >
                    Seed Phrases
                  </Typography>
                  <Typography variant="h4" textAlign="center">
                    {seedPhrases}
                  </Typography>
                  <PaddedDividerSpacer v_m={10} />
                  <Typography color="error">
                    Please write these somplace safe, as these are not
                    recoverable later in any situation. !!
                  </Typography>
                  <PaddedDividerSpacer v_m={10} />
                  <Button variant="contained" onClick={() => setStateindex(1)}>
                    I have Stored it.
                  </Button>
                </React.Fragment>
              )}
              {stateIndex === 1 && (
                <React.Fragment>
                  <Typography
                    variant="h4"
                    fontWeight={"bold"}
                    textAlign="center"
                    gutterBottom
                  >
                    Verify Seed Phrase
                  </Typography>
                  <Typography variant="h6" textAlign="center">
                    {`Enter the #${random + 1} Seed Phrase Word`}
                  </Typography>
                  <PaddedDividerSpacer v_m={10} />
                  <TextField
                    inputRef={verifyInputRef}
                    label={`Enter Word #${random + 1}`}
                    placeholder="Enter Word Here"
                  />
                  <PaddedDividerSpacer v_m={10} />
                  <Button variant="contained" onClick={handleVerifySeedPhrase}>
                    Continue
                  </Button>
                </React.Fragment>
              )}
            </Grid>
            <Grid item xs={12} sm={4}></Grid>
          </Grid>
        </Dialog>
        <Container>
          <TextField
            name="id"
            disabled
            value={curStore.id}
            label="Id"
            fullWidth
            sx={{ marginBottom: "15px" }}
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
          <Typography
            sx={{ margin: "10px 0px" }}
            variant="body2"
            fontWeight={"bold"}
          >
            Logo: {curStore.logo}
          </Typography>
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
              endAdornment: loading && <CircularProgress />,
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
      </Grid>
    )
  );
};

export default CreateStore;
