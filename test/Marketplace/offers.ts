import { expect } from "chai";
import { LotStatus } from "../../interfaces/enums";

export default (): void => {
  it(`MARKETPLACE_OFFERS: Item created correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await this.instanceMarketplace.connect(this.bob).createItem();
    const balanceAfterMint = await this.instanceERC721.balanceOf(
      this.bob.address
    );
    expect(balanceAfterMint).to.equal("2");
  });
  it(`MARKETPLACE_OFFERS: listItem and getOfferById functions work correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItem(1, "10000000000000000000");
    const [owner, status, usersPrice, tokenId] =
      await this.instanceMarketplace.getOfferById(1);
    const result = [owner, status, String(usersPrice), Number(tokenId)];
    const expected = [
      this.bob.address,
      LotStatus.PROGRESS,
      "10000000000000000000",
      1,
    ];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });
  it(`MARKETPLACE_OFFERS: only token owner can create offer (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .listItem(1, "10000000000000000000")
    ).to.be.revertedWith("MARKETPLACE: only owner can call listItem function");
  });
  it(`MARKETPLACE_OFFERS: buyItem function. Offer must be if PROGRESS STATUS (revert)`, async function (): Promise<void> {
    await expect(
      this.instanceMarketplace.connect(this.alice).buyItem(1)
    ).to.be.revertedWith("MARKETPLACE: offer must be in PROGRESS status");
  });
  it(`MARKETPLACE_OFFERS: buyItem function. Ether amount less then price (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(this.bob.address);
    const price = "10000000000000";
    const lessPrice = "10000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace.connect(this.bob).listItem(1, price);
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .buyItem(1, { value: lessPrice })
    ).to.be.revertedWith("MARKETPLACE: ether was transfered");
  });
  it(`MARKETPLACE_OFFERS: buyItem function works correctly if buyer sended ethers equal to price`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(this.bob.address);
    const price = "10000000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace.connect(this.bob).listItem(1, price);
    await expect(
      await this.instanceMarketplace
        .connect(this.alice)
        .buyItem(1, { value: price })
    ).to.changeEtherBalance(this.alice, -price);
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(
      this.alice.address
    );
    await this.instanceERC721
      .connect(this.alice)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace.connect(this.alice).listItem(1, price);
    await expect(
      await this.instanceMarketplace
        .connect(this.bob)
        .buyItem(1, { value: price })
    ).to.changeEtherBalance(this.alice, price);
  });
  it(`MARKETPLACE_OFFERS: The buyItem function works correctly if the buyer sends money in an amount more then price`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(this.bob.address);
    const price = "10000000000000";
    const morePrice = "20000000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace.connect(this.bob).listItem(1, price);
    await expect(
      await this.instanceMarketplace
        .connect(this.alice)
        .buyItem(1, { value: morePrice })
    ).to.changeEtherBalance(this.alice, -price);
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(
      this.alice.address
    );
    await this.instanceERC721
      .connect(this.alice)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace.connect(this.alice).listItem(1, price);
    const offer = await this.instanceMarketplace.getOfferById(1);
    expect(offer[1]).to.be.equal(LotStatus.PROGRESS);
    await expect(
      await this.instanceMarketplace
        .connect(this.bob)
        .buyItem(1, { value: morePrice })
    ).to.changeEtherBalance(this.alice, price);
    const offer2 = await this.instanceMarketplace.getOfferById(1);
    expect(offer2[1]).to.be.equal(LotStatus.FINISHED);
  });
  it(`MARKETPLACE_OFFERS: cancelOffer works correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    expect(await this.instanceERC721.ownerOf(1)).to.equal(this.bob.address);
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItem(1, "10000000000000000000");
    expect(await this.instanceERC721.ownerOf(1)).to.equal(
      this.instanceMarketplace.address
    );
    await this.instanceMarketplace.connect(this.bob).cancel(1);
    expect(await this.instanceERC721.ownerOf(1)).to.equal(this.bob.address);
    const result = await this.instanceMarketplace.getOfferById(1);
    expect(result[1]).to.be.equal(LotStatus.CANCELED);
  });
  it(`MARKETPLACE_OFFERS: cancelOffer function. Offer must be in status PROGRESS (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await expect(
      this.instanceMarketplace.connect(this.bob).cancel(1)
    ).to.be.revertedWith("MARKETPLACE: offer must be in PROGRESS status");
  });
  it(`MARKETPLACE_OFFERS: cancelOffer function. Only owner can cancel offer (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItem(1, "10000000000000000000");
    await expect(
      this.instanceMarketplace.connect(this.alice).cancel(1)
    ).to.be.revertedWith("NFTMARKET: Only owner can cancel offer");
  });
};
