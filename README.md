# Anonymous Auction using proof-of-burn

A fully on-chain, anonymous auction protocol using Proof-of-Burn and zk-SNARKs. Bidders burn tokens to unspendable addresses, generate a zero-knowledge proof, and submit their bids on Ethereum-compatible chains without sacrificing privacy or verifiability.

## Protocol Description

The auction protocol presented here is inspired by the core ideas of our previouse voting protocol [e-paper](https://eprint.iacr.org/2025/1022). While both systems share conceptual similarities in using zero-knowledge proofs and private proof-of-burn commitments, for this Hackathon we worked on completely new concepts:

- completely reedesigned smart contracts with usage of oracles (specifically Chainlink's LatestTimeStamps)
- full integration with [zkPassport's SDK](https://zkpassport.id/) as the new method for registration and identity verification for the auction
- support of [Hedera](https://hedera.com/) network
- usage of [HardHat v3](https://hardhat.org/) in our Contract developements


The auction protocol operates in four main phases:

1. **Setup:** In the setup phase, the organizer deploys or configures a dedicated auction smart contract on the blockchain using our Factory contract, specifying parameters such as the auction options, time frames, and proof-of-burn verification logic.
2. **Registration:** eligible bidders generate commitments to their identities and submit zero-knowledge proofs of eligibility (using [zkPassport](https://zkpassport.id/)).
3. **Bidding:** each bidder generates a unique, unspendable burn address (i.e. hash of some parameters including: bid amount, bidder's ID from registration phase, auction ceremony's ID, and a random value as the blinding factor) and sends a small amount of tokens to it, effectively committing to their bid. Note that this transaction is a normal token transfer to a normal looking address and therefore doesn't reveal the fact that the bidder is participating in an auction (here no contract interactions are involved).
4. **Bid Submission / Tally:** When the bidding deadline reaches, the bidders then produce a zero-knowledge proof attesting to the correctness of the burn, their eligibility, and the proper formation of a unique nullifier that prevents double bidding (refer to the [e-paper](https://eprint.iacr.org/2025/1022) for details and formal analysis of the soundness of our protocol). During the winner determination phase, the bidder submits their plaintext bid along with the proof to the smart contract. The contract verifies the proof on-chain, ensures the nullifier’s uniqueness, and immediately updates the winner so far. This design eliminates the need for trusted authorities and also does not require ANY sort of off-chain servers or tally services. We achieve maintaining transparency, scalability, and bidder anonymity through unlinkability between bidders and bids.

## Features

- **Fully Decentralized and On-Chain**: No trusted third parties or off-chain winner determination, everything happens in smart contracts.
- **Strong Binding**: The bid value cannot be changed once submitted.
- **Bidder Anonymity and Unlinkability**: There is no on-chain linkage between a bidders’s identity, their burn transaction, and the bid value.
- **Lightweight ZKPs**: Uses Circom + Groth16 for succinct proofs; avoids heavy homomorphic encryption or MPC overhead.
- **Public Verifiability**: All bids, proofs, and determination operations are publicly auditable on-chain, allowing any observer to verify the correctness of the final outcome.
- **Scalability and Efficiency**: Bids are submitted in plaintext, and verification is lightweight, resulting in low on-chain computation and gas costs.

## Repo Structure

There are two main directories. In each directory, there is a dedicated README.md to provide further details:

1. **zkPassport:** contains eveything required to showcase the integration of zkPassport with our registration phase, including: Contracts, Circuits, Frontend SDK.
2. **Hedera:** Contrains our updated version of the contracts with the Chainlink's Oracle on Hedera Testnet. It also includes a frontend version of our auction app similiar to the zkPassport's demo that we have but with the Hedera RPCs.

All of the contract folders include proper config, deploy, and sendTx scripts with HardHat 3.


