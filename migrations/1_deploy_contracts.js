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

  // Set the wineMarketplace address in the WineNFT contract
  console.log("Setting WineMarketplace address in WineNFT...");
  const tx = await wineNFT.setWineMarketContract(wineMarketplace.address);
  await tx.wait();
  console.log("WineMarketplace address set in WineNFT successfully.");

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

  // Initialize roles in WineMarketplace (Optional: Demo setup)
  console.log("Initializing roles in WineMarketplace...");
  const initTx = await wineMarketplace.initialiseBuyerAndSellerForDemo();
  await initTx.wait();
  console.log("Roles initialized successfully in WineMarketplace.");

  console.log("Deployment script completed successfully!");
}

deployContracts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
