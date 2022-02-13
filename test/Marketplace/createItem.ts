import { expect } from "chai";

export default (): void => {
  it(`MARKETPLACE: Item created correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await this.instanceMarketplace.connect(this.bob).createItem();
    const token = await this.instanceMarketplace.getTokenById(2);
    const { owner, buyer, id, price, startTime, bidCount } = token;
    const result = [owner, buyer, +id, +price, +startTime, +bidCount];
    const expected = [this.bob.address, this.zeroAddress, 2, 0, 0, 0];
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).to.equal(expected[i]);
    }
  });
};
