const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WineNFT", function () {
  let WineNFT, wineNFT;
  let owner, addr1, addr2;

  beforeEach(async function () {
    WineNFT = await ethers.getContractFactory("WineNFT");
    [owner, addr1, addr2] = await ethers.getSigners();

    wineNFT = await WineNFT.deploy(owner.address);
    await wineNFT.deployed();
  });

  it("Should initialize wines correctly", async function () {
    const wines = await wineNFT.getAllWines();

    expect(wines.length).to.equal(20);

    expect(wines[0].wineId.toNumber()).to.equal(1);
    expect(wines[0].producer).to.equal("0x0000000000000000000000000000000000000001");
    expect(wines[0].price.toString()).to.equal(ethers.utils.parseEther("0.05").toString());
    expect(wines[0].vintage).to.equal(2020);
    expect(wines[0].grapeVariety).to.equal("Cabernet Sauvignon");
    expect(wines[0].numberOfBottles).to.equal(100);
    expect(wines[0].redeemed).to.equal(false);
    expect(wines[0].owner).to.equal(ethers.constants.AddressZero);
  });

  it("Should retrieve a single wine by ID", async function () {
    const wineId = 0;
    const wine = await wineNFT.getWineById(wineId);

    expect(wine.wineId.toNumber()).to.equal(1); // wineId starts from 1
    expect(wine.producer).to.equal("0x0000000000000000000000000000000000000001");
    expect(wine.price.toString()).to.equal(ethers.utils.parseEther("0.05").toString());
    expect(wine.vintage).to.equal(2020);
    expect(wine.grapeVariety).to.equal("Cabernet Sauvignon");
    expect(wine.numberOfBottles).to.equal(100);
    expect(wine.redeemed).to.equal(false);
    expect(wine.owner).to.equal(ethers.constants.AddressZero);
  });
});
