// Factory contract ABI and constants

export const FACTORY_ADDRESS = "0xc5af9d7b8d881a6e3121817507bea1431d0e61e7"

export const FACTORY_ABI = [
  {
    "inputs": [],
    "name": "InvalidCeremonyType",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "SaltAlreadyUsed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum Factory.CeremonyType",
        "name": "votingType",
        "type": "uint8"
      }
    ],
    "name": "Deployed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "contracts",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_salt",
        "type": "bytes32"
      },
      {
        "internalType": "enum Factory.CeremonyType",
        "name": "_ceremonyType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_biddingDealine",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_submissionDeadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_resultDeadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_ceremonyId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxWinners",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_zkPassportVerifierAddress",
        "type": "address"
      }
    ],
    "name": "deployAuctionContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const
