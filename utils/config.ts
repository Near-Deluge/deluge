import { keyStores, ConnectConfig } from "near-api-js";

let config = {
  networkId: "localnet",
  nodeUrl: process.env.NEAR_NODE_URL!,
  walletUrl: `${process.env.NEAR_WALLET_URL}/wallet`,
  keyPath: process.env.NEAR_CLI_LOCALNET_KEY_PATH,
  helperUrl: process.env.NEAR_HELPER_URL,
  masterAccount: process.env.NEAR_HELPER_ACCOUNT,
  keyStore: new keyStores.UnencryptedFileSystemKeyStore(
    `${process.env["HOME"]}/.near-credentials`
  ),
  headers: {},
} as ConnectConfig;

// Testnet Config
if (process.env.NEAR_ENV === "testnet") {
  const contractName = "dev-1654062670653-36995488391894";
  config = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    contractName: contractName,
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    keyStore: new keyStores.UnencryptedFileSystemKeyStore(
      `${process.env["HOME"]}/.near-credentials`
    ),
    headers: {},
  } as ConnectConfig;
}

export default config;
