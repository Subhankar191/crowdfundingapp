require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/1cJz_pV5rf9WK7iiinUbfCJdp1ECw8VD", // Free public RPC
      accounts: [`0x${process.env.PRIVATE_KEY}`], // MetaMask private key
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // You'll need an API key
  },
};