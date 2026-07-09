const { ethers, network } = require("hardhat");

// 本番の上限枚数。オープンエディションなので既定は100万(環境変数MAX_SUPPLYで上書き可)
const MAX_SUPPLY = process.env.MAX_SUPPLY ? Number(process.env.MAX_SUPPLY) : 1_000_000;

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("DEPLOYER_PRIVATE_KEY を環境変数で指定してください");
  }

  const ownerAddress = process.env.OWNER_ADDRESS || deployer.address;
  const minterAddress = process.env.MINTER_ADDRESS;
  const baseURI = process.env.BASE_TOKEN_URI;
  if (!minterAddress) {
    throw new Error("MINTER_ADDRESS(サーバーミント用ウォレット)を指定してください");
  }
  if (!baseURI) {
    throw new Error(
      "BASE_TOKEN_URI を指定してください(例: https://vibe.co.jp/api/nft/meta/)"
    );
  }

  console.log(`network : ${network.name}`);
  console.log(`deployer: ${deployer.address}`);
  console.log(`owner   : ${ownerAddress}`);
  console.log(`minter  : ${minterAddress}`);
  console.log(`baseURI : ${baseURI}`);
  console.log(`supply  : ${MAX_SUPPLY}`);

  const Factory = await ethers.getContractFactory("VibeIslandCommemorative");
  const nft = await Factory.deploy(ownerAddress, minterAddress, MAX_SUPPLY, baseURI);
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log(`\nVibeIslandCommemorative deployed: ${address}`);
  console.log(
    `verify: npx hardhat verify --network ${network.name} ${address} ${ownerAddress} ${minterAddress} ${MAX_SUPPLY} "${baseURI}"`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
