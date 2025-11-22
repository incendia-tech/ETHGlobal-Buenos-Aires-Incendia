// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./verifier.sol";

contract Auction {
   Groth16Verifier public verifier;

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

// dont need a construtor since its deployed through factory
    function initialize(
        address _verifier,
        uint256 _biddingDeadline,
        uint256 _submissionDeadline,
        uint256 _resultDeadline,
        uint256 _ceremonyId,
        uint256 _maxWinners
    ) external {
        verifier = Groth16Verifier(_verifier);
        biddingDeadline = _biddingDeadline;
        bidSubmissionDeadline = _submissionDeadline;
        resultDeadline = _resultDeadline;
        ceremonyId = _ceremonyId;
        winners = new address[](_maxWinners);
        winningBids = new uint256[](_maxWinners);
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
        if (usedNullifiers[pubSignals[1]]) revert InvalidProof();

        bool proofIsValid = verifier.verifyProof(
            proofA, proofB, proofC, pubSignals
        );
        if (!proofIsValid) revert InvalidProof();

        usedNullifiers[pubSignals[1]] = true;

        checkAndInsertBid(_bid, msg.sender);

        emit BidSubmitted(msg.sender, pubSignals[3]);
    }


}