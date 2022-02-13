//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./TokenERC721.sol";

contract Marketplace is AccessControl {
    // structs
    struct NftToken {
        address owner;
        address buyer;
        uint256 id;
        uint256 price;
        uint256 startTime;
        uint256 bidCount;
    }

    // events
    event ItemCreated(
        address indexed _reciepient,
        uint256 indexed _tokenId,
        string indexed tokenURI
    );
    event OfferMade(address indexed _from, uint256 indexed _offerId);
    event Traded(address indexed _trader, uint256 indexed _offerId);
    event Canceled(uint256 indexed _offerId, uint256 _time);
    event LotPutUp(address indexed _from, uint256 indexed _lotId);
    event Bidded(address indexed _bidder, uint256 indexed _lotId, uint256 _bid);
    event AuctionFinished(uint256 indexed _lotId, uint256 _time);
    event AuctionCanceled(uint256 indexed _lotId, uint256 _time);

    // mappings
    mapping(uint256 => NftToken) private _tokens;
    mapping(address => mapping(uint256 => bool)) private _holders;


    // ERC721
    TokenERC721 private nftToken;

    // Roles
    bytes32 private OWNER_ROLE = keccak256("OWNER_ROLE");

    // variables
    uint256 private auctionDuration;
    uint256 private minBidCount;

    constructor(address _nftToken, uint256 _bidCount, uint256 _auctionDuration) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OWNER_ROLE, msg.sender);
        nftToken = TokenERC721(_nftToken);
        minBidCount = _bidCount;
        auctionDuration = _auctionDuration;
    }

    // View functions

    function getMinBidCount() external view returns (uint256) {
        return minBidCount;
    }

    function getAuctionDuration() external view returns (uint256) {
        return auctionDuration;
    }

    function getNftContractAddress() external view returns (address) {
        return address(nftToken);
    }

    function getTokenById(uint256 _id) external view returns (NftToken memory) {
        return _tokens[_id];
    }

    // Create item

    function createItem()
    external
    returns (uint256)
    {
        uint256 tokenId = _mint(msg.sender);
        NftToken storage currentToken = _tokens[tokenId];
        currentToken.owner = msg.sender;
        currentToken.id = tokenId;
        currentToken.price = 0;
        return tokenId;
    }

    // internal functions
    function _mint(address _to) internal returns (uint256) {
        uint256 newId = nftToken.mintToken(_to);
        _holders[_to][newId] = true;
        return newId;
    }
}
