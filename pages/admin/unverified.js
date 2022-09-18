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

export default function ShowUnverifiedTx() {
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    loadUnverified();
  }, []);
  async function loadUnverified() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let record = new ethers.Contract(recordAddress, Record.abi, signer);
    const toVerify = await record.getUserUnverifiedContracts();

    let items = [];
    for (let i = 0; i < toVerify.length; i++) {
      const addr = toVerify[i].escrowAddress;
      const escContract = new ethers.Contract(addr, Escrow.abi, signer);
      const paidStatus = await escContract.getPaidStatus();
      const approvalStatus = await escContract.getVerifierApproval();
      if (paidStatus == true && approvalStatus == false) {
        items.push(toVerify[i]);
      }
    }
    setTxns(items);
    setLoadingState("loaded");
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

  if (loadingState === "loaded" && !txns.length)
    return (
      <div className="flex flex-col flex-wrap sm:flex-row">
        <TokensOwned />

        <div className="shadow-lg rounded-xl w-full md:w-11/1 md:ml-4 mt-8 p-4 bg-white dark:bg-gray-800 relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-8">
            <p className="text-gray-800 dark:text-white text-xl">Unverified</p>
          </div>
          <div className="flex items-center mb-6 rounded justify-between">
            <div className="flex items-center w-full justify-between">
              <div className="flex text-sm flex-col w-full ml-2 items-start justify-between">
                <p className="dark:text-white">Nothing to Verify</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col flex-wrap sm:flex-row">
      <TokensOwned />

      <div className="shadow-lg rounded-xl w-full md:w-11/1 md:ml-4 mt-8 p-4 bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="w-full flex items-center justify-between mb-8">
          <p className="text-gray-800 dark:text-white text-xl">Unverified</p>
        </div>
        {txns.map((txn, i) => (
          <div
            key={i}
            className="flex items-center mb-6 rounded justify-between"
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex text-sm flex-col w-full ml-2 items-start justify-between">
                <p className="dark:text-white">{txn.escrowAddress}</p>
              </div>

              <button
                className="bg-transparent hover:bg-purple-900 text-gray-100 font-normal hover:text-white py-2 px-4 border border-white-500 hover:border-transparent rounded"
                onClick={() => verifyTx(txn.escrowAddress)}
              >
                Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
