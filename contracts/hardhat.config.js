require("@nomicfoundation/hardhat-toolbox");

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    // ローカル検証用。chainIdをBase Sepoliaに合わせ、サイト側のviem設定をそのまま使えるようにする
    hardhat: {
      chainId: 84532,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: DEPLOYER_KEY,
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: DEPLOYER_KEY,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
    },
  },
};
