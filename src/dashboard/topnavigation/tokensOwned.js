import { ethers, ContractFactory, BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import Web3Modal, { Modal } from "web3modal";
import { useRouter } from "next/router";

import { daiAddress } from "../../../config";
import { daiPoolAddress } from "../../../config";

import Dai from "../../../artifacts/contracts/Dai.sol/Dai.json";
import DaiPool from "../../../artifacts/contracts/DaiPool.sol/DaiPool.json";

const TokensOwned = () => {
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [dai, setDai] = useState([]);
  const [tdai, setTDai] = useState([]);
  useEffect(() => {
    loadOwned();
  }, []);

  async function loadOwned() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const _dai = new ethers.Contract(daiAddress, Dai.abi, signer);
    const _tdai = new ethers.Contract(daiPoolAddress, DaiPool.abi, signer);
    const msgSender = await signer.getAddress();
    console.log("Signer Addr: ", msgSender);

    const daiBalance = await _dai.balanceOf(msgSender);
    const tDaiBalance = await _tdai.balanceOf(msgSender);
    console.log("DAI Balance: ", daiBalance.toString());
    setDai(daiBalance.toString());
    setTDai(tDaiBalance.toString());
    setLoadingState("loaded");
  }

  function showToken(number) {
    if (number == "0") {
      return 0;
    }
    const leng = number.length;
    const something = leng - 18;
    const totalDisplay = leng - 14;
    const whole = number.slice(0, something);
    const points = number.slice(something - 1, totalDisplay);
    const show = whole + "." + points;
    return show;
  }

  if (loadingState === "loaded") {
    return (
      <div className="w-full flex">
        <div className="w-full md:w-6/12 pr-2 mb-6">
          <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <span className="rounded-xl relative p-4 bg-purple-200">
                <svg
                  width="40"
                  fill="currentColor"
                  height="40"
                  className="text-purple-500 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  viewBox="0 0 1792 1792"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1362 1185q0 153-99.5 263.5t-258.5 136.5v175q0 14-9 23t-23 9h-135q-13 0-22.5-9.5t-9.5-22.5v-175q-66-9-127.5-31t-101.5-44.5-74-48-46.5-37.5-17.5-18q-17-21-2-41l103-135q7-10 23-12 15-2 24 9l2 2q113 99 243 125 37 8 74 8 81 0 142.5-43t61.5-122q0-28-15-53t-33.5-42-58.5-37.5-66-32-80-32.5q-39-16-61.5-25t-61.5-26.5-62.5-31-56.5-35.5-53.5-42.5-43.5-49-35.5-58-21-66.5-8.5-78q0-138 98-242t255-134v-180q0-13 9.5-22.5t22.5-9.5h135q14 0 23 9t9 23v176q57 6 110.5 23t87 33.5 63.5 37.5 39 29 15 14q17 18 5 38l-81 146q-8 15-23 16-14 3-27-7-3-3-14.5-12t-39-26.5-58.5-32-74.5-26-85.5-11.5q-95 0-155 43t-60 111q0 26 8.5 48t29.5 41.5 39.5 33 56 31 60.5 27 70 27.5q53 20 81 31.5t76 35 75.5 42.5 62 50 53 63.5 31.5 76.5 13 94z" />
                </svg>
              </span>
              <p className="text-md text-black dark:text-white ml-2">
                {"DAI Tokens"}
              </p>
            </div>
            <div className="flex flex-col justify-start">
              <p className="text-gray-700 dark:text-gray-100 text-4xl text-left font-bold my-4">
                {showToken(dai.toString())}
                <span className="text-sm"> DAI</span>
              </p>
              <div className="flex items-center text-green-500 text-sm">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 1792 1792"
                  xmlns="http://www.w3.org/2000/svg"
                ></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-6/12 pr-2 mb-6">
          <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <span className="rounded-xl relative p-4 bg-purple-200">
                <svg
                  width="40"
                  fill="currentColor"
                  height="40"
                  className="text-purple-500 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  viewBox="0 0 1792 1792"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1362 1185q0 153-99.5 263.5t-258.5 136.5v175q0 14-9 23t-23 9h-135q-13 0-22.5-9.5t-9.5-22.5v-175q-66-9-127.5-31t-101.5-44.5-74-48-46.5-37.5-17.5-18q-17-21-2-41l103-135q7-10 23-12 15-2 24 9l2 2q113 99 243 125 37 8 74 8 81 0 142.5-43t61.5-122q0-28-15-53t-33.5-42-58.5-37.5-66-32-80-32.5q-39-16-61.5-25t-61.5-26.5-62.5-31-56.5-35.5-53.5-42.5-43.5-49-35.5-58-21-66.5-8.5-78q0-138 98-242t255-134v-180q0-13 9.5-22.5t22.5-9.5h135q14 0 23 9t9 23v176q57 6 110.5 23t87 33.5 63.5 37.5 39 29 15 14q17 18 5 38l-81 146q-8 15-23 16-14 3-27-7-3-3-14.5-12t-39-26.5-58.5-32-74.5-26-85.5-11.5q-95 0-155 43t-60 111q0 26 8.5 48t29.5 41.5 39.5 33 56 31 60.5 27 70 27.5q53 20 81 31.5t76 35 75.5 42.5 62 50 53 63.5 31.5 76.5 13 94z" />
                </svg>
              </span>
              <p className="text-md text-black dark:text-white ml-2">
                tDAI Tokens
              </p>
            </div>
            <div className="flex flex-col justify-start">
              <p className="text-gray-700 dark:text-gray-100 text-4xl text-left font-bold my-4">
                {showToken(tdai.toString())}
                <span className="text-sm"> tDAI</span>
              </p>
              <div className="flex items-center text-green-500 text-sm">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 1792 1792"
                  xmlns="http://www.w3.org/2000/svg"
                ></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex">
      <div className="w-full md:w-6/12 pr-2 mb-6">
        <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <span className="rounded-xl relative p-4 bg-purple-200">
              <svg
                width="40"
                fill="currentColor"
                height="40"
                className="text-purple-500 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                viewBox="0 0 1792 1792"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1362 1185q0 153-99.5 263.5t-258.5 136.5v175q0 14-9 23t-23 9h-135q-13 0-22.5-9.5t-9.5-22.5v-175q-66-9-127.5-31t-101.5-44.5-74-48-46.5-37.5-17.5-18q-17-21-2-41l103-135q7-10 23-12 15-2 24 9l2 2q113 99 243 125 37 8 74 8 81 0 142.5-43t61.5-122q0-28-15-53t-33.5-42-58.5-37.5-66-32-80-32.5q-39-16-61.5-25t-61.5-26.5-62.5-31-56.5-35.5-53.5-42.5-43.5-49-35.5-58-21-66.5-8.5-78q0-138 98-242t255-134v-180q0-13 9.5-22.5t22.5-9.5h135q14 0 23 9t9 23v176q57 6 110.5 23t87 33.5 63.5 37.5 39 29 15 14q17 18 5 38l-81 146q-8 15-23 16-14 3-27-7-3-3-14.5-12t-39-26.5-58.5-32-74.5-26-85.5-11.5q-95 0-155 43t-60 111q0 26 8.5 48t29.5 41.5 39.5 33 56 31 60.5 27 70 27.5q53 20 81 31.5t76 35 75.5 42.5 62 50 53 63.5 31.5 76.5 13 94z" />
              </svg>
            </span>
            <p className="text-md text-black dark:text-white ml-2">
              {"DAI Tokens"}
            </p>
          </div>
          <div className="flex flex-col justify-start">
            <p className="text-gray-700 dark:text-gray-100 text-4xl text-left font-bold my-4">
              {showToken(dai.toString())}
              <span className="text-sm"> Dai</span>
            </p>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 1792 1792"
                xmlns="http://www.w3.org/2000/svg"
              ></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-6/12 pr-2 mb-6">
        <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <span className="rounded-xl relative p-4 bg-purple-200">
              <svg
                width="40"
                fill="currentColor"
                height="40"
                className="text-purple-500 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                viewBox="0 0 1792 1792"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1362 1185q0 153-99.5 263.5t-258.5 136.5v175q0 14-9 23t-23 9h-135q-13 0-22.5-9.5t-9.5-22.5v-175q-66-9-127.5-31t-101.5-44.5-74-48-46.5-37.5-17.5-18q-17-21-2-41l103-135q7-10 23-12 15-2 24 9l2 2q113 99 243 125 37 8 74 8 81 0 142.5-43t61.5-122q0-28-15-53t-33.5-42-58.5-37.5-66-32-80-32.5q-39-16-61.5-25t-61.5-26.5-62.5-31-56.5-35.5-53.5-42.5-43.5-49-35.5-58-21-66.5-8.5-78q0-138 98-242t255-134v-180q0-13 9.5-22.5t22.5-9.5h135q14 0 23 9t9 23v176q57 6 110.5 23t87 33.5 63.5 37.5 39 29 15 14q17 18 5 38l-81 146q-8 15-23 16-14 3-27-7-3-3-14.5-12t-39-26.5-58.5-32-74.5-26-85.5-11.5q-95 0-155 43t-60 111q0 26 8.5 48t29.5 41.5 39.5 33 56 31 60.5 27 70 27.5q53 20 81 31.5t76 35 75.5 42.5 62 50 53 63.5 31.5 76.5 13 94z" />
              </svg>
            </span>
            <p className="text-md text-black dark:text-white ml-2">
              tDAI Tokens
            </p>
          </div>
          <div className="flex flex-col justify-start">
            <p className="text-gray-700 dark:text-gray-100 text-4xl text-left font-bold my-4">
              1<span className="text-sm">Tokens</span>
            </p>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 1792 1792"
                xmlns="http://www.w3.org/2000/svg"
              ></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensOwned;
