// Transfer funds from one USDT holder to another
import {
  Account,
  connect,
  ConnectConfig,
  Contract,
  InMemorySigner,
  keyStores,
  Signer,
  WalletConnection,
} from "near-api-js";
import * as cla from "command-line-args";
import config from "./config";
import { join } from "path";
const ATTACHED_GAS = "300000000000000";
const YOCTO_NEAR = "1000000000000000000000000";

console.log(config);

async function execute() {
  const options = cla([
    {
      name: "accountName",
      alias: "a",
      type: String,
      defaultValue: "fabrics-delivery.test.near",
    },
    {
      name: "contractName",
      alias: "c",
      type: String,
      defaultValue: "marketplace.test.near",
    },
    {
      name: "amount",
      alias: "p",
      type: String,
    },
  ]);

  try {
    console.log(options);
    await run(options);
  } catch (error) {
    console.error(error as any);
  }
}

async function initContract(contractName: string, account: Account) {
  return new Contract(
    account, // the account object that is connecting
    contractName,
    {
      // name of contract you're connecting to
      viewMethods: [], // view methods do not change state but usually return a value
      changeMethods: ["storage_deposit"], // change methods modify state
    }
  );
}

async function run(options: cla.CommandLineOptions) {
  const near = await connect(config);
  const account = await near.account(options.accountName);
  console.log("getAccountBalance", await account.getAccountBalance());
  const contract: any = await initContract(options.contractName, account);
  console.log("contract", { contract }, contract.storage_deposit);
  const response = await contract.storage_deposit({
    args: {
      account_id: options.accountName,
    },
    gas: ATTACHED_GAS,
    amount: options.amount,
  });
  console.log("response", response);
}

execute();
