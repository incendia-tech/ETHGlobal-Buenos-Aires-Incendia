// Auction contract interaction utilities

import type { ProofData } from "./auction-abi"
import { AUCTION_ABI } from "./auction-abi"
import { sendTransaction, waitForTransaction, encodeUint256, encodeUint256Array } from "../ethereum/transactions"
import { encodeFunctionData, decodeErrorResult } from "viem"
import { getRabbyProvider, getConnectedAccount } from "../ethereum/wallet"

// Auction contract ABI for submitBid function only (for backward compatibility)
const SUBMIT_BID_ABI = [
  {
    inputs: [
      { internalType: "uint256[2]", name: "proofA", type: "uint256[2]" },
      { internalType: "uint256[2][2]", name: "proofB", type: "uint256[2][2]" },
      { internalType: "uint256[2]", name: "proofC", type: "uint256[2]" },
      { internalType: "uint256[6]", name: "pubSignals", type: "uint256[6]" },
      { internalType: "uint256", name: "_bid", type: "uint256" }
    ],
    name: "submitBid",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const

export interface Groth16Proof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
  protocol: string
  curve: string
}

export function parseGroth16Proof(proofData: string): Groth16Proof {
  try {
    const parsed = JSON.parse(proofData)
    return {
      pi_a: parsed.pi_a,
      pi_b: parsed.pi_b,
      pi_c: parsed.pi_c,
      protocol: parsed.protocol || "groth16",
      curve: parsed.curve || "bn128"
    }
  } catch (error) {
    throw new Error("Invalid proof format")
  }
}

export async function submitBidToContract(
  contractAddress: string,
  proof: Groth16Proof,
  publicSignals: string[],
  bidAmount: string
): Promise<string> {
  try {
    // Create the transaction data using proper viem encoding
    const data = createBidTransactionData(proof, publicSignals, bidAmount)
    
    // Send the transaction
    const txHash = await sendTransaction(contractAddress, "0x0", data)
    
    // Wait for confirmation
    await waitForTransaction(txHash)
    
    return txHash
  } catch (error: any) {
    throw new Error(`Bid submission failed: ${error.message}`)
  }
}

function encodeProofForContract(proof: Groth16Proof): string {
  // Encode pi_a (2 elements)
  const pi_a_encoded = encodeUint256Array(proof.pi_a)
  
  // Encode pi_b (2x2 matrix)
  const pi_b_encoded = proof.pi_b.flat().map(encodeUint256).join("")
  
  // Encode pi_c (2 elements)
  const pi_c_encoded = encodeUint256Array(proof.pi_c)
  
  return pi_a_encoded + pi_b_encoded + pi_c_encoded
}

function createBidTransactionData(proof: Groth16Proof, publicSignals: string[], bidAmount: string): string {
  try {
    console.log("Creating bid transaction data with:", {
      proof: {
        pi_a: proof.pi_a,
        pi_a_length: proof.pi_a?.length,
        pi_b: proof.pi_b,
        pi_b_length: proof.pi_b?.length,
        pi_c: proof.pi_c,
        pi_c_length: proof.pi_c?.length
      },
      publicSignals,
      publicSignals_length: publicSignals?.length,
      bidAmount
    })

    // Validate proof structure
    if (!proof.pi_a || !Array.isArray(proof.pi_a) || proof.pi_a.length < 2) {
      throw new Error(`Invalid proof.pi_a structure: expected array with at least 2 elements, got ${proof.pi_a?.length || 'undefined'}`)
    }
    if (!proof.pi_b || !Array.isArray(proof.pi_b) || proof.pi_b.length < 2) {
      throw new Error(`Invalid proof.pi_b structure: expected array with at least 2 elements, got ${proof.pi_b?.length || 'undefined'}`)
    }
    if (!proof.pi_c || !Array.isArray(proof.pi_c) || proof.pi_c.length < 2) {
      throw new Error(`Invalid proof.pi_c structure: expected array with at least 2 elements, got ${proof.pi_c?.length || 'undefined'}`)
    }
    if (!publicSignals || !Array.isArray(publicSignals) || publicSignals.length !== 6) {
      throw new Error("Invalid publicSignals structure")
    }

    // Convert proof format for Solidity (G2 element conversion)
    const convertedProof = convertG2Format(proof)
    
    console.log("Converted proof:", convertedProof)
    
    // Encode the function call using viem
    const functionData = encodeFunctionData({
      abi: SUBMIT_BID_ABI,
      functionName: 'submitBid',
      args: [
        convertedProof.pi_a.map(BigInt) as [bigint, bigint], // proofA
        convertedProof.pi_b.map(row => row.map(BigInt)) as [[bigint, bigint], [bigint, bigint]], // proofB
        convertedProof.pi_c.map(BigInt) as [bigint, bigint], // proofC
        publicSignals.map(BigInt) as [bigint, bigint, bigint, bigint, bigint, bigint], // pubSignals
        BigInt(bidAmount) // _bid
      ]
    })
    
    console.log("Encoded function data:", functionData)
    return functionData
  } catch (error: any) {
    console.error("Error encoding function data:", error)
    console.error("Error details:", {
      proof: proof,
      publicSignals: publicSignals,
      bidAmount: bidAmount
    })
    throw new Error(`Failed to encode transaction data: ${error.message || error}`)
  }
}

function convertG2Format(proof: Groth16Proof): Groth16Proof {
  return {
    pi_a: proof.pi_a.slice(0, 2), // Take first 2 elements
    pi_b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]], // Swap x0,x1 and y0,y1
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ],
    pi_c: proof.pi_c.slice(0, 2), // Take first 2 elements
    protocol: proof.protocol,
    curve: proof.curve
  }
}

// Registration utility functions
export interface ProofVerificationParams {
  version: string
  proofVerificationData: {
    vkeyHash: string
    proof: string
    publicInputs: string[]
  }
  committedInputs: string
  serviceConfig: {
    validityPeriodInSeconds: bigint
    domain: string
    scope: string
    devMode: boolean
  }
}

/**
 * Check if a user is registered in the auction contract
 */
export async function checkRegistration(contractAddress: string, userAddress: string): Promise<boolean> {
  const provider = await getRabbyProvider()
  if (!provider) {
    throw new Error("Rabby not connected")
  }

  console.log(`[checkRegistration] Checking registration for ${userAddress} on contract ${contractAddress}`)

  try {
    const functionData = encodeFunctionData({
      abi: AUCTION_ABI,
      functionName: 'userIdentifiers',
      args: [userAddress as `0x${string}`]
    })

    const result = await provider.request({
      method: "eth_call",
      params: [
        {
          to: contractAddress,
          data: functionData
        },
        "latest"
      ]
    })

    console.log(`[checkRegistration] userIdentifiers result:`, result)

    // If result is not 0x0000...000, user is registered
    const identifier = BigInt(result || "0x0")
    const isRegistered = identifier !== BigInt(0)
    console.log(`[checkRegistration] User registered: ${isRegistered}, identifier: ${identifier.toString()}`)
    return isRegistered
  } catch (error: any) {
    console.error("[checkRegistration] Error checking registration via userIdentifiers:", error)
    // If the call reverts, try using IsRegistered view function
    try {
      const isRegisteredData = encodeFunctionData({
        abi: AUCTION_ABI,
        functionName: 'IsRegistered'
      })

      await provider.request({
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: isRegisteredData,
            from: userAddress
          },
          "latest"
        ]
      })
      console.log("[checkRegistration] IsRegistered check passed, user is registered")
      return true
    } catch (fallbackError: any) {
      console.log("[checkRegistration] IsRegistered check also failed, user is not registered:", fallbackError)
      return false
    }
  }
}

/**
 * Register a user with ZKPassport proof parameters
 */
export async function registerToAuction(
  contractAddress: string,
  params: ProofVerificationParams,
  isIDCard: boolean = false
): Promise<string> {
  try {
    const provider = await getRabbyProvider()
    if (!provider) {
      throw new Error("Rabby not connected")
    }

    const account = await getConnectedAccount()
    if (!account) {
      throw new Error("No connected account")
    }

    console.log("[registerToAuction] Register params:", {
      domain: params.serviceConfig.domain,
      scope: params.serviceConfig.scope,
      devMode: params.serviceConfig.devMode,
      publicInputsLength: params.proofVerificationData.publicInputs?.length,
      publicInputs: params.proofVerificationData.publicInputs,
      account: account,
      contractAddress: contractAddress
    })
    
    // Ensure scope is set - if empty, use "my-scope" as fallback (matches frontend query)
    const scope = params.serviceConfig.scope || "my-scope"
    console.log("[registerToAuction] Using scope:", scope)
    
    // Log the account and contract for debugging
    console.log("[registerToAuction] Account:", account)
    console.log("[registerToAuction] Contract:", contractAddress)

    // Convert params to proper format for encoding
    const registerParams = {
      version: params.version as `0x${string}`,
      proofVerificationData: {
        vkeyHash: params.proofVerificationData.vkeyHash as `0x${string}`,
        proof: params.proofVerificationData.proof as `0x${string}`,
        publicInputs: params.proofVerificationData.publicInputs.map(pi => pi as `0x${string}`)
      },
      committedInputs: params.committedInputs as `0x${string}`,
      serviceConfig: {
        validityPeriodInSeconds: params.serviceConfig.validityPeriodInSeconds,
        domain: params.serviceConfig.domain,
        scope: scope,
        devMode: params.serviceConfig.devMode
      }
    }

    try {
      const functionData = encodeFunctionData({
        abi: AUCTION_ABI,
        functionName: 'register',
        args: [registerParams, isIDCard]
      })

      // Simulate the transaction
      const accounts = await provider.request({ method: "eth_accounts" })
      await provider.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0],
            to: contractAddress,
            data: functionData
          },
          "latest"
        ]
      })
    } catch (simError: any) {
      console.error("[registerToAuction] Simulation error:", simError)
      console.error("[registerToAuction] Error structure:", {
        code: simError.code,
        message: simError.message,
        data: simError.data,
        dataType: typeof simError.data,
        dataKeys: simError.data ? Object.keys(simError.data) : null,
      })
      
      if (simError.data && typeof simError.data === 'object') {
        console.error("[registerToAuction] Data object contents:", JSON.stringify(simError.data, null, 2))
        for (const [key, value] of Object.entries(simError.data)) {
          if (key === 'originalError' && typeof value === 'object' && value !== null) {
            console.error(`[registerToAuction] data.${key}:`, {
              message: (value as any).message?.slice(0, 200),
              code: (value as any).code,
              data: typeof (value as any).data === 'string' ? (value as any).data.slice(0, 200) : (value as any).data
            })
          } else {
            console.error(`[registerToAuction] data.${key}:`, typeof value === 'string' ? value.slice(0, 200) : value)
          }
        }
      }
      
      // Try to extract revert reason from error
      let errorMessage = "Transaction would fail"
      let revertReason: string | null = null
      
      if (simError.data?.originalError?.data) {
        const hexData = simError.data.originalError.data
        if (typeof hexData === 'string' && hexData.startsWith('0x')) {
          console.error("[registerToAuction] Found hex data in originalError.data:", hexData.slice(0, 100) + "...")
          
          // Try to decode using viem's decodeErrorResult first
          try {
            const decoded = decodeErrorResult({
              abi: AUCTION_ABI,
              data: hexData as `0x${string}`
            })
            revertReason = decoded.errorName
            if (decoded.args && decoded.args.length > 0) {
              revertReason += `: ${decoded.args[0]}`
            }
            console.error("[registerToAuction] Successfully decoded error:", revertReason)
          } catch (decodeError) {
            // If decodeErrorResult fails, try manual parsing for Error(string)
            if (hexData.startsWith('0x08c379a0')) {
              try {
                // Format: 0x08c379a0 (selector) + offset (32 bytes) + length (32 bytes) + string (padded)
                // Skip selector (10 chars), get offset (64 chars), get length (64 chars)
                const offsetHex = hexData.slice(10, 74) // Skip selector, get offset
                const lengthHex = hexData.slice(74, 138) // Get length
                const length = parseInt(lengthHex, 16) * 2 // Convert bytes to hex chars
                
                // Extract the string (skip selector + offset + length = 138 chars)
                const reasonHex = hexData.slice(138, 138 + length)
                const reason = Buffer.from(reasonHex, 'hex').toString('utf8').replace(/\0/g, '').trim()
                
                if (reason && reason.length > 0) {
                  revertReason = reason
                  console.error("[registerToAuction] Successfully parsed revert reason:", revertReason)
                }
              } catch (parseError) {
                console.error("[registerToAuction] Failed to parse revert reason:", parseError)
              }
            }
          }
        }
      }
      
      if (revertReason) {
        errorMessage = `Transaction would fail: ${revertReason}`
        console.error("[registerToAuction] Extracted revert reason:", revertReason)
      } else {
        console.error("[registerToAuction] Could not extract revert reason")
      }
      
      throw new Error(errorMessage)
    }

    const functionData = encodeFunctionData({
      abi: AUCTION_ABI,
      functionName: 'register',
      args: [registerParams, isIDCard]
    })

    const txHash = await sendTransaction(contractAddress, "0x0", functionData)
    await waitForTransaction(txHash)

    return txHash
  } catch (error: any) {
    console.error("[registerToAuction] Registration error:", error)
    throw new Error(`Registration failed: ${error.message || error}`)
  }
}
