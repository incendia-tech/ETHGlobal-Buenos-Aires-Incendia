# Testing Contract Calls with Cast

This guide shows how to test contract interactions using `cast` instead of MetaMask, which helps bypass RPC rate limiting issues.

## Prerequisites

1. Install Foundry (includes `cast`):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Verify installation:
   ```bash
   cast --version
   ```

## Quick Test

Run the test script to verify RPC connection and view contract state:

```bash
cd contracts
./scripts/test-with-cast.sh
```

Or with a custom RPC URL:
```bash
./scripts/test-with-cast.sh https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Testing Registration

### Step 1: Get the Calldata from Browser

1. Open browser console (F12)
2. Look for the log: `MetaMask transaction params`
3. Copy the `data` field value (starts with `0x051d0bbf...`)

### Step 2: Send Transaction with Cast

**Option A: Using the script**
```bash
./scripts/send-register-tx.sh \
  https://ethereum-sepolia-rpc.publicnode.com \
  0xYOUR_PRIVATE_KEY \
  0x051d0bbf...YOUR_CALLDATA
```

**Option B: Direct cast command**
```bash
cast send 0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52 \
  --private-key 0xYOUR_PRIVATE_KEY \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --value 0 \
  --gas-limit 500000 \
  0x051d0bbf...YOUR_CALLDATA
```

## Common Cast Commands

### View Functions

```bash
# Check if user is registered
cast call 0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52 \
  "userIdentifiers(address)(bytes32)" \
  0xe01b70228e379db064e202ee42596f120b93e789 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Get ceremony ID
cast call 0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52 \
  "ceremonyId()(uint256)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Get bidding deadline
cast call 0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52 \
  "biddingDeadline()(uint256)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### Check Transaction Status

```bash
# Get transaction receipt
cast receipt TX_HASH --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Get transaction details
cast tx TX_HASH --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### Estimate Gas

```bash
cast estimate 0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52 \
  "0x051d0bbf...CALLDATA" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --value 0
```

## Environment Variables

You can set these to avoid passing them every time:

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export SEPOLIA_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
```

Then run:
```bash
./scripts/test-with-cast.sh
./scripts/send-register-tx.sh "" "" "0x051d0bbf...CALLDATA"
```

## Troubleshooting

### RPC Rate Limiting

If you get rate limit errors:
1. Use a different RPC endpoint (Alchemy, Infura, etc.)
2. Wait a few minutes and retry
3. Use the public RPC as fallback: `https://ethereum-sepolia-rpc.publicnode.com`

### Gas Estimation Fails

If gas estimation fails, use a fixed gas limit:
```bash
cast send ... --gas-limit 500000
```

### Transaction Reverts

Check the revert reason:
```bash
cast run TX_HASH --rpc-url $RPC_URL
```

## Contract Addresses

- **Auction Contract**: `0x86365C9dD22Ef6458Ae1ab5E057D653c747fAd52`
- **Network**: Sepolia Testnet (Chain ID: 11155111)

## Security Notes

⚠️ **Never commit private keys to version control!**

- Use environment variables for private keys
- Add `.env` to `.gitignore`
- Use separate accounts for testing

