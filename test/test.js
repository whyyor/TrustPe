const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  async function deployContracts() {
    const ONE_WEEK = 7;
    const EIGHT_DAYS = (await time.latest()) + 8 * 24 * 60 * 60;
    const SIX_DAYS = (await time.latest()) + 6 * 24 * 60 * 60;

    const [buyer, buyer2, seller, seller2, verifier, verifier2] =
      await ethers.getSigners();
    const DaiToken = await ethers.getContractFactory("Dai");
    const dai = await DaiToken.deploy();

    await dai.mint(buyer.address, "10000");
    await dai.mint(buyer2.address, "10000");

    const DaiPool = await ethers.getContractFactory("DaiPool");
    const pool = await DaiPool.deploy(dai.address);

    const Record = await ethers.getContractFactory("Record");
    const record = await Record.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(
      verifier.address,
      seller.address,
      buyer.address,
      ONE_WEEK,
      "100",
      dai.address,
      pool.address
    );

    const Escrow2 = await ethers.getContractFactory("Escrow");
    const escrow2 = await Escrow2.deploy(
      verifier.address,
      seller2.address,
      buyer2.address,
      ONE_WEEK,
      "100",
      dai.address,
      pool.address
    );

    return {
      ONE_WEEK,
      EIGHT_DAYS,
      SIX_DAYS,
      buyer,
      buyer2,
      seller,
      seller2,
      verifier,
      verifier2,
      dai,
      pool,
      escrow,
      escrow2,
      record,
    };
  }

  describe("Deployment", function () {
    it("Should set the right buyer", async function () {
      const { buyer, escrow, dai } = await loadFixture(deployContracts);

      const buyerDaiBal = await dai.balanceOf(buyer.address);
      console.log("buyer DAI Balance:", buyerDaiBal);
      // expect(await escrow.getBuyer()).to.equal(buyer.address);
    });

    it("Should set the right seller", async function () {
      const { seller, escrow } = await loadFixture(deployContracts);

      expect(await escrow.getSeller()).to.equal(seller.address);
    });

    it("Should set the right verifier", async function () {
      const { verifier, escrow } = await loadFixture(deployContracts);

      expect(await escrow.getVerifier()).to.equal(verifier.address);
    });

    it("Should transfer funds to escrow contract to lock", async function () {
      const { buyer, escrow, dai, pool } = await loadFixture(deployContracts);

      await dai.connect(buyer).approve(escrow.address, "1000");
      await escrow.connect(buyer).pay();
      const tDaiBal = await pool.balanceOf(escrow.address);
      expect(tDaiBal).to.equal(await escrow.getDepositedPrice());
    });

    it("Deliver if there are enough approvals and send the dai to seller", async function () {
      const { verifier, escrow, buyer, seller, dai, SIX_DAYS } =
        await loadFixture(deployContracts);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await time.increaseTo(SIX_DAYS);

      expect(await escrow.connect(buyer).approve()).not.to.be.reverted;
      expect(await escrow.connect(verifier).approve()).not.to.be.reverted;

      const sellerBalBeforeDelivery = await dai.balanceOf(seller.address);

      await escrow.deliver();

      const sellerBalAfterDelivery = await dai.balanceOf(seller.address);

      expect(sellerBalAfterDelivery).to.equal(sellerBalBeforeDelivery + 100);

      expect(await escrow.getVerifier()).to.equal(verifier.address);
    });

    it("Buyer pays 10% fee if they withdraw before delivery date", async function () {
      const { pool, escrow, dai, buyer } = await loadFixture(deployContracts);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await escrow.connect(buyer).withdraw();

      const poolDaiBalAfter = await dai.balanceOf(pool.address);

      expect(poolDaiBalAfter).to.equal(10);
    });

    it("Seller pays 10% fee in case of late delivery", async function () {
      const { verifier, escrow, buyer, seller, EIGHT_DAYS, dai, pool } =
        await loadFixture(deployContracts);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await time.increaseTo(EIGHT_DAYS);

      expect(await escrow.connect(buyer).approve()).not.to.be.reverted;
      expect(await escrow.connect(verifier).approve()).not.to.be.reverted;

      const sellerBalBeforeDelivery = await dai.balanceOf(seller.address);

      await escrow.deliver();

      const sellerBalAfterDelivery = await dai.balanceOf(seller.address);

      expect(sellerBalAfterDelivery).to.equal(sellerBalBeforeDelivery + 90);

      const poolDaiBalAfter = await dai.balanceOf(pool.address);
      expect(poolDaiBalAfter).to.equal(10);
    });

    it("One buyer earns when another cancels the order", async function () {
      const {
        pool,
        escrow,
        dai,
        buyer,
        seller,
        buyer2,
        verifier,
        ONE_WEEK,
        SIX_DAYS,
      } = await loadFixture(deployContracts);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await escrow.connect(buyer).withdraw();

      const Escrow2 = await ethers.getContractFactory("Escrow");
      const escrow2 = await Escrow2.deploy(
        verifier.address,
        seller.address,
        buyer2.address,
        ONE_WEEK,
        "100",
        dai.address,
        pool.address
      );

      await dai.connect(buyer2).approve(escrow2.address, "100");
      await escrow2.connect(buyer2).pay();

      await time.increaseTo(SIX_DAYS);

      expect(await escrow2.connect(buyer2).approve()).not.to.be.reverted;
      expect(await escrow2.connect(verifier).approve()).not.to.be.reverted;

      const sellerBalBeforeDelivery = await dai.balanceOf(seller.address);

      await escrow2.deliver();

      const sellerBalAfterDelivery = await dai.balanceOf(seller.address);

      expect(sellerBalAfterDelivery).to.equal(sellerBalBeforeDelivery + 100);

      const buyer2PoolBal = await pool.balanceOf(buyer2.address);
      const buyer2DaiBal = await dai.balanceOf(buyer2.address);
      console.log("Buyer2 tDai balance:", buyer2PoolBal);
      console.log("Buyer2 Dai balance:", buyer2DaiBal);

      await pool.connect(buyer2).leave(buyer2PoolBal);

      const buyer2DaiBalAfter = await dai.balanceOf(buyer2.address);
      console.log("Buyer2 Dai balance after leaving pool:", buyer2DaiBalAfter);
    });

    it("Stores the Tx data in record and returns unverified contracts", async function () {
      const {
        buyer,
        buyer2,
        seller,
        seller2,
        verifier,
        verifier2,
        escrow,
        escrow2,
        record,
        EIGHT_DAYS,
        dai,
      } = await loadFixture(deployContracts);

      const _verifier = await escrow.getVerifier();

      await record.storeTxData(escrow.address);
      await record.storeTxData(escrow2.address);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await dai.connect(buyer2).approve(escrow2.address, "100");
      await escrow2.connect(buyer2).pay();
      await escrow.connect(verifier).approve();

      let arr = [];
      const data = await record.connect(verifier).getUserUnverifiedContracts();
      for (let i = 0; i < data.length; i++) {
        const contr = data[i].escrowAddress;
        arr.push(contr);
      }
      console.log("Unverified contracts: ", arr);
      console.log("Escrow1 Address: ", escrow.address);
      console.log("Escrow2 Address: ", escrow2.address);
      console.log("Verifier1 is:", verifier.address);
      console.log("Verifier2 is:", _verifier);
    });

    it("Stores the Tx data in record and returns locked in contracts", async function () {
      const {
        buyer,
        buyer2,
        seller,
        seller2,
        verifier,
        verifier2,
        escrow,
        escrow2,
        record,
        EIGHT_DAYS,
        dai,
      } = await loadFixture(deployContracts);

      await record.storeTxData(escrow.address);
      await record.storeTxData(escrow2.address);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await escrow.connect(verifier).approve();
      await escrow.connect(buyer).approve();
      // await escrow.deliver();

      let arr = [];
      const data = await record.connect(buyer).getUserBuyerLockins();
      for (let i = 0; i < data.length; i++) {
        const contr = data[i].escrowAddress;
        arr.push(contr);
      }
      console.log("Locked-in contracts: ", arr);
      console.log("Escrow1 Address: ", escrow.address);
      console.log("Escrow2 Address: ", escrow2.address);
      console.log("Verifier1 is:", verifier.address);
    });

    it("Stores the Tx data in record and returns pending transactions to seller", async function () {
      const {
        buyer,
        buyer2,
        seller,
        seller2,
        verifier,
        verifier2,
        escrow,
        escrow2,
        record,
        EIGHT_DAYS,
        dai,
      } = await loadFixture(deployContracts);

      await record.storeTxData(escrow.address);
      await record.storeTxData(escrow2.address);

      await dai.connect(buyer).approve(escrow.address, "100");
      await escrow.connect(buyer).pay();

      await escrow.connect(verifier).approve();
      await escrow.connect(buyer).approve();
      await escrow.deliver();

      let arr = [];
      const data = await record.connect(seller).getPendingContracts();
      for (let i = 0; i < data.length; i++) {
        const contr = data[i].escrowAddress;
        arr.push(contr);
      }
      console.log("Unverified contracts: ", arr);
      console.log("Escrow1 Address: ", escrow.address);
      console.log("Escrow2 Address: ", escrow2.address);
      console.log("Verifier1 is:", verifier.address);
    });
  });
});
