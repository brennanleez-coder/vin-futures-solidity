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
        uint256 wineId = wineNFT.mintWine{value: msg.value}(
            msg.sender,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );

        // Emit the event with the correct wineId
        emit WineNFTCreated(
            wineId, // Use the correct token ID returned from mintWine
            msg.sender,
            price,
            vintage,
            grapeVariety,
            numberOfBottles,
            maturityDate
        );
    }
}
