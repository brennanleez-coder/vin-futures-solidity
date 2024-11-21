const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WineDistributor - Full Workflow", function () {
    let WineNFT, wineNFT, WineMarketplace, wineMarketplace, WineDistributor, wineDistributor;
    let owner, seller, buyer, otherUser;
    let tokenId;

    before(async () => {
        [owner, seller, buyer, otherUser] = await ethers.getSigners();

        // Deploy WineNFT contract
        WineNFT = await ethers.getContractFactory("WineNFT");
        wineNFT = await WineNFT.deploy(owner.address);
        await wineNFT.deployed();

        // Deploy WineMarketplace contract
        WineMarketplace = await ethers.getContractFactory("WineMarketplace");
        wineMarketplace = await WineMarketplace.deploy(wineNFT.address, owner.address);
        await wineMarketplace.deployed();

        // Deploy WineDistributor contract
        WineDistributor = await ethers.getContractFactory("WineDistributor");
        wineDistributor = await wineDistributor.deploy(wineMarketplace.address);
        await wineDistributor.deployed();

        // Set the marketplace contract in WineNFT
        await wineNFT.setWineMarketContract(wineMarketplace.address);
    });

    beforeEach(async () => {
        // Mint an NFT to the seller before each test
        const mintTx = await wineNFT.connect(seller).mintWine(
            "Cabernet Sauvignon", // Wine name
            "Description of wine", // Wine description
            seller.address, // Producer
            ethers.utils.parseEther("0.1"), // Price
            2022, // Vintage year
            "Cabernet", // Grape variety
            100, // Number of bottles
            Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // Maturity date (1 year from now)
            { value: ethers.utils.parseEther("0.01") } // Minting fee
        );
        const receipt = await mintTx.wait();
        tokenId = receipt.events[0].args.tokenId;
    });

    describe("Buying NFTs through WineDistributor", function () {
        it("Should not allow purchase if NFT is not listed", async () => {
            const unlistedTokenId = tokenId + 1; // Unlisted token
            await expect(
                wineDistributor.connect(buyer).buyWine(unlistedTokenId, { value: ethers.utils.parseEther("0.1") })
            ).to.be.revertedWith("NFT not listed for sale");
        });

        it("Should not allow purchase with insufficient payment", async () => {
            await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
            await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));

            await expect(
                wineDistributor.connect(buyer).buyWine(tokenId, { value: ethers.utils.parseEther("0.05") })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should allow a buyer to purchase an NFT", async () => {
            await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
            await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));

            await wineDistributor.connect(buyer).buyWine(tokenId, { value: ethers.utils.parseEther("0.1") });
            expect(await wineNFT.ownerOf(tokenId)).to.equal(buyer.address);
        });

        it("Should not allow a seller to buy their own NFT", async () => {
            await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
            await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));

            await expect(
                wineDistributor.connect(seller).buyWine(tokenId, { value: ethers.utils.parseEther("0.1") })
            ).to.be.revertedWith("Cannot buy your own NFT");
        });
    });

    describe("Redeeming NFTs through WineDistributor", function () {
        beforeEach(async () => {
            await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
            await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
            await wineDistributor.connect(buyer).buyWine(tokenId, { value: ethers.utils.parseEther("0.1") });
        });

        it("Should not allow redemption before maturity date", async () => {
            await expect(wineDistributor.connect(buyer).redeemWineNFT(tokenId)).to.be.revertedWith(
                "Wine is not mature yet"
            );
        });

        it("Should allow redemption after maturity date", async () => {
            await wineNFT.setMaturityDate(tokenId, Math.floor(Date.now() / 1000) - 24 * 60 * 60);

            await wineDistributor.connect(buyer).redeemWineNFT(tokenId);

            await expect(wineNFT.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
        });
    });

    describe("Reselling NFTs through WineDistributor", function () {
        beforeEach(async () => {
            await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
            await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
            await wineDistributor.connect(buyer).buyWine(tokenId, { value: ethers.utils.parseEther("0.1") });
        });

        it("Should allow reselling an NFT", async () => {
            await wineNFT.connect(buyer).approve(wineMarketplace.address, tokenId);
            await wineDistributor.connect(buyer).listWineForResale(tokenId, ethers.utils.parseEther("0.15"));

            const listing = await wineMarketplace.listings(tokenId);
            expect(listing.seller).to.equal(buyer.address);
            expect(listing.price).to.equal(ethers.utils.parseEther("0.15"));
        });
    });
});
