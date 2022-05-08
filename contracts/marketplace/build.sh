#!/bin/bash
set -e
cd "`dirname $0`"
cargo build --all --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/*.wasm ./res/
cp target/wasm32-unknown-unknown/release/*.wasm ../../testnet_scripts/wasm/
