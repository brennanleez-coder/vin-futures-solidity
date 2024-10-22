pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WineNFT is ERC721, Ownable {
    struct Wine {
        uint256 tokenId;
        address producer;
        uint256 price;
        uint16 vintage;
        string grapeVariety;
        uint16 numberOfBottles;
        uint256 maturityDate;
        bool redeemed;
    }

    uint256 private currentTokenId;
    mapping(uint256 => Wine) public wines;

    constructor(address initialOwner) ERC721("Wine NFT", "WINE") Ownable(initialOwner) {}

    function mintWine(
        address producer,
        uint256 price,
        uint16 vintage,
        string memory grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = currentTokenId++;
        _mint(producer, newTokenId);

        wines[newTokenId] = Wine({
            tokenId: newTokenId,
            producer: producer,
            price: price,
            vintage: vintage,
            grapeVariety: grapeVariety,
            numberOfBottles: numberOfBottles,
            maturityDate: maturityDate,
            redeemed: false
        });

        return newTokenId;
    }

    function burnWine(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        delete wines[tokenId];
    }

}
