# 🔥 Incendia - Anonymous Auction using Proof-of-Burn

A fully on-chain, anonymous auction protocol using Proof-of-Burn and zk-SNARKs. Bidders burn tokens to unspendable addresses, generate zero-knowledge proofs, and submit their bids on Ethereum-compatible chains without sacrificing privacy or verifiability.

## 📋 Table of Contents

- [Overview](#overview)
- [What is ZKPassport?](#what-is-zkpassport)
- [Why ZKPassport?](#why-zkpassport)
- [Protocol Description](#protocol-description)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

Incendia is an innovative auction protocol that combines **ZKPassport** for identity verification with **Proof-of-Burn** for bid commitment. This creates a fully decentralized, anonymous auction system where:

- ✅ Bidders remain anonymous throughout the process
- ✅ Identity verification happens privately using zero-knowledge proofs
- ✅ Bids are committed through token burns before reveal
- ✅ All operations are verifiable on-chain
- ✅ No trusted third parties required

## 🔐 What is ZKPassport?

**ZKPassport** is a zero-knowledge identity verification system that allows users to prove they meet certain eligibility requirements (like age, nationality, etc.) without revealing their actual identity or personal information.

### Key Concepts:

- **Zero-Knowledge Proofs**: Mathematical proofs that allow you to prove you know something (like being over 18) without revealing what that something is
- **Privacy-Preserving**: Your personal data never leaves your device
- **Verifiable**: Anyone can verify the proof is valid without seeing the underlying data
- **Binding**: Proofs can be cryptographically bound to specific addresses or chains

## 🎯 Why ZKPassport?

In traditional auction systems, identity verification creates a fundamental privacy problem:

### The Problem:
1. **Identity Leakage**: To verify eligibility (e.g., age requirements), bidders must reveal their identity
2. **Linkability**: Once identity is known, all bids can be linked to specific individuals
3. **Privacy Trade-offs**: You can't have both verification and privacy

### The Solution - ZKPassport:

ZKPassport solves this by enabling **private identity verification**:

1. **Prove Without Revealing**: Bidders prove they meet requirements (e.g., age ≥ 18) without revealing their actual age or identity
2. **Unlinkability**: The verification proof doesn't reveal who you are, only that you're eligible
3. **Binding to Address**: The proof can be cryptographically bound to your wallet address, ensuring one registration per person
4. **On-Chain Verification**: Smart contracts can verify the proof without seeing any personal data

### What ZKPassport Solves in This Auction:

- ✅ **Eligibility Verification**: Ensures only eligible participants (e.g., 18+) can register
- ✅ **Privacy Preservation**: Personal information never needs to be shared
- ✅ **Sybil Resistance**: Binding proofs to addresses prevents multiple registrations
- ✅ **Compliance**: Meets regulatory requirements (age verification) without sacrificing privacy
- ✅ **Trustless**: No need for a trusted identity provider

### How It Works in Incendia:

1. **Registration Phase**: Bidders use ZKPassport to generate a zero-knowledge proof that they meet eligibility requirements
2. **On-Chain Verification**: The smart contract verifies the ZKPassport proof without seeing any personal data
3. **Binding**: The proof is cryptographically bound to the bidder's wallet address and chain ID
4. **Anonymity**: Once registered, the bidder's identity remains private throughout the auction

## 🏗️ Protocol Description

The auction protocol operates in four main phases:

### 1. Setup Phase
The organizer deploys or configures a smart contract on the blockchain, specifying parameters such as:
- Auction options and time frames
- Proof-of-burn verification logic
- Eligibility requirements (verified via ZKPassport)

### 2. Registration Phase
Eligible bidders:
- Generate a ZKPassport proof attesting to their eligibility (e.g., age ≥ 18)
- Submit the proof to the smart contract for verification
- The contract verifies the proof and registers the bidder
- A commitment to the bidder's identity is stored on-chain (without revealing the identity)

This structure ensures that only registered participants can later submit valid bids while preserving complete anonymity.

### 3. Bidding Phase
Each bidder:
1. **Generates a unique burn address**: Creates an unspendable address using a hash of:
   - Bid amount
   - Bidder's ID (from registration)
   - Ceremony ID
   - Random value
2. **Burns tokens**: Sends a small amount of tokens to the burn address, committing to their bid
3. **Generates zero-knowledge proof**: Produces a zk-SNARK proof attesting to:
   - Correctness of the burn
   - Eligibility (from registration)
   - Proper formation of a unique nullifier (prevents double bidding)
4. **Submits bid**: Submits the plaintext bid along with the proof to the smart contract

The contract verifies the proof on-chain, ensures the nullifier's uniqueness, and immediately updates the current winner. This design eliminates the need for trusted authorities, maintaining transparency, scalability, and bidder anonymity through unlinkability between bidders and bids.

### 4. Winner Determination Phase
- All valid bids are verified and compared on-chain
- The bid value cannot be changed once submitted
- The winner is determined at the end of the bidding phase
- All operations are publicly verifiable

## ✨ Features

### 🔒 **Privacy & Anonymity**
- **Bidder Anonymity**: No on-chain linkage between a bidder's identity, their burn transaction, and the bid value
- **Unlinkability**: Registration, burn, and bid submission cannot be linked to the same person
- **Private Identity Verification**: ZKPassport enables eligibility checks without revealing personal information

### 🌐 **Decentralization**
- **Fully On-Chain**: No trusted third parties or off-chain winner determination
- **Smart Contract Based**: Everything happens in smart contracts
- **Public Verifiability**: All bids, proofs, and determination operations are publicly auditable

### ⚡ **Efficiency**
- **Lightweight ZKPs**: Uses Circom + Groth16 for succinct proofs
- **Low Gas Costs**: Bids submitted in plaintext with lightweight verification
- **Scalable**: Avoids heavy homomorphic encryption or MPC overhead

### 🛡️ **Security**
- **Nullifier System**: Prevents double bidding through unique nullifiers
- **Cryptographic Binding**: ZKPassport proofs bound to addresses prevent Sybil attacks
- **Immutable Bids**: Bid values cannot be changed once committed

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Registration Phase                        │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  ZKPassport  │ ──────> │   Smart      │                  │
│  │   Proof      │         │   Contract   │                  │
│  └──────────────┘         └──────────────┘                  │
│       (Private)              (Public)                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Bidding Phase                            │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Burn Tokens │ ──────> │   Generate   │                  │
│  │  to Address  │         │   ZK Proof   │                  │
│  └──────────────┘         └──────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│                  ┌──────────────┐                            │
│                  │   Submit     │                            │
│                  │   Bid + Proof │                            │
│                  └──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Winner Determination Phase                     │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Verify      │ ──────> │   Determine  │                  │
│  │  All Proofs  │         │   Winner     │                  │
│  └──────────────┘         └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before setting up the project, ensure the following tools are installed:

### Required:
- **Node.js** 18+ and npm
- **Git**
- **Rabby Wallet** (or compatible Web3 wallet) for frontend interaction
- **Testnet ETH** (Sepolia) for testing

### Optional but Recommended:
- **Hardhat** (for contract development)
- **Circom** (for circuit development)
- **snarkjs** (for proof generation)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zkpassport
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Contracts
```bash
cd contracts
npm install
```

### 3. Environment Setup

Create environment files as needed (see individual READMEs in `frontend/` and `contracts/` directories).

### 4. Build Circuits (if modifying)

```bash
cd circuits
# Follow circuit compilation instructions
```

## 📖 Usage

### Running the Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Deploying Contracts

```bash
cd contracts
npx hardhat ignition deploy ignition/modules/Auction.ts --network sepolia
```

### Testing

```bash
# Test contracts
cd contracts
npx hardhat test

# Test frontend (if tests exist)
cd frontend
npm test
```

## 📁 Project Structure

```
zkpassport/
├── circuits/              # Circom circuits for zk-SNARKs
│   ├── auction.circom     # Main auction circuit
│   ├── burnAddress.circom # Burn address generation
│   ├── nullifier.circom   # Nullifier generation
│   └── ...
├── contracts/             # Smart contracts
│   ├── contracts/
│   │   ├── Auction.sol    # Main auction contract
│   │   ├── Factory.sol    # Auction factory
│   │   └── IZKPassportVerifier.sol  # ZKPassport interface
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
└── frontend/              # Next.js frontend application
    ├── app/               # Next.js app router
    │   ├── page.tsx      # Landing page
    │   ├── auctions/      # Auction list page
    │   └── auction/[id]/ # Individual auction pages
    └── lib/               # Utility libraries
        ├── contracts/     # Contract interaction
        └── ethereum/      # Wallet integration
```

## 🔗 Key Components

### ZKPassport Integration
- **Registration**: Users verify identity using ZKPassport SDK
- **Proof Generation**: Zero-knowledge proofs generated client-side
- **On-Chain Verification**: Smart contracts verify proofs without seeing data

### Proof-of-Burn
- **Burn Address Generation**: Deterministic addresses from bid parameters
- **Token Burning**: ETH/tokens sent to unspendable addresses
- **Proof Generation**: zk-SNARKs prove correct burn without revealing bid

### Smart Contracts
- **Auction Contract**: Manages auction lifecycle and bid verification
- **Factory Contract**: Deploys new auction instances
- **Verifier Contract**: Verifies Groth16 proofs on-chain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Built for ETHGlobal Buenos Aires
- Inspired by zero-knowledge voting protocols
- Uses ZKPassport for identity verification
- Powered by Circom and Groth16

---

**Note**: This protocol is developed from scratch, inspired by zero-knowledge voting protocols but with a completely new architecture, circuits, and logic tailored specifically for bid submission and winner determination.

