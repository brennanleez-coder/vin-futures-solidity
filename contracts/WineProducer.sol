// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./WineNFT.sol";

contract WineProducer {
    WineNFT public wineNFT;

    event WineNFTCreated(
        uint256 indexed wineId,
        address indexed producer,
        uint256 price,
        uint16 vintage,
        string grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    );

    constructor(WineNFT _wineNFT) {
        wineNFT = _wineNFT;
    }

    function createWineNFT(
        uint256 price,
        uint16 vintage,
        string memory grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    ) public payable {
        wineNFT.mintWine{value: msg.value}(
            msg.sender,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );

        emit WineNFTCreated(
            wineNFT.getAllWines().length,
            msg.sender,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );
    }
}
