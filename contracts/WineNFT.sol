// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WineNFT is ERC721, Ownable {
    struct Wine {
        uint256 wineId;
        address producer;
        uint256 price;
        uint16 vintage;
        string grapeVariety;
        uint16 numberOfBottles;
        uint256 maturityDate;
        bool redeemed;
        address owner;
    }

    uint256 public numWineNFTs;
    mapping(uint256 => Wine) public wines;
    Wine[] public totalWines;

    constructor(address initialOwner) ERC721("Wine NFT", "WINE") Ownable(initialOwner) {
        initializeWines();
    }

    function initializeWines() internal {
        // Example producers for testing
        address producer1 = 0x0000000000000000000000000000000000000001;
        address producer2 = 0x0000000000000000000000000000000000000002;

        for (uint256 i = 0; i < 20; i++) {
            totalWines.push(Wine({
                wineId: i + 1,
                producer: i % 2 == 0 ? producer1 : producer2,
                price: (i + 1) * 0.05 ether,  // Example price increment
                vintage: uint16(2020 + (i % 3)),  // Vintages 2020, 2021, 2022
                grapeVariety: i % 3 == 0 ? "Cabernet Sauvignon" : i % 3 == 1 ? "Merlot" : "Pinot Noir",
                numberOfBottles: 100 + uint16(i * 5),  // Example number of bottles
                maturityDate: block.timestamp + (365 * 24 * 60 * 60 * (1 + i % 5)), // Maturity date staggered over years
                redeemed: false,
                owner: address(0)  // No owner initially
            }));
        }
    }

    function mintWine(
        address producer,
        uint256 price,
        uint16 vintage,
        string memory grapeVariety,
        uint16 numberOfBottles,
        uint256 maturityDate
    ) public payable returns (uint256) {
        require(
            msg.value >= 0.01 ether,
            "At least 0.01 ETH is required to mint a new Wine NFT"
        );

        uint256 newWineId = numWineNFTs++;
        _mint(producer, newWineId);

        wines[newWineId] = Wine({
            wineId: newWineId,
            producer: producer,
            price: price,
            vintage: vintage,
            grapeVariety: grapeVariety,
            numberOfBottles: numberOfBottles,
            maturityDate: maturityDate,
            redeemed: false,
            owner: producer
        });

        return newWineId;
    }


    modifier ownerOnly(uint256 wineId) {
        require(
            wines[wineId].owner == msg.sender,
            "Caller is not the owner of the wine"
        );
        _;
    }

    function burnWine(uint256 wineId) public ownerOnly(wineId) {
        try this.ownerOf(wineId) {
            require(!wines[wineId].redeemed, "Wine has already been redeemed");
            wines[wineId].redeemed = true;
            _burn(wineId);
            delete wines[wineId];
        } catch {
            revert("Wine NFT does not exist");
        }
    }

    function transfer(
        uint256 wineId,
        address newOwner
    ) public ownerOnly(wineId) {
        try this.ownerOf(wineId) returns (address currentOwner) {
            require(
                currentOwner == msg.sender,
                "You are not the owner of this Wine NFT"
            );
            _transfer(msg.sender, newOwner, wineId);
            wines[wineId].owner = newOwner;
        } catch {
            revert("Wine NFT does not exist");
        }
    }

    function getOwner(uint256 wineId) public view returns (address) {
        return ownerOf(wineId);
    }

    function getAllWines() public view returns (Wine[] memory) {
        return totalWines;
    }

    function getWineById(uint256 wineId) public view returns (Wine memory) {
        return totalWines[wineId];
    }
}
