const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VibeIslandCommemorative", function () {
  let owner, minter, alice, bob, nft;

  beforeEach(async function () {
    [owner, minter, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("VibeIslandCommemorative");
    // テストでは上限3で挙動を確認する(本番デプロイはオープンエディション=100万)
    nft = await Factory.deploy(
      owner.address,
      minter.address,
      3,
      "https://example.com/meta/"
    );
  });

  it("minterがミントでき、tokenIdは1始まりの連番", async function () {
    await nft.connect(minter).mintTo(alice.address);
    await nft.connect(minter).mintTo(bob.address);
    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect(await nft.ownerOf(2)).to.equal(bob.address);
    expect(await nft.totalSupply()).to.equal(2);
    expect(await nft.tokenURI(1)).to.equal("https://example.com/meta/1");
  });

  it("minter以外はミントできない(owner含む)", async function () {
    await expect(
      nft.connect(alice).mintTo(alice.address)
    ).to.be.revertedWithCustomError(nft, "NotMinter");
    await expect(
      nft.connect(owner).mintTo(alice.address)
    ).to.be.revertedWithCustomError(nft, "NotMinter");
  });

  it("同一ウォレットへの2枚目はAlreadyMinted", async function () {
    await nft.connect(minter).mintTo(alice.address);
    await expect(
      nft.connect(minter).mintTo(alice.address)
    ).to.be.revertedWithCustomError(nft, "AlreadyMinted");
  });

  it("譲渡して手放してもhasMintedは残り再ミント不可", async function () {
    await nft.connect(minter).mintTo(alice.address);
    await nft.connect(alice).transferFrom(alice.address, bob.address, 1);
    expect(await nft.balanceOf(alice.address)).to.equal(0);
    await expect(
      nft.connect(minter).mintTo(alice.address)
    ).to.be.revertedWithCustomError(nft, "AlreadyMinted");
  });

  it("上限に達したらSoldOut", async function () {
    const wallets = Array.from({ length: 3 }, () =>
      ethers.Wallet.createRandom().address
    );
    for (const w of wallets) {
      await nft.connect(minter).mintTo(w);
    }
    expect(await nft.totalSupply()).to.equal(3);
    await expect(
      nft.connect(minter).mintTo(alice.address)
    ).to.be.revertedWithCustomError(nft, "SoldOut");
  });

  it("譲渡は自由にできる(通常ERC-721)", async function () {
    await nft.connect(minter).mintTo(alice.address);
    await nft.connect(alice).transferFrom(alice.address, bob.address, 1);
    expect(await nft.ownerOf(1)).to.equal(bob.address);
  });

  it("ownerはminterとbaseURIを差し替えられる", async function () {
    await nft.connect(owner).setMinter(bob.address);
    await nft.connect(bob).mintTo(alice.address);
    await expect(
      nft.connect(minter).mintTo(bob.address)
    ).to.be.revertedWithCustomError(nft, "NotMinter");

    await nft.connect(owner).setBaseURI("https://vibe.example/m/");
    expect(await nft.tokenURI(1)).to.equal("https://vibe.example/m/1");

    await expect(nft.connect(alice).setMinter(alice.address)).to.be.reverted;
    await expect(nft.connect(alice).setBaseURI("x")).to.be.reverted;
  });
});
