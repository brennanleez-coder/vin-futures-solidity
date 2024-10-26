const hre = require("hardhat");

async function deployContracts() {
  console.log("Running deployment script...");

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WineNFT contract
  const WineNFT = await hre.ethers.getContractFactory("WineNFT");
  const wineNFT = await WineNFT.deploy(deployer.address);
  await wineNFT.deployed();
  console.log("WineNFT deployed to:", wineNFT.address);

  // Deploy WineMarketplace contract
  const WineMarketplace = await hre.ethers.getContractFactory(
    "WineMarketplace"
  );
  const wineMarketplace = await WineMarketplace.deploy(
    wineNFT.address,
    deployer.address
  );
  await wineMarketplace.deployed();
  console.log("WineMarketplace deployed to:", wineMarketplace.address);

  // Deploy WineProducer contract
  const WineProducer = await hre.ethers.getContractFactory("WineProducer");
  const wineProducer = await WineProducer.deploy(wineNFT.address);
  await wineProducer.deployed();
  console.log("WineProducer deployed to:", wineProducer.address);

  // Deploy WineDistributor contract
  const WineDistributor = await hre.ethers.getContractFactory(
    "WineDistributor"
  );
  const wineDistributor = await WineDistributor.deploy(wineMarketplace.address);
  await wineDistributor.deployed();
  console.log("WineDistributor deployed to:", wineDistributor.address);
}

deployContracts().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});