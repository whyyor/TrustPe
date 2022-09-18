require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      gas: 2100000,
      gasPrice: 8000000000,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [
        "b4c123fc82c6b66af4c1ac3381ec01df20a29a7048c318b5a2e6d5bc7d916ba1",
      ],
    },
  },
  solidity: "0.8.9",
};
