const sh = require("shelljs");
const accs = require("./accounts.json");

// Assuming Contracts are build and wasms in wasm folder to current script dir

const calledFromDir = sh.pwd().toString();
console.log(calledFromDir);

function createSubAccount(name, master) {
  const res = sh.exec(
    `near create-account ${name}.${master} --masterAccount ${master}`
  );
  return res;
}

function deleteSubAccount(name, master) {
  const res = sh.exec(`near delete ${name}.${master} ${master}`);
  return res;
}

function transferFundsSubAccount(name, master, amount) {
  const res = sh.exec(`near send ${name}.${master} ${master} ${amount}`);
  if (res.code === 0) {
    console.log("Funds Transferred Successfully. ");
  }
}

if (calledFromDir.match("testnet_script")) {
  console.log(accs);

  console.log("Called from testnet scripts");

  const ft_wasm = `${calledFromDir}/wasm/fungible_token.wasm`;
  const marketplace_wasm = `${calledFromDir}/wasm/marketplace.wasm`;
  const rating_wasm = `${calledFromDir}/wasm/deluge_rating.wasm`;

  // Delete Sub-Accounts for Sanitary States
  let del_rat_res = deleteSubAccount("rating", accs.master);
  let del_usdt_res = deleteSubAccount("dlgt", accs.master);
  let del_cust_res = deleteSubAccount("customer", accs.master);

  // Create Sub-Accounts
  let rat_res = createSubAccount("rating", accs.master);
  let usdt_res = createSubAccount("dlgt", accs.master);
  let cust_res = createSubAccount("customer", accs.master);

  // Send Some Near to Sub Accounts : By default CLI Sends 100 Near, This is just as Insurance.
  transferFundsSubAccount("rating", accs.master, 10);
  transferFundsSubAccount("dlgt", accs.master, 10);
  transferFundsSubAccount("customer", accs.master, 10);

  // Delploy Contracts
  let ft_deploy = sh.exec(`near deploy ${accs.dlgt} ${ft_wasm}`);
  // Using dev-deploy since of restriction on delete large state contract on testnet
  // https://stackoverflow.com/questions/70616916/how-to-delete-near-account-with-large-state
  let marketplace_deploy = sh.exec(
    `near dev-deploy ${marketplace_wasm} -f`
  );
  let rating_deploy = sh.exec(`near deploy ${accs.rating} ${rating_wasm}`);

  // if(ft_deploy.code === 0) {
  //     let ftAccountId = ft_deploy.stdout.match(/(dev-[0-9]*-[0-9]*)\w/)[0];
  //     console.log("Dev Mid Account: ", ftAccountId);
  //     accounts.usdt = ftAccountId;
  // }

  if(marketplace_deploy.code === 0) {
      let marketplaceAccountId = marketplace_deploy.stdout.match(/(dev-[0-9]*-[0-9]*)\w/)[0];
      console.log("Dev Marketplace Account: ", marketplaceAccountId);
      accs.marketplace = marketplaceAccountId;
  }

  console.log(accs);
  const accountsFilePath = `${calledFromDir}/accounts.json`;
  const accountsFilePathFrontEnd = `${calledFromDir}/../app/ui/src/accounts.json`;
  sh.rm('-f', accountsFilePath);
  sh.rm('-f', accountsFilePathFrontEnd);
  require('fs').writeFileSync(accountsFilePath, JSON.stringify(accs), 'utf-8');
  require('fs').writeFileSync(accountsFilePathFrontEnd, JSON.stringify(accs), 'utf-8');

  // console.log("Accounts Formed: ", accounts);

  console.log("Calling New on Marketplace.");
  const marketplace_new_res = sh.exec(
    `near call ${accs.marketplace} new --accountId ${accs.marketplace}`
  );

  console.log("Miniting USDT Token");
  const ft_new_mint = sh.exec(
    `near call ${accs.dlgt} new '{"owner_id": "${accs.dlgt}", "total_supply": "1000000000000000", "metadata": { "spec": "ft-1.0.0", "name": "deluge-stable", "symbol": "DLGT", "decimals": 8 }}' --accountId ${accs.dlgt}`
  );
  console.log("Status Code: ", ft_new_mint.code);

  // Call to set ft contract and rating contract on marketplace contract
  sh.exec(
    `near call ${accs.marketplace} set_ft_contract_name --args '{"ft_contract_name" : "${accs.dlgt}"}' --depositYocto 1 --accountId ${accs.marketplace}`
  );
  sh.exec(
    `near call ${accs.marketplace} set_rating_contract_name --args '{"rating_contract_name" : "${accs.rating}"}' --depositYocto 1 --accountId ${accs.marketplace}`
  );

  console.log("===========================");
  console.log("Distributing USDT Tokens");
  distribute_tokens(accs.dlgt, accs.marketplace, "prix.testnet", "customer.deluge.testnet");

  list_products();

}

function distribute_tokens(usdtAccount, marketplaceAccount, customerAccount, shopCustomer) {
  console.log("==============================");
  console.log("Doing Storage deposits!");
  sh.exec(
    `near call ${usdtAccount} storage_deposit '' --accountId ${customerAccount} --amount 0.00125`
  );
  sh.exec(
    `near call ${usdtAccount} storage_deposit '' --accountId ${shopCustomer} --amount 0.00125`
  );
  sh.exec(
    `near call ${usdtAccount} storage_deposit '' --accountId ${marketplaceAccount} --amount 0.00125`
  );

  console.log("===============================");
  console.log("Transferring Tokens");
  sh.exec(
    `near call ${usdtAccount} ft_transfer '{"receiver_id": "${customerAccount}", "amount": "50000000000"}' --accountId ${usdtAccount} --amount 0.000000000000000000000001`
  );

  sh.exec(
    `near call ${usdtAccount} ft_transfer '{"receiver_id": "${shopCustomer}", "amount": "50000000000"}' --accountId ${usdtAccount} --amount 0.000000000000000000000001`
  );
  sh.exec(
    `near call ${usdtAccount} ft_transfer '{"receiver_id": "${marketplaceAccount}", "amount": "500000000000"}' --accountId ${usdtAccount} --amount 0.000000000000000000000001`
  );
}

function list_products() {
  console.log("===================================");
  console.log("Deploying Products");
}
