// Transfer funds from one USDT holder to another
import { Account, connect, ConnectConfig, Contract, InMemorySigner, keyStores, Signer, WalletConnection } from "near-api-js";
import * as cla from "command-line-args";
import config from "./config";
import { join } from "path";
const ATTACHED_GAS = "300000000000000";
const YOCTO_NEAR = "1000000000000000000000000";

console.log(config);

async function execute() {
    const options = cla([
        {
            name: "accountName", alias: "a", type: String, defaultValue: "clifford.test.near",
        },
        {
            name: "contractName", alias: "c", type: String, defaultValue: "marketplace.test.near",
        },
        {
            name: "id", alias: "i", type: String,
        }
    ]);

    try {
        console.log(options);
        await run(options);
    }
    catch (error) {
        console.error(error as any);
    }

}

async function initContract(contractName: string, account: Account) {
    return new Contract(
        account, // the account object that is connecting
        contractName,
        {
            // name of contract you're connecting to
            viewMethods: ["retrieve_order"], // view methods do not change state but usually return a value
            changeMethods: [], // change methods modify state
        },
    );
}

async function run(options: cla.CommandLineOptions) {
    const near = await connect(config);
    const account = await near.account(options.accountName);
    console.log("getAccountBalance", await account.getAccountBalance())
    const contract: any = await initContract(options.contractName, account);
    console.log("contract", { contract }, contract.retrieve_order);
    const response = await contract.retrieve_order({ customer_account_id: options.accountName, order_id: options.id });
    console.log("response", response);
}

execute();