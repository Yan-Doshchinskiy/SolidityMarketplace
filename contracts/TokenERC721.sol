//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TokenERC721 is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    // roles
    bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // variables
    Counters.Counter private _tokenIds;
    string private _contractURI;
    string private _collectionURI;
    uint256 private supplyLimit;
    address minter;

    constructor(
        string memory tokenName,
        string memory symbol,
        string memory _URIofContract,
        string memory _URIofCollection,
        address _minter,
        uint256 _supplyLimit
    ) ERC721(tokenName, symbol) {
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, _minter);
        _contractURI = _URIofContract;
        _collectionURI = _URIofCollection;
        supplyLimit = _supplyLimit;
        minter = _minter;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    function _baseURI() internal pure override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/";
    }

    function contractURI() external view returns (string memory) {
        return string(abi.encodePacked(_baseURI(), _contractURI));
    }

    function collectionURI() external view returns (string memory) {
        return string(abi.encodePacked(_baseURI(), _collectionURI));
    }

    function _getTokenURIbyID(uint256 _id) internal view returns (string memory) {
        uint256 cycles = uint256((_id - 1) / supplyLimit);
        uint256 actualId = _id - (cycles * supplyLimit);
        string memory id = Strings.toString(actualId);
        return string(abi.encodePacked(_collectionURI, "id_", id, ".JSON"));
    }


    function getUserMinterRole() external view returns (bool) {
        return hasRole(MINTER_ROLE, msg.sender);
    }

    function getBaseURI() external pure returns (string memory) {
        return _baseURI();
    }

    function changeMinterRole(address _newMinter)
    external
    onlyRole(OWNER_ROLE)
    {
        _revokeRole(MINTER_ROLE, minter);
        _grantRole(MINTER_ROLE, _newMinter);
        minter = _newMinter;
    }



    function mintToken(address _to)
    external
    onlyRole(MINTER_ROLE)
    returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(_to, newItemId);
        _setTokenURI(newItemId, _getTokenURIbyID(newItemId));
        return newItemId;
    }
}
