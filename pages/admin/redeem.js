import TokensOwned from "../../src/dashboard/topnavigation/tokensOwned";
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

export default function ShowPendingTx() {
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [dai, setDai] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const msgSender = await signer.getAddress();
    let daiPool = new ethers.Contract(daiPoolAddress, DaiPool.abi, signer);
    const daiBal = await daiPool.balanceOf(msgSender);

    setDai(daiBal);
    setLoadingState("loaded");
  }

  async function redeem() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let daiPool = new ethers.Contract(daiPoolAddress, DaiPool.abi, signer);
    await daiPool.withdrawAll();
  }

  function renderButton() {
    if (dai.toString() == "0") {
      return <div>No tDAI owned</div>;
    } else {
      return (
        <button
          className="flex bg-transparent hover:bg-purple-900 text-purple-600 hover:text-white font-bold  py-3 px-11 border-4 border-purple-500 hover:border-transparent align-center justify-center rounded"
          onClick={() => redeem()}
        >
          Redeem tdai
        </button>
      );
    }
  }

  if (loadingState === "loaded") {
    return (
      <div className="flex flex-col flex-wrap sm:flex-row">
        <TokensOwned />
        <div className="flex w-full justify-center">{renderButton()}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap sm:flex-row">
      <TokensOwned />
      <div className="flex w-full justify-center">Connect Wallet</div>
    </div>
  );
}

// export default Content;
