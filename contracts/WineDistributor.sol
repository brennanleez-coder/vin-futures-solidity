// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./WineMarketplace.sol";

contract WineDistributor {
    WineMarketplace public marketplace;

    constructor(WineMarketplace _marketplace) {
        marketplace = _marketplace;
    }

    function buyWine(uint256 tokenId) public payable {
        marketplace.buyNFT{value: msg.value}(tokenId);
    }

    function listWineForResale(uint256 tokenId, uint256 price) public {
        marketplace.listNFT(tokenId, price);
    }

    function redeemWineNFT(uint256 tokenId) public {
        marketplace.redeemNFT(tokenId);
    }
}
