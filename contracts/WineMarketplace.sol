pragma solidity ^0.8.0;

import "./WineNFT.sol";

contract WineMarketplace {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    WineNFT public wineNFT;
    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 tokenId, address seller, uint256 price);
    event NFTPurchased(uint256 tokenId, address buyer);
    event NFTRedeemed(uint256 tokenId, address owner);

    constructor(WineNFT _wineNFT) {
        wineNFT = _wineNFT;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(wineNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be greater than 0");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) public payable {
        Listing memory listing = listings[tokenId];
        require(msg.value == listing.price, "Incorrect price");

        wineNFT.safeTransferFrom(listing.seller, msg.sender, tokenId);
        payable(listing.seller).transfer(msg.value);

        delete listings[tokenId];
        emit NFTPurchased(tokenId, msg.sender);
    }

    function redeemNFT(uint256 tokenId) public {
        require(wineNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        (
            uint256 tokenId,
            address producer,
            uint256 price,
            uint16 vintage,
            string memory grapeVariety,
            uint16 numberOfBottles,
            uint256 maturityDate,
            bool redeemed
        ) = wineNFT.wines(tokenId);

        WineNFT.Wine memory wine = WineNFT.Wine({
            tokenId: tokenId,
            producer: producer,
            price: price,
            vintage: vintage,
            grapeVariety: grapeVariety,
            numberOfBottles: numberOfBottles,
            maturityDate: maturityDate,
            redeemed: redeemed
        });
        require(wine.maturityDate <= block.timestamp, "Wine is not ready for redemption");

        wineNFT.burnWine(tokenId);

        emit NFTRedeemed(tokenId, msg.sender);
    }

}
