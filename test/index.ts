// eslint-disable-next-line node/no-missing-import
import hre, { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import ERC721mintFunctions from "./ERC721/mintFunctions";
import ERC721viewFunctions from "./ERC721/viewFunctions";
import ERC721uriFunctions from "./ERC721/uriFunctions";
import MarketplaceViewFunctions from "./Marketplace/viewFunctions";
import MarketplaceOfferFunctions from "./Marketplace/offers";
import MarketplaceAuctionFunctions from "./Marketplace/auction";
import argumentsArrayERC721 from "../arguments/ERC721";
import argumentsArrayMarketplace from "../arguments/Marketplace";
import { supportInterfacesERC721 } from "../interfaces/supportInterfacesERC721";

describe("contract testing", async function () {
  before(async function () {
    this.hre = hre;
    this.zeroAddress = "0x0000000000000000000000000000000000000000";
    [this.owner, this.alice, this.bob, this.sharedWallet] =
      await ethers.getSigners();
  });
  before(async function () {
    this.interfaces = supportInterfacesERC721;
    [
      this.tokenNameERC721,
      this.tokenSymbolERC721,
      this.testContractUriERC721,
      this.testCollectionUriERC721,
      this.trash1,
      this.supplyLimitERC721,
    ] = argumentsArrayERC721;
    this.baseURI = "https://gateway.pinata.cloud/ipfs/";
    this.minterERC721 = this.alice;
  });
  before(async function () {
    [this.trash2, this.minBidCount, this.auctionDuration] =
      argumentsArrayMarketplace;
    this.paymentToken = "0x4AF49f4b6869E1B9ca6CA16Cf85359bC283488eF";
  });
  beforeEach(async function () {
    const artifactERC721: Artifact = await artifacts.readArtifact(
      "TokenERC721"
    );
    const deployPayloadERC721 = [
      this.tokenNameERC721,
      this.tokenSymbolERC721,
      this.testContractUriERC721,
      this.testCollectionUriERC721,
      this.minterERC721.address,
      this.supplyLimitERC721,
    ];
    this.instanceERC721 = await waffle.deployContract(
      this.owner,
      artifactERC721,
      deployPayloadERC721
    );
  });
  beforeEach(async function () {
    const artifactMarketplace: Artifact = await artifacts.readArtifact(
      "Marketplace"
    );
    const deployPayloadMarketplace = [
      this.instanceERC721.address,
      this.minBidCount,
      this.auctionDuration,
    ];
    this.instanceMarketplace = await waffle.deployContract(
      this.owner,
      artifactMarketplace,
      deployPayloadMarketplace
    );
  });
  ERC721mintFunctions();
  ERC721viewFunctions();
  ERC721uriFunctions();
  MarketplaceViewFunctions();
  MarketplaceOfferFunctions();
  MarketplaceAuctionFunctions();
});
