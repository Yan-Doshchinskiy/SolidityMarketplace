//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./TokenERC721.sol";

contract Marketplace is AccessControl {
    // enums
    enum LotStatus {
        NONE,
        PROGRESS,
        FINISHED,
        CANCELED
    }

    // structs
    struct Offer {
        address owner;
        LotStatus status;
        uint256 usersPrice;
        uint256 tokenId;
    }

    struct AuctionLot {
        address owner;
        LotStatus status;
        uint256 currentPrice;
        address currentBidder;
        uint256 tokenId;
        uint256 numberOfBids;
        uint256 startTime;
    }

    // events
    event ItemCreated(
        address indexed _reciepient,
        uint256 indexed _tokenId
    );
    event ItemListed(address indexed _from, uint256 indexed _tokenId);
    event Buyed(address indexed _trader, uint256 indexed _tokenId);
    event Canceled(uint256 indexed _tokenId, uint256 _time);
    event LotCreated(address indexed _from, uint256 indexed _tokenId);
    event BidMaked(address indexed _bidder, uint256 indexed _lotId, uint256 _bid);
    event AuctionFinished(uint256 indexed _lotId, uint256 _time);
    event AuctionCanceled(uint256 indexed _lotId, uint256 _time);

    // mappings
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => AuctionLot) public lots;

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

    function getOfferById(uint256 _id) external view returns (Offer memory) {
        return offers[_id];
    }

    function getLotById(uint256 _id) external view returns (AuctionLot memory) {
        return lots[_id];
    }

    // Create item

    function createItem()
    external
    returns (uint256)
    {
        uint256 tokenId = nftToken.mintToken(msg.sender);
        emit ItemCreated(msg.sender, tokenId);
        return tokenId;
    }

    // List item

    function listItem(
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(
            nftToken.ownerOf(_tokenId) == msg.sender,
            "MARKETPLACE: only owner can call listItem function"
        );
        require(
            nftToken.ownerOf(_tokenId) != address(this),
            "MARKETPLACE: token already on contract balance"
        );
        nftToken.transferFrom(msg.sender, address(this), _tokenId);
        Offer memory userOffer = Offer({
        owner : msg.sender,
        status : LotStatus.PROGRESS,
        usersPrice : _price,
        tokenId : _tokenId
        });
        offers[_tokenId] = userOffer;
        emit ItemListed(msg.sender, _tokenId);
    }

    function buyItem(uint256 _tokenId) external payable {
        require(
            offers[_tokenId].status == LotStatus.PROGRESS,
            "MARKETPLACE: offer must be in PROGRESS status"
        );
        require(
            msg.sender != address(this),
            "MARKETPLACE: Sender is a current contract"
        );
        Offer storage currentOffer = offers[_tokenId];
        uint256 price = currentOffer.usersPrice;
        (bool sent,) = currentOffer.owner.call{value : price}("");
        require(sent, 'MARKETPLACE: ether was transfered');
        if (msg.value - price > 0) {
            msg.sender.call{value : msg.value - price}("");
        }
        nftToken.transferFrom(
            address(this),
            msg.sender,
            _tokenId
        );

        currentOffer.status = LotStatus.FINISHED;
        emit Buyed(msg.sender, _tokenId);
    }

    function cancel(uint256 _tokenId) external {
        require(
            offers[_tokenId].status == LotStatus.PROGRESS,
            "MARKETPLACE: offer must be in PROGRESS status"
        );
        require(
            msg.sender == offers[_tokenId].owner,
            "NFTMARKET: Only owner can cancel offer"
        );

        nftToken.safeTransferFrom(
            address(this),
            offers[_tokenId].owner,
            _tokenId
        );

        offers[_tokenId].status = LotStatus.CANCELED;
        emit Canceled(_tokenId, block.timestamp);
    }

    // AUCTION

    function listItemOnAuction(
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(
            msg.sender == nftToken.ownerOf(_tokenId),
            "MARKETPLACE: not an owner of token"
        );
        require(
            nftToken.ownerOf(_tokenId) != address(this),
            "MARKETPLACE: token already on contract balance"
        );

        nftToken.transferFrom(msg.sender, address(this), _tokenId);

        AuctionLot memory newLot = AuctionLot({
        owner : msg.sender,
        status : LotStatus.PROGRESS,
        currentPrice : _price,
        currentBidder : address(0),
        tokenId : _tokenId,
        numberOfBids : 0,
        startTime : block.timestamp
        });
        lots[_tokenId] = newLot;
        emit LotCreated(msg.sender, _tokenId);
    }

    function makeBid(uint256 _tokenId, uint256 _bid)
    external
    payable
    {
        AuctionLot storage currentLot = lots[_tokenId];
        require(
            currentLot.status == LotStatus.PROGRESS && block.timestamp < currentLot.startTime + auctionDuration,
            "MARKETPLACE: lot is not in progress"
        );
        require(
            msg.sender != currentLot.owner,
            "MARKETPLACE: you are owner"
        );
        require(
            _bid > currentLot.currentPrice,
            "MARKETPLACE: invalid bid amount"
        );
        if (msg.sender != currentLot.currentBidder) {
            require(
                msg.value >= _bid,
                "MARKETPLACE: not enough ether"
            );
            if (currentLot.numberOfBids != 0) {
                currentLot.currentBidder.call{value : currentLot.currentPrice}("");
                if (msg.value - _bid > 0) {
                    msg.sender.call{value : msg.value - _bid}("");
                }
            }
        } else {
            require(
                msg.value + currentLot.currentPrice >= _bid,
                "MARKETPLACE: not enough ether"
            );
            if (msg.value + currentLot.currentPrice - _bid > 0) {
                msg.sender.call{value : msg.value + currentLot.currentPrice - _bid}("");
            }
        }
        currentLot.currentBidder = msg.sender;
        currentLot.currentPrice = _bid;
        currentLot.numberOfBids++;

        emit BidMaked(msg.sender, _tokenId, _bid);
    }

    function finishAuction(uint256 _tokenId) external {
        AuctionLot storage currentLot = lots[_tokenId];
        require(
            currentLot.status == LotStatus.PROGRESS && block.timestamp > currentLot.startTime + auctionDuration,
            "MARKETPLACE: lot is in progress"
        );
        require(
            msg.sender == currentLot.owner,
            "MARKETPLACE: you are not an owner"
        );
        require(
            currentLot.numberOfBids > minBidCount,
            "MARKETPLACE: not enough bids for finish"
        );

        nftToken.transferFrom(
            address(this),
            currentLot.currentBidder,
            _tokenId
        );
        (bool sent,) = currentLot.owner.call{value : currentLot.currentPrice}("");
        require(
            sent,
            "MARKETPLACE: ether was not send"
        );


        currentLot.status = LotStatus.FINISHED;

        emit AuctionFinished(_tokenId, block.timestamp);
    }

    function cancelAuction(uint256 _tokenId) external {
        AuctionLot storage currentLot = lots[_tokenId];
        require(
            currentLot.status == LotStatus.PROGRESS && block.timestamp < currentLot.startTime + auctionDuration,
            "MARKETPLACE: lot is in progress"
        );
        require(
            msg.sender == currentLot.owner,
            "MARKETPLACE: you are not an owner"
        );
        require(
            currentLot.numberOfBids < minBidCount,
            "MARKETPLACE: to much bids for cancel"
        );

        if (currentLot.numberOfBids > 0) {
            (bool sent,) = currentLot.currentBidder.call{value : currentLot.currentPrice}("");
            require(
                sent,
                "MARKETPLACE: ether was not send"
            );
        }

        nftToken.transferFrom(
            address(this),
            currentLot.owner,
            _tokenId
        );

        currentLot.status = LotStatus.CANCELED;

        emit AuctionCanceled(_tokenId, block.timestamp);
    }


}
