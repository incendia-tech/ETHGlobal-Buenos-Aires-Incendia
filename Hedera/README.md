# Hedera EVM Inovation Bounty

## Contract Details
- **Verifier:** this is our Groth16 Verifier, generated automatically by Circom for our Private Proof-of-Burn ZK circuits.
- **Errors:** simple error emitters.
- **Auction:** The main logic behind our auction. It also includes the chainlink's oracle.
- **Factory:** Is responsible for deploying instances of Auction contract. we use this to minimize the auction ceremony setup complexity. Simply call the createAuction functionality with proper configs.

## Hedera Testnet deployments

- **Verifier:**
- **Auction**
- **Factory:**
- **Example SubmitBid Tx 1:**
- **Example SubmitBid Tx 2:**
