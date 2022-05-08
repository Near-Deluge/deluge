const sh = require("shelljs");

const ben_account = "deluge.testnet";
const iters = 100;

const calledFromDir = sh.pwd().toString();
console.log(calledFromDir);

const ft_wasm = `${calledFromDir}/wasm/fungible_token.wasm`;

for (let i = 0; i < iters; ++i) {
  let ft_deploy = sh.exec(`near dev-deploy -f ${ft_wasm}`);

  if (ft_deploy.code === 0) {
    let ftAccountId = ft_deploy.stdout.match(/(dev-[0-9]*-[0-9]*)\w/)[0];
    console.log("Dev Mid Account: ", ftAccountId);
    sh.exec(`near delete ${ftAccountId} ${ben_account}`);
  }
}
