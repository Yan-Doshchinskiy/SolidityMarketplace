import { expect } from "chai";

export default (): void => {
  it(`MARKETPLACE_VIEW: Min bid count equal to constructor argument`, async function (): Promise<void> {
    const count = await this.instanceMarketplace.getMinBidCount();
    expect(count).to.equal(this.minBidCount);
  });
  it(`MARKETPLACE_VIEW: Auction duration equal to constructor argument`, async function (): Promise<void> {
    const duration = await this.instanceMarketplace.getAuctionDuration();
    expect(duration).to.equal(this.auctionDuration);
  });
  it(`MARKETPLACE_VIEW: ERC721 token address equal to constructor argument`, async function (): Promise<void> {
    const address = await this.instanceMarketplace.getNftContractAddress();
    expect(address).to.equal(this.instanceERC721.address);
  });
};
