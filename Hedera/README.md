# Hedera EVM Inovation Bounty

## Contract Details
- **Verifier:** this is our Groth16 Verifier, generated automatically by Circom for our Private Proof-of-Burn ZK circuits.
- **Errors:** simple error emitters.
- **Auction:** The main logic behind our auction. It also includes the chainlink's oracle.
- **Factory:** Is responsible for deploying instances of Auction contract. we use this to minimize the auction ceremony setup complexity. Simply call the createAuction functionality with proper configs.

## Hedera Testnet deployments

- **Verifier:** [https://hashscan.io/testnet/contract/0.0.7306132](https://hashscan.io/testnet/contract/0.0.7306132)
- **Auction** [https://hashscan.io/testnet/contract/0.0.7307004](https://hashscan.io/testnet/contract/0.0.7307004)
- **Factory:** [https://hashscan.io/testnet/contract/0.0.7306976](https://hashscan.io/testnet/contract/0.0.7306976)
- **Example SubmitBid Tx 1:** [https://hashscan.io/testnet/transaction/1763864149.277072542](https://hashscan.io/testnet/transaction/1763864149.277072542)
- **Example SubmitBid Tx 2:** [https://hashscan.io/testnet/transaction/1763859649.983790204](https://hashscan.io/testnet/transaction/1763859649.983790204)
- **[Not Deployed by us] Chainlink Oracle that we use:** [https://hashscan.io/testnet/contract/0.0.4870176](https://hashscan.io/testnet/contract/0.0.4870176)
