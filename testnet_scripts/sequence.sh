# A Utility script to create product on marketplace contract 
#  !!! RUN AFTER deploy-account.js

MARKETPLACE_ACCOUNT=dev-1655015385186-20358082432837
SHOP_ACCOUNT=prix.testnet
STABLECOIN_ACCOUNT=dlgt.deluge.testnet
RATING_ACCOUNT=rating.deluge.testnet
CUSTOMER_ACCOUNT=customer.deluge.testnet

export NEAR_ENV="testnet"

# Change dir

cd ../utils/

npx ts-node marketplace_storage_deposit.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -p 100000000000000000000000
npx ts-node marketplace_create_store.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -p stores/prix.testnet.json

echo "Store is created at this point"
npx ts-node marketplace_retrieve_store.ts -a $SHOP_ACCOUNT -c $MARKETPLACE_ACCOUNT

npx ts-node marketplace_create_product.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -p products/prix.testnet/product-1.json
npx ts-node marketplace_create_product.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -p products/prix.testnet/product-2.json

# Creation of an order
npx ts-node ft_transfer_call.ts -c $STABLECOIN_ACCOUNT -a $CUSTOMER_ACCOUNT -r $MARKETPLACE_ACCOUNT -o orders/order-1.testnet.json -m order-1.testnet.json -i order-1
npx ts-node ft_transfer_call.ts -c $STABLECOIN_ACCOUNT -a $CUSTOMER_ACCOUNT -r $MARKETPLACE_ACCOUNT -o orders/order-2.testnet.json -m order-2.testnet.json -i order-2

# Schedule order orders 
npx ts-node marketplace_schedule_order.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -i $CUSTOMER_ACCOUNT -o order-1
npx ts-node marketplace_schedule_order.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -i $CUSTOMER_ACCOUNT -o order-2

# Set the Order Status to InTransit
npx ts-node marketplace_order_intransit.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -i $CUSTOMER_ACCOUNT -o order-1
npx ts-node marketplace_order_intransit.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -i $CUSTOMER_ACCOUNT -o order-2

npx ts-node marketplace_complete_order.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -b $CUSTOMER_ACCOUNT -o order-1 -s 0001
npx ts-node marketplace_complete_order.ts -c $MARKETPLACE_ACCOUNT -a $SHOP_ACCOUNT -b $CUSTOMER_ACCOUNT -o order-2 -s 0001

npx ts-node rating_get_ratings.ts -a $MARKETPLACE_ACCOUNT -c $RATING_ACCOUNT -s $SHOP_ACCOUNT -p SKU-0450456