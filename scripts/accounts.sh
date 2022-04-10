ID=test.near

echo "Creating Accounts"
near create-account fabrics-delivery.$ID --masterAccount $ID --initialBalance 1000

echo "Creating Customers"
near create-account clifford.$ID --masterAccount $ID --initialBalance 1000

echo "Creating marketplace"
near create-account marketplace.test.near --masterAccount test.near --initialBalance 1000

echo "Creating Stablecoins"
near create-account usdt.$ID --masterAccount $ID --initialBalance 1000

echo "Create test accounts"
near create-account dev0.$ID --masterAccount $ID --initialBalance 1000

echo "Create rating account"
near create-account marketplace_rating.$ID --masterAccount $ID --initialBalance 1000
