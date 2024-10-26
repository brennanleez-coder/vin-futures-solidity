// const WineNFT = artifacts.require("WineNFT");
// const WineMarketplace = artifacts.require("WineMarketplace");
// const WineProducer = artifacts.require("WineProducer");
// const WineDistributor = artifacts.require("WineDistributor");

// module.exports = async function(deployer, network, accounts) {
//   await deployer.deploy(WineNFT, accounts[0]);
//   const wineNFT = await WineNFT.deployed();

//   await deployer.deploy(WineMarketplace, wineNFT.address, accounts[0]);
//   const wineMarketplace = await WineMarketplace.deployed();

//   await deployer.deploy(WineProducer, wineNFT.address);

//   await deployer.deploy(WineDistributor, wineMarketplace.address);
// };

// Hardhat migration script
const hre = require("hardhat");

async function deployContracts() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WineNFT contract
  const WineNFT = await hre.ethers.getContractFactory("WineNFT");
  const wineNFT = await WineNFT.deploy(deployer.address);
  await wineNFT.deployed();
  console.log("WineNFT deployed to:", wineNFT.address);

  // Deploy WineMarketplace contract
  const WineMarketplace = await hre.ethers.getContractFactory("WineMarketplace");
  const wineMarketplace = await WineMarketplace.deploy(wineNFT.address, deployer.address);
  await wineMarketplace.deployed();
  console.log("WineMarketplace deployed to:", wineMarketplace.address);

  // Deploy WineProducer contract
  const WineProducer = await hre.ethers.getContractFactory("WineProducer");
  const wineProducer = await WineProducer.deploy(wineNFT.address);
  await wineProducer.deployed();
  console.log("WineProducer deployed to:", wineProducer.address);

  // Deploy WineDistributor contract
  const WineDistributor = await hre.ethers.getContractFactory("WineDistributor");
  const wineDistributor = await WineDistributor.deploy(wineMarketplace.address);
  await wineDistributor.deployed();
  console.log("WineDistributor deployed to:", wineDistributor.address);
}

// Exporting the function for Hardhat runtime
module.exports = async () => {
  try {
    await deployContracts();
    process.exit(0);
  } catch (error) {
    console.error("Error in deployment:", error);
    process.exit(1);
  }
};
