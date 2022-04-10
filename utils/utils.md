# Utils - how to use

## ft_balance_of
`npx ts-node ft_balance_of.ts -c usdt.test.near -a dev0.test.near`

## ft_transfer
Amount value is in absolute. No conversions.
`npx ts-node ft_transfer.ts -c usdt.test.near -a dev0.test.near -r clifford.test.near --amount 100000000000`

## ft_transfer_call // Entry to the order creation
`npx ts-node ft_transfer_call.ts -c usdt.test.near -a dev0.test.near -r marketplace.test.near -o orders/order-1.json -m order-1.json`

# Interact with marketplace

# IMPORTANT: setup marketplace ft_contract_name
`npx ts-node marketplace_set_ft_contract_name.ts -c marketplace.test.near -a marketplace.test.near --ftContractName usdt.test.near`

# setup rating smart contract name
# setup nft marketplace contract name

## create_store
`npx ts-node marketplace_create_store.ts -c marketplace.test.near -a fabrics-delivery.test.near -p stores/fabrics-delivery.test.near.json`

## retrieve_store
`npx ts-node marketplace_retrieve_store.ts -a fabrics-delivery.test.near`

## list_stores
`npx ts-node marketplace_list_stores.ts -a fabrics-delivery.test.near`

## update_store
TODO

## delete_store
`npx ts-node marketplace_delete_store.ts  -c marketplace.test.near -a fabrics-delivery.test.near`

## create_product
`npx ts-node marketplace_create_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -p products/fabrics-delivery.test.near/product-1.json`
`npx ts-node marketplace_create_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -p products/fabrics-delivery.test.near/product-2.json`

## update_product
## TODO: Update for product
`npx ts-node marketplace_update_product.ts -c marketplace.test.near -a fabrics-delivery.test.near --productId product-1 --description "updated description!"`

## retrieve_product
`npx ts-node marketplace_retrieve_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -i product-1`
`npx ts-node marketplace_retrieve_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -i product-2`

## delete_product
`npx ts-node marketplace_delete_product.ts -c marketplace.test.near -a fabrics-delivery.test.near -p product-1`

## list_store_products
`npx ts-node marketplace_list_store_products.ts -c marketplace.test.near -a fabrics-delivery.test.near`

## create_order
`npx ts-node ft_transfer_call.ts -c usdt.test.near -a clifford.test.near -r marketplace.test.near -o orders/order-1.json -m order-1.json -i order-1`
`npx ts-node ft_transfer_call.ts -c usdt.test.near -a clifford.test.near -r marketplace.test.near -o orders/order-2.json -m order-2.json -i order-2`

## retrieve_order
`npx ts-node marketplace_retrieve_order.ts -c marketplace.test.near -a clifford.test.near -i order-1`

## list_customer_orders
`npx ts-node marketplace_list_customer_orders.ts -c marketplace.test.near -a fabrics-delivery.test.near -i clifford.test.near`

## list_store_orders
`npx ts-node marketplace_list_store_orders.ts -c marketplace.test.near -a fabrics-delivery.test.near -i fabrics-delivery.test.near`

## complete_order
`npx ts-node marketplace_complete_order.ts -c marketplace.test.near -a dev0.test.near -b clifford.test.near -o order-1 -s seed`

## schedule_order
`npx ts-node marketplace_schedule_order.ts -c marketplace.test.near -a fabrics-delivery.test.near -i clifford.test.near -o order-1`

## intransit_order
`npx ts-node marketplace_order_intransit.ts -c marketplace.test.near -a fabrics-delivery.test.near -i clifford.test.near -o order-1`

## cancel_order
`npx ts-node marketplace_cancel_order.ts -c marketplace.test.near -a fabrics-delivery.test.near -o order-1`

# Delete contract account
near delete marketplace.test.near test.near
# Create marketplace.test.near
near create-account marketplace.test.near --masterAccount test.near --initialBalance 10


# Rating Contract

## create rating
`npx ts-node rating_create.ts -a marketplace.test.near -c marketplace_rating.test.near -s fabrics-delivery.test.near -p product-1 -r 0 -b clifford.test.near`
`npx ts-node rating_create.ts -a marketplace.test.near -c marketplace_rating.test.near -s fabrics-delivery.test.near -p product-1 -r 0 -b dev0.test.near`

## view rating
`npx ts-node rating_get_ratings.ts -a marketplace.test.near -c marketplace_rating.test.near -s fabrics-delivery.test.near -p product-1`

## get owner
`npx ts-node rating_get_ratings.ts -a marketplace.test.near -c marketplace_rating.test.near`

## rate a product rating
`npx ts-node rating_rate.ts -a clifford.test.near -c marketplace_rating.test.near -s fabrics-delivery.test.near -p product-1 -r 8 -i QwertyKeypad`