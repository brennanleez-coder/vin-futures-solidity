require("@nomiclabs/hardhat-truffle5");

module.exports = {
  networks: {
    development: {
      url: "http://127.0.0.1:7545", // Local Ganache instance
      network_id: "*",
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
