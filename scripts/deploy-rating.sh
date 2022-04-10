cd ../contracts/rating
./build.sh

# local_near doesn't work in this file. don't have time to figure it out
# NEAR_ENV="local" NEAR_CLI_LOCALNET_NETWORK_ID="localnet" NEAR_NODE_URL="http://127.0.0.1:49198" NEAR_CLI_LOCALNET_KEY_PATH="/home/sai/.neartosis/2022-02-20T17.36.37/validator-key.json" NEAR_WALLET_URL="http://127.0.0.1:49202" NEAR_HELPER_URL="http://127.0.0.1:49199" NEAR_HELPER_ACCOUNT="test.near" NEAR_EXPLORER_URL="http://127.0.0.1:49201" 
near deploy --wasmFile res/deluge_rating.wasm --accountId marketplace_rating.test.near
