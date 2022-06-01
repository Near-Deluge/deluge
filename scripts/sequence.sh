
./accounts.sh
./stablecoins.sh
./distribute-funds.sh
./deploy-marketplace.sh
./deploy-rating.sh

# Change dir

cd ../utils/

npx ts-node ft_transfer.ts -c usdt.test.near -a usdt.test.near -r clifford.test.near --amount 100000000000

#  Initialize the contract here
npx ts-node marketplace_initialize.ts -a marketplace.test.near

npx ts-node marketplace_set_ft_contract_name.ts -c marketplace.test.near -a marketplace.test.near --ftContractName usdt.test.near
npx ts-node marketplace_set_rating_contract_name.ts -c marketplace.test.near -a marketplace.test.near --ratingContractName marketplace_rating.test.near

# Deposit Storage Near to the Marketplace
npx ts-node marketplace_storage_deposit.ts -c marketplace.test.near -a fabrics-delivery.test.near -p 100000000000000000000000
npx ts-node marketplace_storage_view.ts -c marketplace.test.near -a fabrics-delivery.test.near


npx ts-node marketplace_create_store.ts -c marketplace.test.near -a fabrics-delivery.test.near -p stores/fabrics-delivery.test.near.json

echo "Store is created at this point"
npx ts-node marketplace_retrieve_store.ts -a fabrics-delivery.test.near

# npx ts-node marketplace_create_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -p products/fabrics-delivery.test.near/product-1.json
# npx ts-node marketplace_create_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -p products/fabrics-delivery.test.near/product-2.json

# npx ts-node ft_transfer_call.ts -c usdt.test.near -a clifford.test.near -r marketplace.test.near -o orders/order-1.json -m order-1.json -i order-1
# npx ts-node marketplace_schedule_order.ts -c marketplace.test.near -a fabrics-delivery.test.near -i clifford.test.near -o order-1

# # Get the Order Status to InTransit
# npx ts-node marketplace_order_intransit.ts -c marketplace.test.near -a fabrics-delivery.test.near -i clifford.test.near -o order-1

# npx ts-node marketplace_complete_order.ts -c marketplace.test.near -a dev0.test.near -b clifford.test.near -o order-1 -s 0001

