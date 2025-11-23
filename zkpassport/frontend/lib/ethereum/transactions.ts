// Ethereum transaction utilities

import { getRabbyProvider } from "./wallet"

export async function sendTransaction(to: string, value: string, data?: string): Promise<string> {
  const provider = await getRabbyProvider()
  if (!provider) {
    throw new Error("Rabby not connected")
  }

  const accounts = await provider.request({ method: "eth_accounts" })
  if (!accounts || accounts.length === 0) {
    throw new Error("No connected account")
  }

  try {
    const transactionParams = {
      from: accounts[0],
      to,
      value,
      data,
      gas: "0x7a120", // 500,000 gas limit (needed for ZK proof verification)
      gasLimit: "0x7a120", // Alternative gas limit parameter
    }
    
    console.log("Rabby transaction params:", transactionParams)
    console.log("Data length:", data?.length)
    console.log("Data preview:", data?.slice(0, 100) + "...")
    
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionParams],
    })
    return txHash
  } catch (error: any) {
    console.error("Rabby transaction error:", error)
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      data: error.data
    })
    throw new Error(`Rabby transaction failed: ${error.message || error.code || 'Unknown error'}`)
  }
}

export async function waitForTransaction(txHash: string, confirmations: number = 1): Promise<void> {
  const provider = await getRabbyProvider()
  if (!provider) {
    throw new Error("Rabby not connected")
  }

  return new Promise((resolve, reject) => {
    const checkConfirmation = async () => {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })

        if (receipt && receipt.status === "0x1") {
          resolve()
        } else if (receipt && receipt.status === "0x0") {
          // Transaction failed - try to get revert reason
          try {
            const tx = await provider.request({
              method: "eth_getTransactionByHash",
              params: [txHash],
            })
            
            // Try to call the transaction with eth_call to get revert reason
            try {
              await provider.request({
                method: "eth_call",
                params: [tx, "latest"],
              })
            } catch (callError: any) {
              // Extract revert reason if available
              const revertReason = callError.message || callError.data
              if (revertReason && revertReason.includes("revert")) {
                reject(new Error(`Transaction failed: ${revertReason}`))
                return
              }
            }
          } catch (err) {
            console.error("Error getting transaction details:", err)
          }
          
          reject(new Error("Transaction failed - check receipt for details"))
        } else {
          // Transaction not yet confirmed, check again
          setTimeout(checkConfirmation, 2000)
        }
      } catch (error) {
        reject(error)
      }
    }

    checkConfirmation()
  })
}

// Utility functions for encoding data
export function encodeUint256(value: string | number): string {
  const hex = BigInt(value).toString(16)
  return "0x" + hex.padStart(64, "0")
}

export function encodeUint256Array(values: (string | number)[]): string {
  return values.map(encodeUint256).join("")
}
