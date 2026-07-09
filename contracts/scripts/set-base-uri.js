const { ethers, network } = require("hardhat");

// tokenURIの基準URLを差し替える(owner権限)
// 使い方:
//   DEPLOYER_PRIVATE_KEY=<ownerの鍵> \
//   CONTRACT_ADDRESS=<デプロイ済みVibeIslandCommemorativeのアドレス> \
//   NEW_BASE_URI=https://vibe.co.jp/api/nft/meta/ \
//   npx hardhat run scripts/set-base-uri.js --network base
async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const newBaseURI = process.env.NEW_BASE_URI;
  if (!address) throw new Error("CONTRACT_ADDRESS を指定してください");
  if (!newBaseURI || !newBaseURI.endsWith("/")) {
    throw new Error("NEW_BASE_URI を指定してください(末尾スラッシュ必須)");
  }

  const [signer] = await ethers.getSigners();
  console.log(`network: ${network.name}`);
  console.log(`signer : ${signer.address} (ownerである必要あり)`);

  const nft = await ethers.getContractAt("VibeIslandCommemorative", address);
  const tx = await nft.setBaseURI(newBaseURI);
  console.log(`tx: ${tx.hash}`);
  await tx.wait();
  console.log(`baseURI -> ${newBaseURI}`);
  console.log(`tokenURI(1): ${await nft.tokenURI(1)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
