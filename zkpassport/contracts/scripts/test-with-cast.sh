#!/bin/bash

# Script to test Auction contract calls using cast (bypassing MetaMask RPC issues)
# Usage: ./test-with-cast.sh [RPC_URL] [PRIVATE_KEY]

set -e

# Contract addresses from the logs
AUCTION_ADDRESS="0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52"
USER_ADDRESS="0xe01b70228e379db064e202ee42596f120b93e789"

# Get RPC URL from argument, env var, or use default
RPC_URL="${1:-${SEPOLIA_RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}}"
PRIVATE_KEY="${2:-${SEPOLIA_PRIVATE_KEY}}"

echo "=========================================="
echo "Testing Auction Contract with Cast"
echo "=========================================="
echo "RPC URL: $RPC_URL"
echo "Auction Address: $AUCTION_ADDRESS"
echo "User Address: $USER_ADDRESS"
echo ""

# Check if cast is installed
if ! command -v cast &> /dev/null; then
    echo "❌ Error: cast is not installed"
    echo "Install it with: foundryup"
    exit 1
fi

# Test 1: Check RPC connection
echo "1️⃣  Testing RPC connection..."
BLOCK_NUMBER=$(cast block-number --rpc-url "$RPC_URL" 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ RPC is working. Current block: $BLOCK_NUMBER"
else
    echo "❌ RPC connection failed: $BLOCK_NUMBER"
    exit 1
fi
echo ""

# Test 2: Get chain ID
echo "2️⃣  Getting chain ID..."
CHAIN_ID=$(cast chain-id --rpc-url "$RPC_URL")
echo "✅ Chain ID: $CHAIN_ID"
echo ""

# Test 3: Check user balance
echo "3️⃣  Checking user balance..."
BALANCE=$(cast balance "$USER_ADDRESS" --rpc-url "$RPC_URL")
BALANCE_ETH=$(cast --to-unit "$BALANCE" ether)
echo "✅ User balance: $BALANCE_ETH ETH"
echo ""

# Test 4: Call userIdentifiers view function
echo "4️⃣  Checking registration status (userIdentifiers)..."
# Function selector for userIdentifiers(address): 0x217b2270
USER_IDENTIFIER=$(cast call "$AUCTION_ADDRESS" \
    "userIdentifiers(address)(bytes32)" \
    "$USER_ADDRESS" \
    --rpc-url "$RPC_URL" 2>&1)

if [ $? -eq 0 ]; then
    if [ "$USER_IDENTIFIER" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
        echo "❌ User is NOT registered (identifier is zero)"
    else
        echo "✅ User IS registered. Identifier: $USER_IDENTIFIER"
    fi
else
    echo "⚠️  Call failed: $USER_IDENTIFIER"
fi
echo ""

# Test 5: Call ceremonyId
echo "5️⃣  Getting ceremony ID..."
CEREMONY_ID=$(cast call "$AUCTION_ADDRESS" \
    "ceremonyId()(uint256)" \
    --rpc-url "$RPC_URL" 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Ceremony ID: $CEREMONY_ID"
else
    echo "⚠️  Call failed: $CEREMONY_ID"
fi
echo ""

# Test 6: Call biddingDeadline
echo "6️⃣  Getting bidding deadline..."
BIDDING_DEADLINE=$(cast call "$AUCTION_ADDRESS" \
    "biddingDeadline()(uint256)" \
    --rpc-url "$RPC_URL" 2>&1)
if [ $? -eq 0 ]; then
    DEADLINE_DATE=$(date -r "$BIDDING_DEADLINE" 2>/dev/null || echo "N/A")
    echo "✅ Bidding deadline: $BIDDING_DEADLINE ($DEADLINE_DATE)"
else
    echo "⚠️  Call failed: $BIDDING_DEADLINE"
fi
echo ""

# Test 7: Estimate gas for register function (if we have calldata)
echo "7️⃣  Testing register function..."
echo "   To test register(), you need the encoded calldata."
echo "   You can get it from the browser console logs."
echo ""
echo "   Example command (replace CALLDATA with actual data):"
echo "   cast send $AUCTION_ADDRESS \\"
echo "     --private-key \$PRIVATE_KEY \\"
echo "     --rpc-url $RPC_URL \\"
echo "     CALLDATA"
echo ""

# If private key is provided, show how to send transaction
if [ -n "$PRIVATE_KEY" ]; then
    echo "8️⃣  Private key detected. To send a register transaction:"
    echo ""
    echo "   First, encode the register function call:"
    echo "   cast calldata \"register((bytes32,(bytes32,bytes,bytes32[]),bytes,(uint256,string,string,bool)),bool)\" \\"
    echo "     \"(VERSION,(VKEYHASH,PROOF,PUBLICINPUTS),COMMITTEDINPUTS,(VALIDITYPERIOD,DOMAIN,SCOPE,DEVMODE))\" \\"
    echo "     ISIDCARD"
    echo ""
    echo "   Then send it:"
    echo "   cast send $AUCTION_ADDRESS \\"
    echo "     --private-key $PRIVATE_KEY \\"
    echo "     --rpc-url $RPC_URL \\"
    echo "     --value 0 \\"
    echo "     --gas-limit 500000 \\"
    echo "     CALLDATA"
    echo ""
else
    echo "8️⃣  No private key provided. Skipping transaction tests."
    echo "   To test transactions, provide a private key:"
    echo "   ./test-with-cast.sh $RPC_URL 0xYOUR_PRIVATE_KEY"
    echo ""
fi

echo "=========================================="
echo "✅ Testing complete!"
echo "=========================================="
echo ""
echo "If RPC calls work here but fail in MetaMask,"
echo "the issue is likely MetaMask's rate limiting."
echo "Consider:"
echo "  1. Using a different RPC endpoint in MetaMask"
echo "  2. Waiting for the rate limit to reset"
echo "  3. Using a dedicated RPC provider (Alchemy/Infura)"

