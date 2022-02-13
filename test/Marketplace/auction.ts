import { expect } from "chai";
import { ethers } from "hardhat";
import { LotStatus } from "../../interfaces/enums";

export default (): void => {
  it(`MARKETPLACE_AUCTION: listItemOnAuction functions work correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    expect(await this.instanceERC721.ownerOf(1)).to.equal(this.bob.address);
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    const tx = await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, "10000000000");
    expect(await this.instanceERC721.ownerOf(1)).to.equal(
      this.instanceMarketplace.address
    );

    const { events } = await tx.wait();
    const event = events.find((it: any) => it.event === "LotCreated");
    const { timestamp } = await event.getBlock();
    const [
      owner,
      status,
      currentPrice,
      currentBidder,
      tokenId,
      numberOfBids,
      timeOfStart,
    ] = await this.instanceMarketplace.getLotById(1);
    const result = [
      owner,
      status,
      String(currentPrice),
      currentBidder,
      String(tokenId),
      String(numberOfBids),
      String(timeOfStart),
    ];
    const expected = [
      this.bob.address,
      LotStatus.PROGRESS,
      "10000000000",
      this.zeroAddress,
      "1",
      "0",
      String(timestamp),
    ];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });
  it(`MARKETPLACE_AUCTION: only owner can call listItemOnAuction function (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .listItemOnAuction(1, "10000000000")
    ).to.be.revertedWith("MARKETPLACE: not an owner of token");
  });
  it(`MARKETPLACE_AUCTION: makeBid function. Lot must be in progress status (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await expect(
      this.instanceMarketplace.connect(this.bob).makeBid(1, "20000000000")
    ).revertedWith("MARKETPLACE: lot is not in progress");
  });
  it(`MARKETPLACE_AUCTION: makeBid function. Lot must be not expired (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "10000000000";
    const bidValue = "20000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, bidValue, { value: bidValue })
    ).revertedWith("MARKETPLACE: lot is not in progress");
  });
  it(`MARKETPLACE_AUCTION: makeBid function. Owner can't make a bid (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "10000000000";
    const bidValue = "20000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      this.instanceMarketplace
        .connect(this.bob)
        .makeBid(1, bidValue, { value: bidValue })
    ).revertedWith("MARKETPLACE: you are owner");
  });
  it(`MARKETPLACE_AUCTION: makeBid function. Bid amount must be more then previous bid (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "10000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, price, { value: price })
    ).revertedWith("MARKETPLACE: invalid bid amount");
  });
  it(`MARKETPLACE_AUCTION: makeBid function. Ethers amount must be more or equal to bid amount (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "10000000000";
    const bid = "20000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, bid, { value: price })
    ).revertedWith("MARKETPLACE: not enough ether");
  });
  it(`MARKETPLACE_AUCTION: makeBid function works correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "10000000000";
    const bid = "20000000000";
    const secBid = "30000000000";
    const secEther = "40000000000";
    const thirdBid = "80000000000";
    const fourBid = "90000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      await this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, bid, { value: bid })
    ).to.changeEtherBalance(this.alice, -bid);
    const { currentBidder, currentPrice, numberOfBids } =
      await this.instanceMarketplace.getLotById(1);
    const result = [currentBidder, String(currentPrice), Number(numberOfBids)];
    const expected = [this.alice.address, bid, 1];
    expect(JSON.stringify(result)).to.be.equal(JSON.stringify(expected));
    await expect(
      await this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, secBid, { value: secEther })
    ).to.changeEtherBalance(this.alice, -(Number(secBid) - Number(bid)));
    await expect(
      await this.instanceMarketplace
        .connect(this.owner)
        .makeBid(1, thirdBid, { value: thirdBid })
    ).to.changeEtherBalance(this.alice, secBid);
    await expect(
      await this.instanceMarketplace
        .connect(this.alice)
        .makeBid(1, fourBid, { value: fourBid })
    ).to.changeEtherBalance(this.owner, thirdBid);
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Status must be in progress (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    await expect(
      this.instanceMarketplace.connect(this.alice).finishAuction(1)
    ).revertedWith("MARKETPLACE: lot is in progress");
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Lot must be expired (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      this.instanceMarketplace.connect(this.alice).finishAuction(1)
    ).revertedWith("MARKETPLACE: lot is in progress");
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Only owner can call this function (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await expect(
      this.instanceMarketplace.connect(this.alice).finishAuction(1)
    ).revertedWith("MARKETPLACE: you are not an owner");
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Bids count must be more then constructor value (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await expect(
      this.instanceMarketplace.connect(this.bob).finishAuction(1)
    ).revertedWith("MARKETPLACE: not enough bids for finish");
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Function works correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    const bid1 = "2000000000";
    const bid2 = "4000000000";
    const bid3 = "7000000000";
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid1, { value: bid1 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid2, { value: bid2 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid3, { value: bid3 });
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await this.instanceMarketplace.connect(this.bob).finishAuction(1);
    const { status } = await this.instanceMarketplace.getLotById(1);

    expect(status).to.be.equal(LotStatus.FINISHED);
  });
  it(`MARKETPLACE_AUCTION: finishAuction function. Function works correctly (balances)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);

    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    const bid1 = "2000000000";
    const bid2 = "2500000000";
    const bid3 = "3000000000";
    const bid4 = "5000000000";
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid1, { value: bid1 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid2, { value: bid2 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid3, { value: bid4 });
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(
      this.instanceMarketplace.address
    );
    await expect(
      await this.instanceMarketplace.connect(this.bob).finishAuction(1)
    ).to.changeEtherBalance(this.bob, bid3);
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(
      this.alice.address
    );
  });
  it(`MARKETPLACE_AUCTION: cancelAuction function. Lot must be in proggress (revert)`, async function (): Promise<void> {
    await expect(
      this.instanceMarketplace.connect(this.bob).cancelAuction(1)
    ).revertedWith("MARKETPLACE: lot is in progress");
  });
  it(`MARKETPLACE_AUCTION: cancelAuction function. Lot must be not expired (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await ethers.provider.send("evm_increaseTime", [9000000000]);
    await expect(
      this.instanceMarketplace.connect(this.bob).cancelAuction(1)
    ).revertedWith("MARKETPLACE: lot is in progress");
  });
  it(`MARKETPLACE_AUCTION: cancelAuction function. Lot must be not expired (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    await expect(
      this.instanceMarketplace.connect(this.alice).cancelAuction(1)
    ).revertedWith("MARKETPLACE: you are not an owner");
  });
  it(`MARKETPLACE_AUCTION: cancelAuction function. Lot must be not expired (revert)`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    const bid1 = "2000000000";
    const bid2 = "2500000000";
    const bid3 = "3000000000";
    const bid4 = "5000000000";
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid1, { value: bid1 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid2, { value: bid2 });
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid3, { value: bid4 });
    await expect(
      this.instanceMarketplace.connect(this.bob).cancelAuction(1)
    ).revertedWith("MARKETPLACE: to much bids for cancel");
  });
  it(`MARKETPLACE_AUCTION: cancelAuction function. Function works correctly`, async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    await this.instanceMarketplace.connect(this.bob).createItem();
    const price = "1000000000";
    await this.instanceERC721
      .connect(this.bob)
      .approve(this.instanceMarketplace.address, 1);
    await this.instanceMarketplace
      .connect(this.bob)
      .listItemOnAuction(1, price);
    const bid1 = "2000000000";
    await this.instanceMarketplace
      .connect(this.alice)
      .makeBid(1, bid1, { value: bid1 });
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(
      this.instanceMarketplace.address
    );
    await expect(
      await this.instanceMarketplace.connect(this.bob).cancelAuction(1)
    ).changeEtherBalance(this.alice, bid1);
    expect(await this.instanceERC721.ownerOf(1)).to.be.equal(this.bob.address);
    const { status } = await this.instanceMarketplace.getLotById(1);
    expect(status).to.be.equal(LotStatus.CANCELED);
  });
};
