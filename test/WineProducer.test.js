const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3 = require("web3");
const web3 = new Web3();
describe("WineProducer", function () {
  let WineNFT;
  let WineProducer;
  let wineNFT;
  let wineProducer;
  let owner;
  let producer;
  let addr1;

  beforeEach(async function () {
    // Get signers
    [owner, producer, addr1] = await ethers.getSigners();

    // Deploy WineNFT
    WineNFT = await ethers.getContractFactory("WineNFT");
    wineNFT = await WineNFT.deploy(owner.address);
    await wineNFT.deployed();

    // Deploy WineProducer
    WineProducer = await ethers.getContractFactory("WineProducer");
    wineProducer = await WineProducer.deploy(await wineNFT.address);
    await wineProducer.deployed();
});

  describe("Deployment", function () {
    it("Should set the correct WineNFT address", async function () {
      expect(await wineProducer.wineNFT()).to.equal(await wineNFT.address);
    });
  });

  describe("createWineNFT", function () {
    const price = web3.utils.toWei("0.1", "ether");
    const vintage = 2020;
    const grapeVariety = "Cabernet Sauvignon";
    const numberOfBottles = 100;
    const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now

    it("Should create a new wine NFT", async function () {
      const tx = await wineProducer.connect(producer)
      .createWineNFT(
        price,
        vintage,
        grapeVariety,
        numberOfBottles,
        maturityDate,
        { value: web3.utils.toWei("0.01", "ether") } // Minimum required payment
    );

      const wines = await wineNFT.getAllWines();
      const lastWine = wines[wines.length - 1];
      console.log(lastWine.price.toString());

      expect(lastWine.producer).to.equal(producer.address);
      expect(lastWine.price.toString()).to.equal(price);
      expect(lastWine.vintage).to.equal(vintage);
      expect(lastWine.grapeVariety).to.equal(grapeVariety);
      expect(lastWine.numberOfBottles).to.equal(numberOfBottles);
      expect(lastWine.maturityDate.toString()).to.equal(maturityDate.toString());
      expect(lastWine.redeemed).to.equal(false);
    });

    it("Should fail if minimum payment is not met", async function () {
        try {
            await wineProducer.connect(producer).createWineNFT(
                price,
                vintage,
                grapeVariety,
                numberOfBottles,
                maturityDate,
                { value: web3.utils.toWei("0.009", "ether") } // Less than minimum required
            );
        } catch (error) {
            expect(error.message).to.include("At least 0.01 ETH is required to mint a new Wine NFT");
        }
    });
  });
});
