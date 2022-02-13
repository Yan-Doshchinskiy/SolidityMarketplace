import { expect } from "chai";

export default (): void => {
  it(`ERC721-URI: contractURI equal to constructor argument`, async function (): Promise<void> {
    const contractURI = await this.instanceERC721.contractURI();
    expect(contractURI).to.equal(this.baseURI + this.testContractUriERC721);
  });
  it(`ERC721-URI: collectionURI equal to constructor argument`, async function (): Promise<void> {
    const collectionURI = await this.instanceERC721.collectionURI();
    expect(collectionURI).to.equal(this.baseURI + this.testCollectionUriERC721);
  });
  it(`ERC721-URI: only owner can use changeMinterRole function (revert)`, async function (): Promise<void> {
    await expect(
      this.instanceERC721
        .connect(this.bob)
        .changeMinterRole(this.instanceMarketplace.address)
    ).to.be.revertedWith("AccessControl:");
  });
  it("ERC721-URI: only MINTER_ROLE can use mintToken function (revert)", async function (): Promise<void> {
    expect(
      this.instanceERC721.connect(this.bob).mintToken(this.owner.address)
    ).to.be.revertedWith("AccessControl:");
  });
  it("ERC721-URI: TOKEN URI equal to test Meta Data", async function (): Promise<void> {
    const tokenId = await this.instanceERC721
      .connect(this.minterERC721)
      .mintToken(this.owner.address);
    const tx = await tokenId.wait();
    const event = tx.events.find((it: any) => it.event === "Transfer");
    const args = event?.args;
    const id = args?.[2];
    const uri = await this.instanceERC721.tokenURI(id);
    const baseURI = await this.instanceERC721.getBaseURI();
    expect(uri).to.equal(
      `${baseURI}${this.testCollectionUriERC721}id_${id}.JSON`
    );
  });
  it("ERC721-URI: TOKEN URI max count cycle", async function (): Promise<void> {
    const testCount = this.supplyLimitERC721 + 3;
    // eslint-disable-next-line no-unused-vars
    for (const current of new Array(testCount)) {
      await this.instanceERC721
        .connect(this.minterERC721)
        .mintToken(this.owner.address);
    }
    const tokenId = await this.instanceERC721
      .connect(this.minterERC721)
      .mintToken(this.owner.address);
    const tx = await tokenId.wait();
    const event = tx.events.find((it: any) => it.event === "Transfer");
    const args = event?.args;
    const id = args?.[2];
    const uri = await this.instanceERC721.tokenURI(id);
    const cycles = Math.floor(id / this.supplyLimitERC721);
    const actualId = id - cycles * this.supplyLimitERC721;
    const baseURI = await this.instanceERC721.getBaseURI();
    expect(uri).to.equal(
      `${baseURI}${this.testCollectionUriERC721}id_${actualId}.JSON`
    );
  });
};
