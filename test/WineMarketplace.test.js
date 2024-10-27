const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WineMarketplace", function () {
  let WineNFT, wineNFT, WineMarketplace, wineMarketplace;
  let owner, seller, buyer, nonWhitelisted;
  const nftPrice = ethers.utils.parseEther("1");
  const mintFee = ethers.utils.parseEther("0.01");
  let tokenId;

  before(async function () {
    [owner, seller, buyer, nonWhitelisted] = await ethers.getSigners();
    WineNFT = await ethers.getContractFactory("WineNFT");
    wineNFT = await WineNFT.deploy(owner.address);
    await wineNFT.deployed();

    const tx = await wineNFT
      .connect(owner)
      .mintWine(
        seller.address,
        nftPrice,
        2021,
        "Cabernet",
        100,
        Math.floor(Date.now() / 1000) + 10,
        { value: mintFee }
      );

    const receipt = await tx.wait();
    tokenId = receipt.events[0].args.tokenId;

    expect(await wineNFT.ownerOf(tokenId)).to.equal(seller.address);

    WineMarketplace = await ethers.getContractFactory("WineMarketplace");
    wineMarketplace = await WineMarketplace.deploy(
      wineNFT.address,
      owner.address
    );
    await wineMarketplace.deployed();
  });

  describe("Whitelisting", function () {
    it("Should whitelist an address", async function () {
      await wineMarketplace
        .connect(owner)
        .addAddressToWhitelist(seller.address);
      expect(await wineMarketplace.whitelistedAddresses(seller.address)).to.be
        .true;
    });

    it("Should remove an address from whitelist", async function () {
      await wineMarketplace
        .connect(owner)
        .removeAddressFromWhitelist(seller.address);
      expect(await wineMarketplace.whitelistedAddresses(seller.address)).to.be
        .false;
    });
  });

  describe("Listing NFT", function () {
    before(async function () {
      // Whitelist seller again for the listing test
      await wineMarketplace
        .connect(owner)
        .addAddressToWhitelist(seller.address);
    });

    it("List Wine NFT with price 0 should fail", async function () {
      await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
      try {
        await wineMarketplace.connect(seller).listNFT(tokenId, 0);
      } catch (error) {
        expect(error.message).to.include("Price must be greater than 0");
      }
    });

    it("Should list an NFT", async function () {
      await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
      await wineMarketplace.connect(seller).listNFT(tokenId, nftPrice);
      const listing = await wineMarketplace.listings(tokenId);

      expect(listing.seller).to.equal(seller.address);
      expect(listing.price.toString()).to.equal(nftPrice.toString());
    });
  });
});
