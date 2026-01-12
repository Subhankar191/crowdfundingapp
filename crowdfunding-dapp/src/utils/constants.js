// export const CONTRACT_ADDRESS = "0xd593813d5149984bEE37C141356d70530d1f86E5";
// export const SUPPORTED_CHAINS = {
//   11155111: "Sepolia Testnet"
// };

// src/config.js (updated)
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0xd593813d5149984bEE37C141356d70530d1f86E5";
export const RPC_URL = process.env.REACT_APP_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/1cJz_pV5rf9WK7iiinUbfCJdp1ECw8VD";
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || "11155111");
export const SUPPORTED_CHAINS = {
  11155111: "Sepolia Testnet"
};