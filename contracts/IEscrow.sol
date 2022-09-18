// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEscrow {
    function getBuyer() external returns (address);

    function getSeller() external returns (address);

    function getDepositedPrice() external returns (uint256);

    function txStatus() external view returns (bool);

    function getVerifier() external view returns (address);

    function getVerifierApproval() external view returns (bool);
}
