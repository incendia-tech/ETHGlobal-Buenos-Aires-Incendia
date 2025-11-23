"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ZKPassport, type ProofResult } from "@zkpassport/sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Wallet, Loader2, CheckCircle2, QrCode, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getRabbyProvider, connectWallet, getConnectedAccount } from "@/lib/ethereum/wallet"
import { registerToAuction, checkRegistration, type ProofVerificationParams } from "@/lib/contracts/auction"

type RegistrationStep = "connect" | "verify" | "registering" | "success" | "error"

export default function RegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string
  
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("connect")
  const [error, setError] = useState("")
  const [verificationUrl, setVerificationUrl] = useState("")
  const [requestId, setRequestId] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("idle")
  const [registerTxHash, setRegisterTxHash] = useState("")
  const [networkName, setNetworkName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const zkpassportRef = useRef<ZKPassport | null>(null)
  const proofRef = useRef<ProofResult | null>(null)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    const account = await getConnectedAccount()
    if (account) {
      setWalletAddress(account)
      setWalletConnected(true)
      setCurrentStep("verify")
      await getNetworkName()
    }
  }

  const getNetworkName = async () => {
    const provider = await getRabbyProvider()
    if (provider) {
      try {
        const chainId = await provider.request({ method: "eth_chainId" })
        const networks: { [key: string]: string } = {
          "0x1": "Ethereum Mainnet",
          "0xaa36a7": "Sepolia Testnet",
          "0x5": "Goerli Testnet",
          "0x13882": "Polygon Amoy Testnet",
        }
        setNetworkName(networks[chainId] || `Chain ID: ${chainId}`)
      } catch (error) {
        console.error("Error getting network:", error)
      }
    }
  }

  const handleConnectWallet = async () => {
    setIsProcessing(true)
    setError("")
    try {
      const { account } = await connectWallet()
      setWalletAddress(account)
      setWalletConnected(true)
      setCurrentStep("verify")
      await getNetworkName()
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      setError(error.message || "Failed to connect to MetaMask")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartVerification = async () => {
    setError("")
    setVerificationStatus("initiating")

    try {
      // Get wallet address and chain ID BEFORE creating the request
      const account = await getConnectedAccount()
      if (!account) {
        throw new Error("Please connect your wallet first")
      }

      const provider = await getRabbyProvider()
      if (!provider) {
        throw new Error("Rabby not connected")
      }

      // Get current chain ID
      const chainIdHex = await provider.request({ method: "eth_chainId" })
      const chainId = BigInt(chainIdHex)

      console.log("Binding proof to:", {
        senderAddress: account,
        chainId: chainId.toString(),
        chainIdHex: chainIdHex
      })

      // Initialize the ZKPassport SDK
      // Note: The domain must match what's checked in the contract (Auction.sol line 99)
      if (!zkpassportRef.current) {
        zkpassportRef.current = new ZKPassport("localhost")
      }

      // Create a verification request with binding for compressed-evm mode
      // For compressed-evm mode, binding MUST be passed when creating the request
      // This ensures the binding data is included in the proof generation
      const query = await zkpassportRef.current.request({
        name: "Incendia Auction",
        logo: "https://yourapp.com/logo.png",
        purpose: "Register for auction participation",
        scope: "my-scope",
        mode: "compressed-evm",
        devMode: true
      })

      // Build your verification query - verify the user is 18+ and disclose nationality
      const {
        url,
        requestId,
        onRequestReceived,
        onGeneratingProof,
        onProofGenerated,
        onResult,
        onReject,
        onError,
      } = query.gte("age", 18).disclose("nationality")  // Bind the user's address to the proof
      .bind("user_address", account as `0x${string}`)
      // Bind to the chain where the proof will be verified
      // This is strongly typed to the networks we support and plan to support in the near future
      .bind("chain", "ethereum_sepolia").done()

      console.log("account as `0x${string}:", account as `0x${string}`)

      // Save the URL and requestId
      setVerificationUrl(url)
      setRequestId(requestId)
      setVerificationStatus("awaiting_scan")

      // Register event handlers
      onRequestReceived(() => {
        console.log("Request received")
        setVerificationStatus("request_received")
      })

      onGeneratingProof(() => {
        console.log("Generating proof")
        setVerificationStatus("generating_proof")
      })

      onProofGenerated((proofResult: ProofResult) => {
        console.log("Proof generated:", proofResult)
        proofRef.current = proofResult
      })

      onResult(async ({ verified, result: queryResult }) => {
        setVerificationStatus("proof_generated")
        console.log("Query verified:", verified)

        if (!verified) {
          setError("Verification failed on client-side")
          setVerificationStatus("failed")
          return
        }

        try {
          // Get solidity verifier parameters
          if (!zkpassportRef.current || !proofRef.current) {
            throw new Error("ZKPassport not initialized or proof not generated")
          }

          // Get solidity verifier parameters
          // Binding was already done when creating the request above,
          // so it should be included in the committed inputs automatically
          const verifierParams = zkpassportRef.current.getSolidityVerifierParameters({
            proof: proofRef.current,
            devMode: true,
          })
          
          // Verify that committedInputs is present and not empty
          // For compressed-evm mode with binding, committedInputs should contain the binding data
          if (!verifierParams.committedInputs || verifierParams.committedInputs.length === 0) {
            throw new Error("Committed inputs are missing or empty. Binding may not have been applied correctly.")
          }
          
          console.log("Committed inputs length:", verifierParams.committedInputs.length)
          console.log("Committed inputs preview:", verifierParams.committedInputs.slice(0, 200))

          console.log("Verifier parameters:", verifierParams)
          console.log("Service config:", verifierParams.serviceConfig)
          console.log("Domain:", verifierParams.serviceConfig?.domain)
          console.log("Scope:", verifierParams.serviceConfig?.scope)

          // Register on-chain
          setCurrentStep("registering")
          setVerificationStatus("registering_onchain")

          const txHash = await registerToAuction(
            auctionId,
            verifierParams as unknown as ProofVerificationParams,
            false // isIDCard
          )

          setRegisterTxHash(txHash)
          setCurrentStep("success")
          setVerificationStatus("success")

          // Check registration to confirm
          const isRegistered = await checkRegistration(auctionId, walletAddress)
          if (!isRegistered) {
            throw new Error("Registration check failed after transaction")
          }
        } catch (err: any) {
          console.error("Registration failed:", err)
          setError(err.message || "Registration failed")
          setCurrentStep("error")
          setVerificationStatus("error")
        }
      })

      onReject(() => {
        setError("Verification request was rejected")
        setVerificationStatus("rejected")
        setCurrentStep("error")
      })

      onError((error) => {
        setError(`Error during verification: ${error}`)
        setVerificationStatus("error")
        setCurrentStep("error")
      })
    } catch (err: any) {
      setError(`Failed to initialize verification: ${err.message || "Unknown error"}`)
      setVerificationStatus("error")
      setCurrentStep("error")
    }
  }

  const cancelVerification = () => {
    if (requestId && zkpassportRef.current) {
      zkpassportRef.current.cancelRequest(requestId)
      setVerificationStatus("idle")
      setVerificationUrl("")
      setRequestId("")
    }
  }

  const handleContinue = () => {
    router.push(`/auction/${auctionId}`)
  }

  const getExplorerUrl = (txHash: string) => {
    if (networkName.includes("Sepolia")) {
      return `https://sepolia.etherscan.io/tx/${txHash}`
    }
    return `https://etherscan.io/tx/${txHash}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/auction/${auctionId}`} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Auction
            </Link>
            {walletConnected && (
              <div className="flex items-center gap-3">
                {networkName && (
                  <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full font-medium">
                    {networkName}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="font-mono font-medium">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Register for Auction</CardTitle>
            <CardDescription>
              Complete ZKPassport verification to register for this auction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Connect Wallet */}
            {currentStep === "connect" && (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                  Connect your MetaMask wallet to start the registration process
                </p>
                <Button 
                  onClick={handleConnectWallet} 
                  disabled={isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: ZKPassport Verification */}
            {currentStep === "verify" && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <QrCode className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">ZKPassport Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Verify your identity using ZKPassport to register for this auction
                  </p>
                </div>

                {verificationStatus === "idle" && (
                  <Button onClick={handleStartVerification} className="w-full" size="lg">
                    Start Verification
                  </Button>
                )}

                {verificationStatus === "awaiting_scan" && verificationUrl && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        Scan this QR code with the ZKPassport app
                      </h4>
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-lg">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verificationUrl)}`}
                            alt="ZKPassport QR Code"
                            className="w-64 h-64"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Open in ZKPassport app
                        </a>
                        <br />
                        <Button
                          variant="outline"
                          onClick={cancelVerification}
                          size="sm"
                        >
                          Cancel Verification
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {verificationStatus && ["request_received", "generating_proof", "proof_generated", "registering_onchain"].includes(verificationStatus) && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 capitalize">
                      {verificationStatus.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Registering */}
            {currentStep === "registering" && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Registering...</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {registerTxHash
                    ? "Transaction submitted! Waiting for confirmation..."
                    : "Please confirm the transaction in MetaMask..."}
                </p>
                
                {registerTxHash && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 max-w-2xl mx-auto">
                    <p className="text-sm font-semibold text-gray-600 mb-3">Transaction Hash</p>
                    <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
                      <p className="font-mono text-sm text-gray-900 break-all flex-1">
                        {registerTxHash}
                      </p>
                      <a
                        href={getExplorerUrl(registerTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === "success" && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                  <p className="text-gray-600">
                    You have successfully registered for this auction. You can now proceed to place your bid.
                  </p>
                </div>

                {registerTxHash && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-gray-900 break-all flex-1">
                            {registerTxHash}
                          </p>
                          <a
                            href={getExplorerUrl(registerTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleContinue} className="w-full" size="lg">
                  Continue to Bidding
                </Button>
              </div>
            )}

            {/* Step 5: Error */}
            {currentStep === "error" && (
              <div className="text-center py-8">
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error || "An error occurred during registration"}</AlertDescription>
                </Alert>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setCurrentStep("verify")} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => router.push(`/auction/${auctionId}`)}>
                    Back to Auction
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

