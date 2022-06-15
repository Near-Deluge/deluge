import React, { useContext, useState } from "react";

import { Button, Container, Grid, Typography } from "@mui/material";

import CreateStore from "../components/stores/createStore";

import AddBusiness from "@mui/icons-material/AddBusiness";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "../utils/interface";
import { ONE_NEAR } from "../config";
import BN from "big.js";
import { useNavigate } from "react-router-dom";

import bs58 from "bs58";

import { KeyStoreContext, WalletConnectionContext } from "..";
import { setUser, User } from "../redux/slices/contract.slice";
import { useSnackbar } from "notistack";
import { change_near_to_human } from "../utils/utils";
import { ATTACHED_GAS } from "./cart";
import useLocalStorageKey, {
  generateKeyPair,
  ILocalStorageKey,
} from "../hooks/useLocalStorageKey";

type IAddStore = {
  base_contract: any;
  wallet: any;
};

const AddStore: React.FC<IAddStore> = ({ base_contract, wallet }) => {
  const curStore = useSelector((state: any) => state.storeSlice.currentStore);
  const user = useSelector((state: any) => state.contractSlice.user);

  const walletConnection = useContext(WalletConnectionContext);
  const dispatcher = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const navigation = useNavigate();
  const [local, setLocal] = React.useState({
    storage_deposit: 0,
  });


  React.useEffect(() => {
    if (user.store) {
      navigation("/store", { replace: true });
    }
  });

  // Check if user exists on redux, if not fetch it
  React.useState(() => {
    (async () => {
      if (
        !user.accountId &&
        user.accountId.length === 0 &&
        walletConnection !== null
      ) {
        const currentUser: User = {
          // Gets the accountId as a string
          accountId: walletConnection.getAccountId(),
          // Gets the user's token balance
          balance: (await walletConnection.account().state()).amount,
          store: null,
        };

        dispatcher(setUser(currentUser));
      }
    })();
  });

  React.useEffect(() => {
    (async () => {
      const res = await base_contract.storage_balance_of({
        account_id: user.accountId,
      });
      console.log("Storage Deposit: ", res);
      setLocal({
        storage_deposit: res,
      });

      enqueueSnackbar(
        `Fetched Storage Successfully: ${change_near_to_human(res)} N`,
        {
          variant: "success",
        }
      );
    })();
  }, [user]);

  const handleStorageDeposit = () => {
    base_contract.storage_deposit({
      args: {
        account_id: user.accountId,
      },
      amount: new BN(ONE_NEAR).div(10).toFixed().toString(),
    });
  };

  const handleSubmit = () => {
    let finalStore: Store = {
      ...curStore,
      lat_lng: {
        ...curStore.lat_lng,
        latitude: parseFloat(curStore.lat_lng.latitude),
        longitude: parseFloat(curStore.lat_lng.longitude),
      },
    };

    // Send Transaction to Base Contract to Create a Store Here.
    base_contract.create_store({
      args: {
        store: finalStore,
      },
      gas: ATTACHED_GAS,
      // Sending 5 Near as Insurance for now.
      amount: new BN(ONE_NEAR).mul(5).toFixed().toString(),
      meta: "create_store",
    });
  };
  return (
    <Grid container>
      <Grid item xs={12} sm={2} />
      <Grid item xs={12} sm={8}>
        <Typography variant="h4" textAlign={"center"} gutterBottom>
          <AddBusiness fontSize="large" />
          Create a Store
        </Typography>
        {local.storage_deposit && local.storage_deposit > 0 ? (
          <React.Fragment>
            <Typography gutterBottom textAlign={"center"}>
              {" "}
              Current Storage Deposit:{" "}
              {(local.storage_deposit / ONE_NEAR).toFixed(2)} Near
            </Typography>
            <CreateStore handleSubmit={handleSubmit} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography>
              You will have to make a small Storage Deposit on smart contract to
              Store the Details on Blockchain. 0.1 Near for now
            </Typography>
            <Button variant="contained" onClick={handleStorageDeposit}>
              Deposit Storage
            </Button>
          </React.Fragment>
        )}
      </Grid>
      <Grid item xs={12} sm={2} />
    </Grid>
  );
};

export default AddStore;
