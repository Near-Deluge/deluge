import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Buffer } from "buffer";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

// Some Error Realted to Polyfill of Webpack, So injecting it into browser window.
window.Buffer = Buffer;
// Components Imports
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import Home from "./pages/home";
import {
  setState,
  setUser,
  setStore
} from "./redux/slices/contract.slice";
import { Contract, WalletConnection } from "near-api-js";
import { initializeStableCoin } from ".";
import Store from "./pages/store";
import AddStore from "./pages/addStore";

// TODO: Fix this to concrete types from any
type IApp = {
  base_contract: any;
  dlgt_contract: any;
  rating_contract: any;
  currentUser: any;
  nearConfig: any;
  wallet: WalletConnection;
};

type IStableCoinState = {
  balance: number;
  ft_transfer?: (par: any) => any;
};

export default function App({
  base_contract,
  dlgt_contract,
  rating_contract,
  currentUser,
  nearConfig,
  wallet,
}: IApp) {
  const dispatcher = useDispatch();

  const [stable_coin_state, setStableCoinState] =
    React.useState<IStableCoinState>({
      balance: 0,
    });

  const initStableCoin = async () => {
    const arg = {
      account_id: currentUser.accountId,
    };
    const bal = await dlgt_contract.ft_balance_of(arg);
    setStableCoinState({
      ...stable_coin_state,
      balance: bal,
      ft_transfer: dlgt_contract.ft_transfer,
    });
  };

  const checkStore = async () => {
    const arg = {
      account_id: currentUser.accountId,
      store_id: currentUser.accountId,
    };

    const res = await base_contract.retrieve_store({...arg});

    dispatcher(setStore(res))

  };

  React.useEffect(() => {
    console.log(base_contract);
    console.log(dlgt_contract);
    console.log(rating_contract);
    console.log(currentUser);
    console.log(nearConfig);
    console.log(wallet);
    dispatcher(setUser(currentUser));
    initStableCoin();
    checkStore();
  }, []);
  return (
    <div>
      <Navbar
        balance={stable_coin_state.balance}
        base_contract={base_contract}
        user={currentUser}
        wallet={wallet}
      />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/add_store"
            element={<AddStore base_contract={base_contract} wallet={wallet} />}
          />
          <Route path="/store" element={<Store />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
}
