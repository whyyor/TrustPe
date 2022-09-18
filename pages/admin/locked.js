import LockedIcon from "../../src/dashboard/sidenavigation/icons/locked";
import { ethers, ContractFactory, BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import Web3Modal, { Modal } from "web3modal";
import { useRouter } from "next/router";

import { daiAddress } from "../../config";
import { daiPoolAddress } from "../../config";
import { recordAddress } from "../../config";

import Escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import Dai from "../../artifacts/contracts/Dai.sol/Dai.json";
import DaiPool from "../../artifacts/contracts/DaiPool.sol/DaiPool.json";
import Record from "../../artifacts/contracts/Record.sol/Record.json";
import TokensOwned from "../../src/dashboard/topnavigation/tokensOwned";

export default function ShowLocked() {
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    loadLocked();
  }, []);

  async function loadLocked() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let record = new ethers.Contract(recordAddress, Record.abi, signer);
    const lockedTx = await record.getUserBuyerLockins();

    let items = [];
    for (let i = 0; i < lockedTx.length; i++) {
      const addr = lockedTx[i].escrowAddress;
      const escContract = new ethers.Contract(addr, Escrow.abi, signer);
      const deliveryStatus = await escContract.getDeliverStatus();
      const verifyStatus = await escContract.getBuyerApproval();
      if (deliveryStatus == false) {
        let item = {
          escrowAddress: lockedTx[i].escrowAddress,
          price: lockedTx[i].price,
          verifyStatus: verifyStatus,
        };
        items.push(item);
      }
    }
    setTxns(items);
    setLoadingState("loaded");
  }

  function renderWithdrawButton(txn) {
    if (txn.verifyStatus == false) {
      return (
        <button
          className="bg-transparent hover:bg-purple-900 text-gray-100 font-normal hover:text-white py-2 px-4 border border-white-500 hover:border-transparent rounded"
          onClick={() => withdraw(txn)}
        >
          Withdraw
        </button>
      );
    } else {
      <div>Verified</div>;
    }
  }

  function renderVerifyButton(txn) {
    if (txn.verifyStatus == false) {
      return (
        <button
          className="bg-transparent hover:bg-purple-900 text-gray-100 font-normal hover:text-white py-2 px-4 border border-white-500 hover:border-transparent rounded"
          onClick={() => verifyTx(txn.escrowAddress)}
        >
          Verify
        </button>
      );
    } else {
      return <div></div>;
    }
  }

  function renderLockIcon(isVerified) {
    if (isVerified == true) {
      return <LockedIcon colour="#fff" />;
    } else {
      return <div></div>;
    }
  }

  async function verifyTx(escrowAddress) {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const escContract = new ethers.Contract(escrowAddress, Escrow.abi, signer);

    await escContract.approve();
  }

  async function withdraw(txn) {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const escContract = new ethers.Contract(
      txn.escrowAddress,
      Escrow.abi,
      signer
    );
    const daicont = new ethers.Contract(daiAddress, Dai.abi, signer);

    await daicont.approve(txn.escrowAddress, txn.price.toString());

    await escContract.withdraw();
  }

  function showToken(number) {
    const leng = number.length;
    const something = leng - 18;
    const totalDisplay = leng - 14;
    const whole = number.slice(0, something);
    const points = number.slice(something - 1, totalDisplay);
    const show = whole + "." + points;
    return show;
  }

  if (loadingState === "loaded" && !txns.length) {
    return (
      <div className="flex flex-col flex-wrap sm:flex-row">
        <TokensOwned />

        <div className="shadow-lg rounded-xl w-full md:w-11/1 md:ml-4 mt-8 p-4 bg-white dark:bg-gray-800 relative overflow-hidden">
          <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center w-full justify-between">
              <div className="flex  w-full justify-between">
                <div className="flex text-sm flex-col  ml-2 items-start justify-between">
                  <p className="dark:text-white">No Locked Funds</p>
                </div>

                <LockedIcon colour="#fff" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap sm:flex-row">
      <TokensOwned />

      <div className="shadow-lg rounded-xl w-full md:w-11/1 md:ml-4 mt-8 p-4 bg-white dark:bg-gray-800 relative overflow-hidden">
        {txns.map((txn, i) => (
          // async function getVerifiedStatus() {}
          <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center w-full justify-between">
              <div className="flex  w-full justify-between">
                <div className="flex text-sm flex-col  ml-2 items-start justify-between">
                  <p className="dark:text-white"> {txn.escrowAddress} </p>
                  <span className="text-gray-300">
                    {showToken(txn.price.toString())} Tkns
                  </span>
                </div>
                {renderWithdrawButton(txn)}

                {renderVerifyButton(txn)}

                {renderLockIcon(txn.verifyStatus)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
