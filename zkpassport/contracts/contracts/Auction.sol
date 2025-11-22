// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IZKPassportVerifier.sol";
import "./IZKPassportHelper.sol";
import "./verifier.sol";

contract Auction {
   Groth16Verifier public verifier;
   IZKPassportVerifier public zkPassportVerifier;

   error InvalidProof();

    uint256 public ceremonyId;

    uint256 public biddingDeadline;
    uint256 public bidSubmissionDeadline;
    uint256 public resultDeadline;
    


    uint256[] winningBids;
    address[] winners;

    event BidSubmitted(address indexed bidder, uint256 bid);


    bool private initialized = false;
    mapping(uint256 => bool) public usedNullifiers;
    mapping(address => bytes32) public userIdentifiers;
// dont need a construtor since its deployed through factory
    function initialize(
        address _verifier,
        uint256 _biddingDeadline,
        uint256 _submissionDeadline,
        uint256 _resultDeadline,
        uint256 _ceremonyId,
        uint256 _maxWinners,    
        address _zkPassportVerifierAddress
    ) external {
        verifier = Groth16Verifier(_verifier);
        biddingDeadline = _biddingDeadline;
        bidSubmissionDeadline = _submissionDeadline;
        resultDeadline = _resultDeadline;
        ceremonyId = _ceremonyId;
        winners = new address[](_maxWinners);
        winningBids = new uint256[](_maxWinners);
        zkPassportVerifier = IZKPassportVerifier(_zkPassportVerifierAddress);
        initialized = true;
    }


    function submitBid(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        uint256[6] calldata pubSignals,
        uint256 _bid
    ) external payable {
        // Check if nullifier has already been used
        IsRegistered();
        if (usedNullifiers[pubSignals[1]]) revert InvalidProof();

        bool proofIsValid = verifier.verifyProof(
            proofA, proofB, proofC, pubSignals
        );
        if (!proofIsValid) revert InvalidProof();

        usedNullifiers[pubSignals[1]] = true;

        checkAndInsertBid(_bid, msg.sender);

        emit BidSubmitted(msg.sender, pubSignals[3]);
    }


    function checkAndInsertBid(uint256 bid, address bidder) internal returns (bool) {
        for (uint256 i = 0; i < winners.length; i++) {
            if (bid > winningBids[i]) {
                for (uint256 j = winners.length - 1; j > i; j--) {
                    winners[j] = winners[j - 1];
                    winningBids[j] = winningBids[j - 1];
                }
                winningBids[i] = bid;
                winners[i] = bidder;
                return true;
            }
        }
        return false;
    }



    function register(ProofVerificationParams calldata params, bool isIDCard) public returns (bytes32) {
        (bool verified, bytes32 uniqueIdentifier, IZKPassportHelper helper) = zkPassportVerifier.verify(params);
        require(verified, "Proof is invalid");

        require(
          helper.verifyScopes(params.proofVerificationData.publicInputs, "your-domain.com", "my-scope"),
          "Invalid scope"
        );

        bool isAgeAboveOrEqual = helper.isAgeAboveOrEqual(
          18,
          params.committedInputs
        );

        require(isAgeAboveOrEqual, "Age is not above or equal to 18");
        DisclosedData memory disclosedData = helper.getDisclosedData(
          params.committedInputs,
          isIDCard
        );
        string memory nationality = disclosedData.nationality;

        BoundData memory boundData = helper.getBoundData(params.committedInputs);
        require(boundData.senderAddress == msg.sender, "Not the expected sender");
        require(boundData.chainId == block.chainid, "Invalid chain id");

        userIdentifiers[msg.sender] = uniqueIdentifier;

        return uniqueIdentifier;
    }

    function IsRegistered() public view {
        require(userIdentifiers[msg.sender] != bytes32(0), "Not verified");
    }

}