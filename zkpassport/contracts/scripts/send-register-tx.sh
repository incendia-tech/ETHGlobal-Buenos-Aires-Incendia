#!/bin/bash

# Script to send register transaction using cast
# Usage: ./send-register-tx.sh [RPC_URL] [PRIVATE_KEY] [CALLDATA]

set -e

AUCTION_ADDRESS="0x94765117D62A0ca58CFD2c48cB3BC1ee7ed9DA1f"

# Get parameters
RPC_URL="${1:-${SEPOLIA_RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}}"
PRIVATE_KEY="${2:-${SEPOLIA_PRIVATE_KEY}}"
CALLDATA="${3}"

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Private key required"
    echo "Usage: ./send-register-tx.sh [RPC_URL] PRIVATE_KEY [CALLDATA]"
    echo "   or set SEPOLIA_PRIVATE_KEY environment variable"
    exit 1
fi

if [ -z "$CALLDATA" ]; then
    echo "⚠️  No calldata provided. You can get it from browser console logs."
    echo "   Look for: 'MetaMask transaction params' -> 'data' field"
    echo ""
    echo "Usage: ./send-register-tx.sh [RPC_URL] PRIVATE_KEY CALLDATA"
    echo ""
    echo "Example:"
    echo "  ./send-register-tx.sh \\"
    echo "    https://ethereum-sepolia-rpc.publicnode.com \\"
    echo "    0xYOUR_PRIVATE_KEY \\"
    echo "    0x051d0bbf..."
    exit 1
fi

echo "=========================================="
echo "Sending Register Transaction with Cast"
echo "=========================================="
echo "RPC URL: $RPC_URL"
echo "Auction Address: $AUCTION_ADDRESS"
echo "Calldata length: ${#CALLDATA} characters"
echo ""

# Check if cast is installed
if ! command -v cast &> /dev/null; then
    echo "❌ Error: cast is not installed"
    echo "Install it with: foundryup"
    exit 1
fi

# Get account address from private key
ACCOUNT=$(cast wallet address "$PRIVATE_KEY")
echo "Account: $ACCOUNT"

# Check balance
BALANCE=$(cast balance "$ACCOUNT" --rpc-url "$RPC_URL")
BALANCE_ETH=$(cast --to-unit "$BALANCE" ether)
echo "Balance: $BALANCE_ETH ETH"
echo ""

# Estimate gas
echo "Estimating gas..."
GAS_ESTIMATE=$(cast estimate "$AUCTION_ADDRESS" \
    "$CALLDATA" \
    --rpc-url "$RPC_URL" \
    --value 0 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Gas estimate: $GAS_ESTIMATE"
    # Add 20% buffer
    GAS_LIMIT=$(cast --to-uint256 "$(($GAS_ESTIMATE * 120 / 100))")
else
    echo "⚠️  Gas estimation failed: $GAS_ESTIMATE"
    echo "   Using default gas limit: 500000"
    GAS_LIMIT=500000
fi
echo ""

# Get current gas price
echo "Getting current gas price..."
GAS_PRICE=$(cast gas-price --rpc-url "$RPC_URL")
echo "Gas price: $GAS_PRICE wei"
echo ""

# Send transaction
echo "Sending transaction..."
echo "This will send a real transaction to Sepolia testnet!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

TX_HASH=$(cast send "$AUCTION_ADDRESS" \
    --private-key "$PRIVATE_KEY" \
    --rpc-url "$RPC_URL" \
    --value 0 \
    --gas-limit "$GAS_LIMIT" \
    "$CALLDATA" 2>&1)

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Transaction sent successfully!"
    echo "Transaction hash: $TX_HASH"
    echo ""
    echo "View on Etherscan:"
    echo "  https://sepolia.etherscan.io/tx/$TX_HASH"
    echo ""
    echo "Waiting for confirmation..."
    cast receipt "$TX_HASH" --rpc-url "$RPC_URL" --confirmations 1 > /dev/null
    echo "✅ Transaction confirmed!"
else
    echo ""
    echo "❌ Transaction failed: $TX_HASH"
    exit 1
fi

