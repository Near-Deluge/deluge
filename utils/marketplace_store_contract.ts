// Transfer funds from one USDT holder to another
import { Account, connect, ConnectConfig, Contract, InMemorySigner, keyStores, Signer, WalletConnection } from "near-api-js";
import * as cla from "command-line-args";
import config from "./config";
import { join } from "path";
const fs = require('fs');
const ATTACHED_GAS = "300000000000000";
const YOCTO_NEAR = "1000000000000000000000000";

console.log(config);

async function execute() {
    const options = cla([
        {
            name: "contractName", alias: "c", type: String, defaultValue: "marketplace.test.near",
        },
        {
            name: "accountName", alias: "a", type: String, defaultValue: "fabrics-delivery.test.near",
        },
        {
            name: "path", alias: "p", type: String
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
            viewMethods: [], // view methods do not change state but usually return a value
            changeMethods: ["store_contract"], // change methods modify state
        }
    );
}

async function run(options: cla.CommandLineOptions) {
    const near = await connect(config);
    const account = await near.account(options.accountName);
    console.log(await account.getAccountBalance())
    const contract: any = await initContract(options.contractName, account);
    console.log("contract", { contract }, contract.store_contract);
    console.log("Path to Wasm Bin: " , options.path);
    let wasm_bin = fs.readFileSync(options.path);
    console.log("Binary Read: ", wasm_bin);
    let arr = new Uint8Array(wasm_bin);
    console.log("Array: ", arr);
    console.log("I/P: ", typeof [...arr.slice(0,32)]);
    const response = await contract.store_contract({
        args: {args: [...arr]},
        gas: ATTACHED_GAS,
        amount: "1",
        meta: "store_contract"
    });
    console.log("response", { response });
}

execute();