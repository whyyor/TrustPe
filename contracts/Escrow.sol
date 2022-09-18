// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IDaiPool.sol";

contract Escrow {
    address verifier;
    address buyer;
    address seller;
    uint256 depositedPrice;
    uint256 deliveryTime;
    uint256 createdTime;
    uint256 approvalCount;
    bool verifierApproval = false;
    bool buyerApproval = false;
    bool txCompleted = false;
    bool paid = false;
    bool delivered = false;
    IERC20 dai;
    IDaiPool tDaiPool;

    using SafeMath for uint256;

    constructor(
        address _verifier,
        address _seller,
        address _buyer,
        uint256 _deliveryTime,
        uint256 _price,
        IERC20 _dai,
        IDaiPool _tDai
    ) {
        verifier = _verifier;
        seller = _seller;
        buyer = _buyer;
        deliveryTime = _deliveryTime * 1 days;
        depositedPrice = _price;
        createdTime = block.timestamp;
        dai = _dai;
        tDaiPool = _tDai;

        approvalCount = 0;
    }

    function pay() public {
        require(msg.sender == buyer, "Only buyer can pay");
        dai.transferFrom(buyer, address(this), depositedPrice);
        dai.approve(address(tDaiPool), depositedPrice);
        tDaiPool.deposit(depositedPrice);
        paid = true;
    }

    function approve() public {
        require(
            (msg.sender == verifier) || (msg.sender == buyer),
            "Only verifier and buyer can approve"
        );
        require(paid == true, "Not paid yet");
        uint256 balanceDai = tDaiPool.daiOwned();

        require(balanceDai >= depositedPrice, "Dai already withdrawn");

        if ((msg.sender == verifier) && verifierApproval == false) {
            approvalCount += 1;
            verifierApproval = true;
        }

        if ((msg.sender == buyer) && buyerApproval == false) {
            approvalCount += 1;
            buyerApproval = true;
        }
    }

    function deliver() public {
        require(
            (approvalCount == 2) &&
                (buyerApproval == true) &&
                (verifierApproval == true),
            "2 approvals expected"
        );

        if ((block.timestamp - createdTime) > deliveryTime) {
            uint256 amtToTransfer = depositedPrice.mul(9).div(10);
            tDaiPool.withdraw(amtToTransfer);
            dai.transfer(seller, amtToTransfer);
            uint256 toBurn = tDaiPool.balanceOf(address(this));
            tDaiPool.burn(toBurn);
            txCompleted = true;
            delivered = true;
        }

        if ((block.timestamp - createdTime) <= deliveryTime) {
            tDaiPool.withdraw(depositedPrice);
            dai.transfer(seller, depositedPrice);
            uint256 earnedTDP = tDaiPool.balanceOf(address(this));
            tDaiPool.transfer(buyer, earnedTDP);
            txCompleted = true;
            delivered = true;
        }
    }

    function withdraw() public {
        require(msg.sender == buyer, "Only buyer can withdraw");
        require(
            (approvalCount == 0) && (verifierApproval == false),
            "There shouldn't be any approvals"
        );

        if ((block.timestamp - createdTime) < deliveryTime) {
            uint256 amtToTransfer = depositedPrice.mul(9).div(10);
            tDaiPool.withdraw(amtToTransfer);
            dai.transfer(buyer, amtToTransfer);
            uint256 toBurn = tDaiPool.balanceOf(address(this));
            tDaiPool.burn(toBurn);
        }

        if ((block.timestamp - createdTime) > deliveryTime) {
            tDaiPool.withdraw(depositedPrice);
            dai.transfer(buyer, depositedPrice);
            uint256 earnedTDP = tDaiPool.balanceOf(address(this));
            tDaiPool.transfer(buyer, earnedTDP);
        }

        txCompleted = true;
        delivered = true;
    }

    function getBuyer() public view returns (address) {
        return address(buyer);
    }

    function getSeller() public view returns (address) {
        return seller;
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    function getTDAIbalance() public view returns (uint256) {
        return tDaiPool.balanceOf(address(this));
    }

    function getApprovalCount() public view returns (uint256) {
        return approvalCount;
    }

    function getDepositedPrice() public view returns (uint256) {
        return depositedPrice;
    }

    function getVerifierApproval() public view returns (bool) {
        return verifierApproval;
    }

    function getBuyerApproval() public view returns (bool) {
        return buyerApproval;
    }

    function getTxStatus() public view returns (bool) {
        return txCompleted;
    }

    function getDeliverStatus() public view returns (bool) {
        return delivered;
    }

    function getPaidStatus() public view returns (bool) {
        return paid;
    }

    function isApproved() public view returns (bool) {
        if (approvalCount == 2) {
            return true;
        } else {
            return false;
        }
    }
}
