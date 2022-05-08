import * as React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import theme from "./theme";
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import "@fontsource/sora";
import "./index.css";

import getConfig from "./config";
import * as nearAPI from "near-api-js";
import { ConnectConfig, WalletConnection } from "near-api-js";
import { ContractMethods } from "near-api-js/lib/contract";
import { RATING_CONTRACT_NAME, STABLECOIN_CONTRACT_NAME } from "./config";

// export const initializeWalletConnection = async () => {
//   const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
//   let conf = getConfig("testnet");

//   // Initializing connection to the NEAR testnet
//   const near = await nearAPI.connect({
//     keyStore,
//     headers: {},
//     networkId: conf.networkId,
//     nodeUrl: conf.nodeUrl,
//   });

//   const walletConnection = new nearAPI.WalletConnection(near, null);
//   return walletConnection;
// };

export const initializeStableCoin = async (
  walletConnection: WalletConnection
) => {
  const methodOptions = {
    viewMethods: ["ft_balance_of"],
    changeMethods: ["ft_transfer"],
    sender: walletConnection.getAccountId(),
  };

  const contract = new nearAPI.Contract(
    walletConnection.account(),
    STABLECOIN_CONTRACT_NAME,
    methodOptions
  );
  return contract;
};

export const initializeRatingContract = async (
  walletConnection: WalletConnection
) => {
  const methodOptions = {
    viewMethods: ["get_owner", "get_marketplace", "get_ratings"],
    changeMethods: ["rate"],
    sender: walletConnection.getAccountId(),
  };

  const contract = new nearAPI.Contract(
    walletConnection.account(),
    RATING_CONTRACT_NAME,
    methodOptions
  );
  return contract;
};

const initializeContract = async () => {
  const nearConfig = getConfig(process.env.NEAR_ENV || "testnet");

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await nearAPI.connect({
    keyStore,
    ...(nearConfig as unknown as ConnectConfig),
  });

  // Initialize wallet connection
  const walletConnection = new nearAPI.WalletConnection(near, null);

  // Load in user's account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      // Gets the accountId as a string
      accountId: walletConnection.getAccountId(),
      // Gets the user's token balance
      balance: (await walletConnection.account().state()).amount,
    };
  } else {
    walletConnection.requestSignIn({
      contractId: nearConfig.contractName,
    })
  }

  // Initializing our contract APIs by contract name and configuration
  const base_contract = new nearAPI.Contract(
    // User's accountId as a string
    walletConnection.account(),
    // accountId of the contract we will be loading
    // NOTE: All contracts on NEAR are deployed to an account and
    // accounts can only have one contract deployed to them.
    nearConfig.contractName,
    {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: [
        "get_nfts",
        "get_latest_codehash",
        "retrieve_store",
        "list_stores",
        "list_store_products",
        "storage_balance_of",
        "storage_minimum_balance",
        "retrieve_order",
        "list_customer_orders",
        "list_store_orders",
        "retrieve_product",
      ],
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: [
        "ft_on_transfer",
        "buy_ft",
        "create_store",
        "update_store",
        "delete_store",
        "storage_deposit",
        "storage_withdraw",
        "cancel_order",
        "intransit_order",
        "schedule_order",
        "complete_order",
        "create_product",
        "update_product",
        "delete_product",
      ],
      // Sender is the account ID to initialize transactions.
      // getAccountId() will return empty string if user is still unauthorized
      sender: walletConnection.getAccountId(),
    } as ContractMethods
  );

  const rating_contract = await initializeRatingContract(walletConnection);
  const dlgt_contract = await initializeStableCoin(walletConnection);

  return {
    base_contract,
    rating_contract,
    dlgt_contract,
    currentUser,
    nearConfig,
    walletConnection,
  };
};

initializeContract().then(
  ({ base_contract, currentUser, nearConfig, walletConnection, dlgt_contract, rating_contract }) => {
    ReactDOM.render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <App
              rating_contract={rating_contract}
              dlgt_contract={dlgt_contract}
              base_contract={base_contract}
              currentUser={currentUser}
              nearConfig={nearConfig}
              wallet={walletConnection}
            />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>,
      document.querySelector("#root")
    );
  }
);
