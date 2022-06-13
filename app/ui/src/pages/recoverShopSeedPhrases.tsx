import { Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorageKey, {
  retrieveKeyPair,
} from "../hooks/useLocalStorageKey";
import { PaddedDividerSpacer } from "./product";

const RecoverShopSeedPhrases = () => {
  const inputSeedPharses = useRef<HTMLInputElement>();
  const { enqueueSnackbar } = useSnackbar();
  const navigation = useNavigate();

  const [_, setLocalKeypair] = useLocalStorageKey();

  const handleRecoverSeedPhrases = () => {
    if (inputSeedPharses.current) {
      let input_value = inputSeedPharses.current.value.trim();
      if (input_value.split(" ").length === 12) {
        console.log(input_value);
        const { publicKey, secretKey } = retrieveKeyPair(input_value);
        console.log(publicKey, secretKey);
        setLocalKeypair({
          publicKey,
          secretKey,
        });
        enqueueSnackbar("Will Redirect you in 3 seconds!!", {
          variant: "info",
        });
        setTimeout(() => {
          navigation("/account", { replace: true });
        }, 3000);
      } else {
        enqueueSnackbar("Please provide valid 12 word seed phrase!!");
      }
    }
  };

  return (
    <Grid container>
      <Paper sx={{ padding: "20px", width: "100%" }}>
        <Typography variant="h5" gutterBottom textAlign={"center"}>
          Recover your Shop Seed Phrases
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          inputRef={inputSeedPharses}
          placeholder="Enter your seed phrases to recover here."
          helperText="Enter you Seed Phrases with space between them to Recover Shop's Keypair"
        />
        <PaddedDividerSpacer v_m={20} />
        <Button variant="contained" onClick={handleRecoverSeedPhrases}>
          Recover
        </Button>
      </Paper>
    </Grid>
  );
};

export default RecoverShopSeedPhrases;
