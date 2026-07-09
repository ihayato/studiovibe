// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Studio VIBE 渡島記念札
/// @notice 公式サイトで無償配布する記念NFT。
///         ミントは運営のminterアドレスのみ・1ウォレット1枚・上限はデプロイ時固定。
///         譲渡制限なし(通常のERC-721)。
contract VibeIslandCommemorative is ERC721, Ownable {
    uint256 public immutable maxSupply;
    uint256 public totalSupply;
    address public minter;
    string private _baseTokenURI;

    /// @notice ミント済みウォレット。譲渡しても再ミントは不可。
    mapping(address => bool) public hasMinted;

    error NotMinter();
    error SoldOut();
    error AlreadyMinted();

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);
    event BaseURIUpdated(string newBaseURI);

    constructor(
        address initialOwner,
        address initialMinter,
        uint256 maxSupply_,
        string memory baseURI_
    ) ERC721(unicode"STUDIO VIBE 渡島記念札", "VIBEISLE") Ownable(initialOwner) {
        minter = initialMinter;
        maxSupply = maxSupply_;
        _baseTokenURI = baseURI_;
    }

    /// @notice minterのみ呼び出し可。tokenIdは1始まりの連番。
    function mintTo(address to) external returns (uint256 tokenId) {
        if (msg.sender != minter) revert NotMinter();
        if (totalSupply >= maxSupply) revert SoldOut();
        if (hasMinted[to]) revert AlreadyMinted();

        hasMinted[to] = true;
        unchecked {
            tokenId = ++totalSupply;
        }
        _safeMint(to, tokenId);
    }

    function setMinter(address newMinter) external onlyOwner {
        emit MinterUpdated(minter, newMinter);
        minter = newMinter;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
