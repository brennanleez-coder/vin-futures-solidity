const WineNFT = artifacts.require("WineNFT");
const WineMarketplace = artifacts.require("WineMarketplace");
const WineProducer = artifacts.require("WineProducer");
const WineDistributor = artifacts.require("WineDistributor");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(WineNFT, accounts[0]);
  const wineNFT = await WineNFT.deployed();

  await deployer.deploy(WineMarketplace, wineNFT.address, accounts[0]);
  const wineMarketplace = await WineMarketplace.deployed();

  await deployer.deploy(WineProducer, wineNFT.address);

  await deployer.deploy(WineDistributor, wineMarketplace.address);
};