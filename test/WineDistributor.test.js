const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WineDistributor - Buy NFT Process", function () {
    let WineNFT, wineNFT, WineMarketplace, wineMarketplace;
    let owner, seller, buyer;
    
    before(async () => {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy WineNFT contract
        WineNFT = await ethers.getContractFactory("WineNFT");
        wineNFT = await WineNFT.deploy(owner.address);
        await wineNFT.deployed();

        const tx = await wineNFT.connect(owner).mintWine(
          seller.address,
          ethers.utils.parseEther("0.1"),
          2022,
          "Cabernet Sauvignon",
          100,
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          { value: ethers.utils.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      tokenId = receipt.events[0].args.tokenId;

      expect(await wineNFT.ownerOf(tokenId)).to.equal(seller.address);

      // Deploy WineMarketplace contract
      WineMarketplace = await ethers.getContractFactory("WineMarketplace");
      wineMarketplace = await WineMarketplace.deploy(wineNFT.address, owner.address);
      await wineMarketplace.deployed();

      // Deploy WineDistributor contract
      WineDistributor = await ethers.getContractFactory("WineDistributor");
      wineDistributor = await WineDistributor.deploy(wineMarketplace.address);
      await wineDistributor.deployed();
    });

    describe("Buy NFTs", function () {
      beforeEach(async function () {
        // Whitelist seller again for the listing test
        await wineMarketplace.connect(owner).addAddressToWhitelist(seller.address);
        await wineMarketplace.connect(owner).addAddressToWhitelist(buyer.address);
      });
        it("Unable to purchase as NFT was not listed", async function () {
            try {
                await wineDistributor.connect(buyer).buyWine(tokenId, { value: ethers.utils.parseEther("0.1") });
                expect.fail("Expected transaction to be reverted");
            } catch (error) {
                expect(error.message).to.include("reverted");
            }
        });

        it("Cannot buy your own NFT", async function () {         
          await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);

          // Seller lists NFT
          await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
          
          // Buyer tries to buy NFT
          try {
            await wineMarketplace.connect(seller).buyNFT(tokenId, { value: ethers.utils.parseEther("0.1") });
            expect.fail("Expected transaction to be reverted");
          } catch (error) {
            expect(error.message).to.include("Cannot buy your own NFT");
          }
        });

        it("Insufficient ether balance in your wallet, unable to purchase NFT", async function () {
          await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
          await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
          try {
              await wineMarketplace.connect(buyer).buyNFT(tokenId, { value: ethers.utils.parseEther("0.05") });
              expect.fail("Expected transaction to be reverted");
          } catch (error) {
              expect(error.message).to.include("Insufficient payment");
          }
        });
  
        it("NFT Successfully bought", async function () {
          await wineNFT.setWineMarketContract(wineMarketplace.address);
          await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);  
          await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
    
          // Capture initial balance and make purchase
          //const initialBalance = await ethers.provider.getBalance(seller.address);
          await wineMarketplace.connect(buyer).buyNFT(tokenId, { value: ethers.utils.parseEther("0.1") });
          //const finalBalance = await ethers.provider.getBalance(seller.address);
    
          // Check the producer's balance has increased
          //expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("0.1"));
    
          // Check the new owner of the NFT is the buyer
          expect(await wineNFT.ownerOf(tokenId)).to.equal(buyer.address);
        });
    });

    describe("Redeeming NFTs", function () {
      beforeEach(async function () {
        await wineMarketplace.connect(owner).addAddressToWhitelist(seller.address);
        await wineMarketplace.connect(owner).addAddressToWhitelist(buyer.address);
      });

      it("Wine not ready for redemption", async function () {
        const mintTx = await wineNFT.connect(seller).mintWine(
            seller.address,
            ethers.utils.parseEther("0.1"),
            2022,
            "Cabernet Sauvignon",
            100,
            Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
            { value: ethers.utils.parseEther("0.01") }
        );
    
        const receipt = await mintTx.wait();
        const tokenId = receipt.events[0].args.tokenId;
    
        // Set the maturity date in the future
        await wineNFT.setMaturityDate(tokenId, Math.floor(Date.now() / 1000) + 24 * 60 * 60);
        await wineNFT.setWineMarketContract(wineMarketplace.address);
    
        // Approve the marketplace to manage the token
        await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
    
        // List the NFT for sale
        await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
    
        // Buyer purchases the NFT
        await wineMarketplace.connect(buyer).buyNFT(tokenId, { value: ethers.utils.parseEther("0.1") });
    
        // Attempt to redeem the NFT before the maturity date
        let errorCaught = false;
        try {
            await wineMarketplace.connect(buyer).redeemNFT(tokenId);
        } catch (error) {
            errorCaught = true;
        }
        assert(errorCaught, "Expected transaction to be reverted but it was not");
      });
    

      it("NFT successfully redeemed", async function () {
        const mintTx = await wineNFT.connect(seller).mintWine(
            seller.address,
            ethers.utils.parseEther("0.1"),
            2022,
            "Cabernet Sauvignon",
            100,
            Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
            { value: ethers.utils.parseEther("0.01") }
        );
    
        const receipt = await mintTx.wait();
        const tokenId = receipt.events[0].args.tokenId;
    
        await wineNFT.setMaturityDate(tokenId, Math.floor(Date.now() / 1000) - 24 * 60 * 60);
        await wineNFT.setWineMarketContract(wineMarketplace.address);
        
        await wineNFT.connect(seller).approve(wineMarketplace.address, tokenId);
        
        await wineMarketplace.connect(seller).listNFT(tokenId, ethers.utils.parseEther("0.1"));
        
        await wineMarketplace.connect(buyer).buyNFT(tokenId, { value: ethers.utils.parseEther("0.1") });
        
        await wineMarketplace.connect(buyer).redeemNFT(tokenId);
        
        let errorCaught = false;
        try {
            await wineNFT.ownerOf(tokenId);
        } catch (error) {
            errorCaught = true;
            console.log(error.message);
        }
        assert(errorCaught, "Expected token to be nonexistent but was still owned");
      });

    });
});
