// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./WineNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WineMarketplace is Ownable {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    mapping(address => bool) public sellers;
    address[] public sellersList;
    mapping(address => bool) public buyers;
    address[] public buyersList;

    WineNFT public wineNFT;
    mapping(uint256 => Listing) public listings;

    // Addresses that are whitelisted (Producer and Distributor)
    mapping(address => bool) public whitelistedAddresses;

    event NFTListed(uint256 tokenId, address seller, uint256 price);
    event NFTPurchased(uint256 tokenId, address buyer);
    event NFTRedeemed(uint256 tokenId, address owner);
    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);

    constructor(address _wineNFT, address initialOwner) Ownable(initialOwner) {
        wineNFT = WineNFT(_wineNFT);
        initialiseBuyerAndSellerForDemo();
    }

    function initialiseBuyerAndSellerForDemo() public onlyOwner {
        // Wine Producer Address is a seller only
        address wineProducerAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        if (!sellers[wineProducerAddress]) {
            addAddressToWhitelist(wineProducerAddress);
            addSeller(wineProducerAddress);
        }

        // Wine Distributor 1 is both a buyer and a seller
        address wineDistributor1Address = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        if (
            !sellers[wineDistributor1Address] ||
            !buyers[wineDistributor1Address]
        ) {
            addAddressToWhitelist(wineDistributor1Address);
            if (!sellers[wineDistributor1Address])
                addSeller(wineDistributor1Address);
            if (!buyers[wineDistributor1Address])
                addBuyer(wineDistributor1Address);
        }

        // Wine Distributor 2 is a buyer only
        address wineDistributor2Address = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        if (!buyers[wineDistributor2Address]) {
            addAddressToWhitelist(wineDistributor2Address);
            addBuyer(wineDistributor2Address);
        }
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            wineNFT.ownerOf(tokenId) == msg.sender,
            "You are not the owner of this token"
        );
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelistedAddresses[msg.sender], "Address is not whitelisted");
        _;
    }

    function addAddressToWhitelist(address account) public onlyOwner {
        require(account != address(0), "Invalid address");
        whitelistedAddresses[account] = true;
        emit AddressWhitelisted(account);
    }

    function removeAddressFromWhitelist(address account) public onlyOwner {
        require(account != address(0), "Invalid address");
        require(whitelistedAddresses[account], "Address is not whitelisted");
        whitelistedAddresses[account] = false;
        emit AddressRemovedFromWhitelist(account);
    }

    function listNFT(
        uint256 tokenId,
        uint256 price
    ) public onlyTokenOwner(tokenId) onlyWhitelisted {
        require(price > 0, "Price must be greater than 0");
        require(
            wineNFT.getApproved(tokenId) == address(this) ||
                wineNFT.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer NFT"
        );

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId, address buyer) public payable {
        Listing memory listing = listings[tokenId];
        require(listing.seller != address(0), "NFT not listed for sale");
        require(listing.seller != buyer, "Cannot buy your own NFT");
        require(msg.value >= listing.price, "Insufficient payment");

        // Verify wine exists before proceeding
        require(wineNFT._exists(tokenId), "Wine NFT does not exist");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Remove the listing
        delete listings[tokenId];

        require(
            wineNFT.getApproved(tokenId) == address(this) ||
                wineNFT.isApprovedForAll(seller, address(this)),
            "Marketplace not approved to transfer NFT"
        );

        // Transfer the NFT directly to the buyer
        wineNFT.transfer(tokenId, buyer);

        // Update owner in WineNFT contract
        wineNFT.updateOwner(tokenId, buyer);

        // Transfer funds to the seller
        payable(seller).transfer(price);

        emit NFTPurchased(tokenId, buyer);
    }

    function redeemNFT(uint256 tokenId) public onlyTokenOwner(tokenId) {
        try wineNFT.wines(tokenId) returns (
            uint256 wineId,
            string memory wineName,
            string memory wineDescription,
            address producer,
            uint256 price,
            uint16 vintage,
            string memory grapeVariety,
            uint16 numberOfBottles,
            uint256 maturityDate,
            bool redeemed,
            address owner
        ) {
            require(
                maturityDate <= block.timestamp,
                "Wine is not ready for redemption"
            );
            require(!redeemed, "Wine already redeemed");

            wineNFT.burnWine(tokenId);

            emit NFTRedeemed(tokenId, msg.sender);
        } catch {
            revert("Failed to retrieve wine details");
        }
    }

    function cancelListing(uint256 tokenId) public onlyTokenOwner(tokenId) {
        require(
            listings[tokenId].seller == msg.sender,
            "Not the seller of this NFT"
        );
        delete listings[tokenId];
    }

    function isNFTListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].seller != address(0);
    }

    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }

    function isSeller(address _address) public view returns (bool) {
        for (uint256 i = 0; i < sellersList.length; i++) {
            if (sellersList[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function isBuyer(address _address) public view returns (bool) {
        for (uint256 i = 0; i < buyersList.length; i++) {
            if (buyersList[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function addSeller(address sellerAddress) public onlyOwner {
        require(sellerAddress != address(0), "Invalid address");
        require(!sellers[sellerAddress], "Seller already added");

        sellers[sellerAddress] = true;
        sellersList.push(sellerAddress);
    }

    function addBuyer(address buyerAddress) public onlyOwner {
        require(buyerAddress != address(0), "Invalid address");
        require(!buyers[buyerAddress], "Buyer already added");

        buyers[buyerAddress] = true;
        buyersList.push(buyerAddress);
    }

    function getAllListedNFTs() public view returns (Listing[] memory) {
        uint256 totalTokens = wineNFT.getTotalNFTs();
        uint256 totalActiveListings = 0;

        // Count active listings
        for (uint256 i = 0; i < totalTokens; i++) {
            if (listings[i].seller != address(0)) {
                totalActiveListings++;
            }
        }

        // Create an array for active listings
        Listing[] memory activeListings = new Listing[](totalActiveListings);
        uint256 index = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            if (listings[i].seller != address(0)) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }
}
