const hre = require("hardhat");
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const buyer1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const seller1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const verifier1 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const buyer2 = "0x71bE63f3384f5fb98995898A86B02Fb2426c5788";
  const seller2 = "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a";
  const verifier2 = "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec";

  const DaiFactory = await hre.ethers.getContractFactory("Dai");
  const dai = await DaiFactory.deploy();
  await dai.deployed();

  const someDai = await hre.ethers.getContractAt("Dai", dai.address);

  const amount = ethers.utils.parseEther("50000");
  await someDai.mint(buyer1, amount);
  await someDai.mint(buyer2, amount);
  await someDai.mint(seller1, amount);
  await someDai.mint(seller2, amount);
  await someDai.mint(verifier1, amount);
  await someDai.mint(verifier2, amount);

  console.log("DAI deployed to:", dai.address);

  const DaiPoolFactory = await hre.ethers.getContractFactory("DaiPool");
  const daiPool = await DaiPoolFactory.deploy(dai.address);
  await daiPool.deployed();

  console.log("DAI-Pool deployed to:", daiPool.address);

  const RecordFactory = await hre.ethers.getContractFactory("Record");
  const record = await RecordFactory.deploy();
  await record.deployed();
  console.log("Record deployed to:", record.address);

  fs.writeFileSync(
    "./config.js",
    `
    export const daiAddress = "${dai.address}"
    export const daiPoolAddress = "${daiPool.address}"
    export const recordAddress = "${record.address}"
  `
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
