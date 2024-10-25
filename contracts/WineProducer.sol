// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./WineNFT.sol";

contract WineProducer {
    WineNFT public wineNFT;

    constructor(WineNFT _wineNFT) {
        wineNFT = _wineNFT;
    }

    function createWineNFT(
        uint256 price,
        uint16 vintage,
        string memory grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    ) public {
        wineNFT.mintWine(msg.sender, price, vintage, grapeVariety, numberOfBottles, maturityDate);
    }
}
