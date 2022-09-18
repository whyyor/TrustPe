// SPDX-License-Identifier: MIT
import "./Escrow.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

pragma solidity ^0.8.9;

contract Record {
    using Counters for Counters.Counter;
    Counters.Counter private txnIds;

    struct Transaction {
        address escrowAddress;
        uint256 price;
        address buyer;
        address seller;
        address verifier;
    }

    mapping(uint256 => Transaction) idToTxn;

    function storeTxData(address _escrow) public {
        Escrow escrow = Escrow(_escrow);

        address _buyer = escrow.getBuyer();
        address _verifier = escrow.getVerifier();
        address _seller = escrow.getSeller();
        uint256 _price = escrow.getDepositedPrice();

        uint256 newTxId = txnIds.current();

        idToTxn[newTxId] = Transaction(
            _escrow,
            _price,
            _buyer,
            _seller,
            _verifier
        );
        txnIds.increment();
    }

    function getUserUnverifiedContracts()
        public
        view
        returns (Transaction[] memory)
    {
        uint256 totalTxCount = txnIds.current();
        uint256 txnCount = 0;
        uint256 currentTxnIndex = 0;

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].verifier == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (esc.getVerifierApproval() == false) {
                    txnCount += 1;
                }
            }
        }

        Transaction[] memory items = new Transaction[](txnCount);

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].verifier == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (esc.getVerifierApproval() == false) {
                    items[currentTxnIndex] = idToTxn[i];
                    currentTxnIndex += 1;
                }
            }
        }

        return items;
    }

    function getUserBuyerLockins() public view returns (Transaction[] memory) {
        uint256 totalTxCount = txnIds.current();
        uint256 txnCount = 0;
        uint256 currentTxnIndex = 0;

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].buyer == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (esc.getTxStatus() == false) {
                    txnCount += 1;
                }
            }
        }

        Transaction[] memory items = new Transaction[](txnCount);

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].buyer == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (esc.getTxStatus() == false) {
                    items[currentTxnIndex] = idToTxn[i];
                    currentTxnIndex += 1;
                }
            }
        }

        return items;
    }

    function getPendingContracts() public view returns (Transaction[] memory) {
        uint256 totalTxCount = txnIds.current();
        uint256 txnCount = 0;
        uint256 currentTxnIndex = 0;

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].seller == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (
                    esc.getDeliverStatus() == false &&
                    esc.getPaidStatus() == true
                ) {
                    txnCount += 1;
                }
            }
        }

        Transaction[] memory items = new Transaction[](txnCount);

        for (uint i = 0; i < totalTxCount; i++) {
            if (idToTxn[i].seller == msg.sender) {
                address addrr = idToTxn[i].escrowAddress;
                Escrow esc = Escrow(addrr);
                if (
                    esc.getDeliverStatus() == false &&
                    esc.getPaidStatus() == true
                ) {
                    items[currentTxnIndex] = idToTxn[i];
                    currentTxnIndex += 1;
                }
            }
        }

        return items;
    }
}
