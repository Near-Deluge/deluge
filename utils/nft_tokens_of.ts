// Transfer funds from one USDT holder to another
import { Account, connect, ConnectConfig, Contract, InMemorySigner, keyStores, Signer, WalletConnection } from "near-api-js";
import * as cla from "command-line-args";
import config from "./config";
const ATTACHED_GAS = "300000000000000";
const YOCTO_NEAR = "1000000000000000000000000";

console.log(config);

async function execute() {
    const options = cla([
        {
            name: "contractName", alias: "c", type: String, defaultValue: "fabrics-delivery.marketplace.test.near",
        },
        {
            name: "accountName", alias: "a", type: String, defaultValue: "clifford.test.near",
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

async function loadContract(contractName: string, account: Account) {
    return new Contract(
        account, // the account object that is connecting
        contractName,
        {
            // name of contract you're connecting to
            viewMethods: ["nft_tokens_for_owner"], // view methods do not change state but usually return a value
            changeMethods: [""], // change methods modify state
        }
    );

}

async function run(options: cla.CommandLineOptions) {
    const near = await connect(config);
    const account = await near.account(options.accountName);
    const contract: any = await loadContract(options.contractName, account);
    const response = await contract.nft_tokens_for_owner(
        {
            account_id: options.accountName, // argument name and value - pass empty object if no args required
            from_index: "0",
            limit: 10,
        }
    );
    console.log("response", { response });
}

execute();