// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./WineNFT.sol";

contract WineProducer {
    WineNFT public wineNFT;

    event WineNFTCreated(
        uint256 indexed wineId,
        address indexed producer,
        string wineName,
        string wineDescription,
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
        string memory wineName,
        string memory wineDescription,
        uint256 price,
        uint16 vintage,
        string memory grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    ) public payable {
        uint256 wineId = wineNFT.mintWine{value: msg.value}(
            wineName,
            wineDescription,
            msg.sender,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );

        emit WineNFTCreated(
            wineId,
            msg.sender,
            wineName,
            wineDescription,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );
    }
}
