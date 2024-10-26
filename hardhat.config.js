require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  networks: {
    // goerli: {
    //   url: process.env.ALCHEMY_URL,
    //   accounts: [process.env.METAMASK_PRIVATE_KEY],
    // },
    development: {
      url: "http://127.0.0.1:8545", // Local hardhat instance
      network_id: "*",
      loggingEnabled: true,
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
