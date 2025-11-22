// ABI for the Auction contract
export const AUCTION_ABI = [
  {
    "inputs": [],
    "name": "InvalidProof",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bid",
        "type": "uint256"
      }
    ],
    "name": "BidSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "IsRegistered",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bidSubmissionDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "biddingDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ceremonyId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_biddingDeadline",
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
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "version",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "vkeyHash",
                "type": "bytes32"
              },
              {
                "internalType": "bytes",
                "name": "proof",
                "type": "bytes"
              },
              {
                "internalType": "bytes32[]",
                "name": "publicInputs",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct ProofVerificationData",
            "name": "proofVerificationData",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "committedInputs",
            "type": "bytes"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "validityPeriodInSeconds",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "domain",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "scope",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "devMode",
                "type": "bool"
              }
            ],
            "internalType": "struct ServiceConfig",
            "name": "serviceConfig",
            "type": "tuple"
          }
        ],
        "internalType": "struct ProofVerificationParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "isIDCard",
        "type": "bool"
      }
    ],
    "name": "register",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resultDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[2]",
        "name": "proofA",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "proofB",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "proofC",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[6]",
        "name": "pubSignals",
        "type": "uint256[6]"
      },
      {
        "internalType": "uint256",
        "name": "_bid",
        "type": "uint256"
      }
    ],
    "name": "submitBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "usedNullifiers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userIdentifiers",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifier",
    "outputs": [
      {
        "internalType": "contract Groth16Verifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "zkPassportVerifier",
    "outputs": [
      {
        "internalType": "contract IZKPassportVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export interface ProofData {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
  publicSignals: string[]
}
