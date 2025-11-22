import { ZKPassport, type ProofResult } from "@zkpassport/sdk";
import { useState, useRef  } from "react";
import QRCode from "react-qr-code"; // For QR code generation

function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [requestId, setRequestId] = useState("");
  const zkpassportRef = useRef<ZKPassport | null>(null);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerificationStatus("initiating");

    try {
      // Initialize the ZKPassport SDK
      if (!zkpassportRef.current) {
        zkpassportRef.current = new ZKPassport("localhost");
      }

      // Create a verification request
      const query = await zkpassportRef.current.request({
        name: "Incendia",
        logo: "https://yourapp.com/logo.png",
        purpose: "Account verification for registration",
        mode: "compressed-evm",
        devMode: true,
      });

      // Build your verification query - in this example we verify the user is 18+ and disclose nationality
      const {
        url,
        requestId,
        onRequestReceived,
        onGeneratingProof,
        onProofGenerated,
        onResult,
        onReject,
        onError,
      } = query.gte("age", 18).disclose("nationality").done();

      // Save the URL and requestId to display and for potential cancellation
      setVerificationUrl(url);
      setRequestId(requestId);
      console.log("Verification URL:", url);
      console.log("Request ID:", requestId);

      // Update status to show we're waiting for the user to scan the QR code
      setVerificationStatus("awaiting_scan");

      // Register event handlers
      onRequestReceived(() => {
        console.log("Request received");
        setVerificationStatus("request_received");
      });

      onGeneratingProof(() => {
        console.log("Generating proof");
        setVerificationStatus("generating_proof");
      });

      // Store the proofs and query result to send to the server
      const proofs: ProofResult[] = [];
      let proof: ProofResult;

      onProofGenerated((proofResult: ProofResult) => {
        console.log("Proof generated:", proofResult);
        proof = proofResult;
      });

      onResult(async ({ verified, result: queryResult }) => {
        setVerificationStatus("proof_generated");
        console.log("Query verified???:", verified);

        if (!verified) {
          setError("Verification failed on client-side");
          setVerificationStatus("failed");
          return;
        }

        try {
          // Send the proofs and query result to your server for verification
          setVerificationStatus("sending_to_server");
          

          // console.log(proofs);
          setVerificationStatus("success");
          const verifierParams = zkpassportRef.current?.getSolidityVerifierParameters({
            proof: proof
          });
  
          console.log("Submitting on-chain verification transaction...");
          console.log("Verifier parameters:", verifierParams);

          const response = await fetch("https://localhost:3000/register", {
            method: "POST", 
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              verification: {
                proofs,
                queryResult,
              },
            }),
          });

          const data = await response.json();

          if (data.success) {
            setVerificationStatus("success");
            const verifierParams = zkpassportRef.current?.getSolidityVerifierParameters({
              proof: proof
            });
    
            console.log("Submitting on-chain verification transaction...");
            console.log("Verifier parameters:", verifierParams);
            // Here you can redirect to the user's profile or home page
          } else {
            setError(data.error || "Registration failed");
            setVerificationStatus("failed");
          }
        } catch (err) {
          setError("Error communicating with server");
          setVerificationStatus("failed");
        }
      });

      onReject(() => {
        setError("Verification request was rejected");
        setVerificationStatus("rejected");
      });

      onError((error) => {
        setError(`Error during verification: ${error}`);
        setVerificationStatus("error");
      });
    } catch (err) {
      setError(`Failed to initialize verification: ${err instanceof Error ? err.message : "Unknown error"}`);
      setVerificationStatus("error");
    }
  };

  // Function to cancel a verification request
  const cancelVerification = () => {
    if (requestId && zkpassportRef.current) {
      zkpassportRef.current.cancelRequest(requestId);
      setVerificationStatus("idle");
      setVerificationUrl("");
      setRequestId("");
    }
  };

  return (
    <div className="registration-form">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {verificationStatus === "idle" ? (
          <button type="submit">Verify with ZKPassport</button>
        ) : (
          <div className="verification-container">
            <div className="verification-status">
              <p>Status: {verificationStatus.replace(/_/g, " ")}</p>
            </div>

            {verificationUrl && verificationStatus === "awaiting_scan" && (
              <div className="qr-code-container">
                <h3>Scan this QR code with the ZKPassport app</h3>
                <QRCode value={verificationUrl} size={256} />

                <div className="verification-options">
                  <p>
                    <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
                      Open in ZKPassport app
                    </a>
                  </p>
                  <button type="button" onClick={cancelVerification} className="cancel-button">
                    Cancel Verification
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setVerificationStatus("idle");
                    setVerificationUrl("");
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;