import { Balance } from "@mui/icons-material";
import { Paper, Typography, Grid, Box, Button } from "@mui/material";
import React, { useContext } from "react";
import {
  BaseContractContext,
  DLGTContractContext,
  WalletConnectionContext,
} from "..";
import { ONE_NEAR } from "../config";

import BN from "big.js";

const Account = () => {
  const base_contract = useContext(BaseContractContext);
  const dlgt_contract = useContext(DLGTContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const [contract_details, setContractDetails] = React.useState<{
    stable_balance: any;
    storage_staking: any;
  }>({
    stable_balance: "",
    storage_staking: "",
  });

  const [accountDetails, setAccountDetails] = React.useState<{
    balance: any;
    details: any;
    state: any;
  }>({
    balance: "",
    details: "",
    state: "",
  });

  React.useEffect(() => {
    (async () => {
      const balance = await walletConnection?.account().getAccountBalance();
      const details = await walletConnection?.account().getAccountDetails();
      const state = await walletConnection?.account().state();

      setAccountDetails({
        balance,
        details,
        state,
      });
      // Fetch Token Balance

      const arg = {
        account_id: walletConnection?.getAccountId(),
      };

      // @ts-ignore
      const bal = await dlgt_contract?.ft_balance_of(arg);

      // Get Storage Staking in Deluge Contract
      // @ts-ignore
      const stake = await base_contract?.storage_balance_of({
        ...arg,
      });

      setContractDetails({
        stable_balance: bal,
        storage_staking: stake,
      });
    })();
  }, []);

  const handleBuy = () => {
    // @ts-ignore
    base_contract.buy_ft({
      args: {},
      amount: new BN(ONE_NEAR).toFixed(0).toString(),
    });
  };

  return (
    <Paper sx={{ padding: "10px" }}>
      <Typography fontWeight={"bold"} variant="h5" textAlign={"center"}>
        {walletConnection?.getAccountId()}
      </Typography>
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          alignContent={"center"}
          justifyContent={"center"}
          border="1px solid black"
          margin={"10px 0px"}
        >
          <Box>
            <Typography textAlign={"center"} fontWeight="bold" variant="h6">
              Account Stats
            </Typography>
            <Typography>
              {accountDetails.balance &&
                (accountDetails.balance.total / 10 ** 24).toFixed(2)}{" "}
              Near
            </Typography>
            <Typography>
              CodeHash: {accountDetails.state && accountDetails.state.code_hash}
            </Typography>
            <Typography>
              Block Height:{" "}
              {accountDetails.state && accountDetails.state.block_height}
            </Typography>
            <Typography>
              Storage Used:{" "}
              {accountDetails.state && accountDetails.state.storage_usage} bytes
            </Typography>

            <Typography>{}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} padding="10px">
          <Typography fontWeight={"bold"}>Deluge Ecosystem</Typography>
          <Typography color={"primary"}>
            DLG Token Balance:{" "}
            {(contract_details.stable_balance / 10 ** 8).toFixed(2)}
          </Typography>
          <Typography>
            Storage Staking in Deluge Base:{" "}
            {(contract_details.storage_staking / 10 ** 24).toFixed(2)} Near
          </Typography>
          <Button onClick={handleBuy} variant="contained">
            Buy Deluge Tokens
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>OnGoing Orders</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Account;
