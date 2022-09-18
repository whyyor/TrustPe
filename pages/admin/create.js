import { ethers, ContractFactory, BigNumber } from "ethers";
import React, { useState } from "react";
import Web3Modal, { Modal } from "web3modal";
import { useRouter } from "next/router";

import { daiAddress } from "../../config";
import { daiPoolAddress } from "../../config";
import { recordAddress } from "../../config";

import Escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import Dai from "../../artifacts/contracts/Dai.sol/Dai.json";
import DaiPool from "../../artifacts/contracts/DaiPool.sol/DaiPool.json";
import Record from "../../artifacts/contracts/Record.sol/Record.json";

export default function CreateTransaction() {
  const [formInput, updateFormInput] = useState({
    verifier: "",
    seller: "",
    buyer: "",
    deliveryTime: "",
    price: "",
  });

  async function deployEscrow() {
    const { verifier, seller, buyer, deliveryTime, price } = formInput;

    const amount = ethers.utils.parseEther(price.toString());
    // const time = ethers.utils.parseUnits(deliveryTime, 0);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const escrowFactory = new ContractFactory(
      Escrow.abi,
      Escrow.bytecode,
      signer
    );
    const escrow = await escrowFactory.deploy(
      verifier,
      seller,
      buyer,
      deliveryTime,
      amount,
      daiAddress,
      daiPoolAddress
    );

    let record = new ethers.Contract(recordAddress, Record.abi, signer);
    await record.storeTxData(escrow.address);
  }

  return (
    <div className="w-full md:w-4/1 pr-2 mb-6">
      <div className="shadow rounded-2xl p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <p className="text-md text-black dark:text-white ml-2">
            {"Create new Transaction"}
          </p>
        </div>
        <div className="flex flex-col justify-start">
          <div className="text-gray-700 dark:text-gray-100 flex  text-left font-bold my-4">
            <input
              className="appearance-none bg-transparent border-b border-gray-100 w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Buyer Address"
              onChange={(e) =>
                updateFormInput({ ...formInput, buyer: e.target.value })
              }
            />
            <input
              className="appearance-none bg-transparent border-b border-gray-100 w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Seller Address"
              onChange={(e) =>
                updateFormInput({ ...formInput, seller: e.target.value })
              }
            />
          </div>

          <div className="text-gray-700 dark:text-gray-100 flex  text-left font-bold my-4">
            <input
              className="appearance-none bg-transparent border-b border-gray-100 w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Verifier Address"
              onChange={(e) =>
                updateFormInput({ ...formInput, verifier: e.target.value })
              }
            />
            <input
              className="appearance-none bg-transparent border-b border-gray-100 w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Delivery Time (in days)"
              onChange={(e) =>
                updateFormInput({ ...formInput, deliveryTime: e.target.value })
              }
            />
          </div>

          <div className="text-gray-700 dark:text-gray-100 flex  text-left font-bold my-4">
            <input
              className="appearance-none bg-transparent border-b border-gray-100 w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Price"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            <button
              onClick={deployEscrow}
              className="bg-transparent hover:bg-purple-900 text-gray-100 w-full font-normal hover:text-white py-2 px-4 border border-white-500 hover:border-transparent rounded"
            >
              Add
            </button>
          </div>
          <div className="flex items-center text-green-500 text-sm"></div>
        </div>
      </div>
    </div>
  );
}
