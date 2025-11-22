pragma solidity ^0.8.21;


import "./IZKPassportHelper.sol";

/**
 * @notice The data that can be disclosed by the proof
 */
struct DisclosedData {
    // The name of the ID holder (includes the angular brackets from the MRZ)
    string name;
    // The issuing country of the ID
    string issuingCountry;
    // The nationality of the ID holder
    string nationality;
    // The gender of the ID holder
    string gender;
    // The birth date of the ID holder
    string birthDate;
    // The expiry date of the ID
    string expiryDate;
    // The document number of the ID
    string documentNumber;
    // The type of the document
    string documentType;
}

// ProofVerificationParams
// │
// ├── bytes32 version                        // Version identifier of the verifier
// │
// ├── ProofVerificationData proofVerificationData
// │   ├── bytes32 vkeyHash                   // Verification key hash
// │   ├── bytes proof                        // The actual ZK proof
// │   └── bytes32[] publicInputs             // Array of public inputs (7+ elements)
// │       │                                  // Use PublicInputsCast.asStruct() for structured access:
// │       ├── [0] certificate_registry_root  // Field - struct.certificateRegistryRoot
// │       ├── [1] circuit_registry_root      // Field - struct.circuitRegistryRoot
// │       ├── [2] current_date               // u64 - PublicInputsCast.getCurrentDate(struct)
// │       ├── [3] service_scope              // Field - struct.serviceScope
// │       ├── [4] service_subscope           // Field - struct.serviceSubscope
// │       ├── [5:5+N] param_commitments      // Field[N] - PublicInputsCast.getParamCommitment(array, index)
// │       ├── [5+N] nullifier_type           // u8 - PublicInputsCast.getNullifierType(array, paramCount)
// │       └── [6+N] scoped_nullifier         // Field - PublicInputsCast.getScopedNullifier(array, paramCount)
// │
// ├── bytes committedInputs              // Preimages of param_commitments
// │
// └── ServiceConfig serviceConfig
//     ├── uint256 validityPeriodInSeconds    // How long the proof is valid
//     ├── string domain                      // Service domain
//     ├── string scope                       // Service scope
//     └── bool devMode                       // Development mode flag
struct ProofVerificationParams {
  bytes32 version;
  ProofVerificationData proofVerificationData;
  bytes committedInputs;
  ServiceConfig serviceConfig;
}

struct ProofVerificationData {
  bytes32 vkeyHash;
  bytes proof;
  bytes32[] publicInputs;
}

struct ServiceConfig {
  uint256 validityPeriodInSeconds;
  string domain;
  string scope;
  bool devMode;
}

/**
 * @notice The public interface for the ZKPassport verifier contract
 */
interface IZKPassportVerifier {
  /**
   * @notice Verifies a proof from ZKPassport
   * @param params The proof verification parameters
   * @return isValid True if the proof is valid, false otherwise
   * @return uniqueIdentifier The unique identifier associated to the identity document that generated the proof
   * @return helper The ZKPassportHelper contract that can be used to verify the information or conditions that are checked by the proof
   */
  function verify(ProofVerificationParams calldata params) external returns (bool verified, bytes32 uniqueIdentifier, IZKPassportHelper helper);
}
