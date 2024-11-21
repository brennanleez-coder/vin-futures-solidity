// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WineNFT is ERC721, Ownable {
    struct Wine {
        uint256 wineId;
        string wineName;
        string wineDescription;
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
    address public wineMarketContract;

    constructor(
        address initialOwner
    ) ERC721("Wine NFT", "WINE") Ownable(initialOwner) {}

    function mintWine(
        string memory wineName,
        string memory wineDescription,
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

        Wine memory newWine = Wine({
            wineId: newWineId,
            wineName: wineName,
            wineDescription: wineDescription,
            producer: producer,
            price: price,
            vintage: vintage,
            grapeVariety: grapeVariety,
            numberOfBottles: numberOfBottles,
            maturityDate: maturityDate,
            redeemed: false,
            owner: producer
        });

        wines[newWineId] = newWine;
        totalWines.push(newWine);

        return newWineId;
    }

    modifier ownerOrMarketOnly(uint256 wineId) {
        require(
            wines[wineId].owner == msg.sender ||
                msg.sender == wineMarketContract,
            "You are NOT the owner or authorized market"
        );
        _;
    }

    modifier ownerOnly(uint256 wineId) {
        require(
            wines[wineId].owner == msg.sender,
            "Caller is not the owner of the wine"
        );
        _;
    }

    function burnWine(uint256 wineId) public ownerOrMarketOnly(wineId) {
        require(!wines[wineId].redeemed, "Wine has already been redeemed");
        wines[wineId].redeemed = true;
        _burn(wineId);
        delete wines[wineId];
    }

    function transfer(
        uint256 wineId,
        address newOwner
    ) public ownerOrMarketOnly(wineId) {
        address currentOwner = ownerOf(wineId);
        require(newOwner != address(0), "New owner cannot be zero address");

        _transfer(currentOwner, newOwner, wineId);
        wines[wineId].owner = newOwner;
    }

    // function setApprovalForAll(
    //     address operator,
    //     bool approved
    // ) public virtual override {
    //     super.setApprovalForAll(operator, approved);
    // }

    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId, owner); // Pass the owner as the `auth` parameter
    }

    function updateOwner(uint256 wineId, address newOwner) public {
        // require(
        //     msg.sender == wineMarketContract,
        //     "Caller is not the authorized market"
        // );
        require(wines[wineId].wineId != 0, "Wine does not exist");
        wines[wineId].owner = newOwner;
    }

    function getOwner(uint256 wineId) public view returns (address) {
        return ownerOf(wineId);
    }

    function getAllWines() public view returns (Wine[] memory) {
        return totalWines;
    }

    function getWineById(uint256 wineId) public view returns (Wine memory) {
        return wines[wineId];
    }

    function setWineMarketContract(
        address _wineMarketContract
    ) public onlyOwner {
        wineMarketContract = _wineMarketContract;
    }

    function getMaturityDate(uint256 wineId) public view returns (uint256) {
        require(wines[wineId].wineId != 0, "Wine does not exist");
        return wines[wineId].maturityDate;
    }

    function setMaturityDate(
        uint256 wineId,
        uint256 newMaturityDate
    ) public onlyOwner {
        wines[wineId].maturityDate = newMaturityDate;
    }

    function getTotalNFTs() public view returns (uint256) {
        return numWineNFTs;
    }

    function _exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
