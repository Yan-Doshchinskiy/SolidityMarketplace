import { expect } from "chai";

export default (): void => {
  it(`ERC721-VIEW: Name equal to constructor argument`, async function (): Promise<void> {
    const name = await this.instanceERC721.name();
    expect(name).to.equal(this.tokenNameERC721);
  });
  it(`ERC721-VIEW: Symbol equal to constructor argument`, async function (): Promise<void> {
    const symbol = await this.instanceERC721.symbol();
    expect(symbol).to.equal(this.tokenSymbolERC721);
  });
  it("ERC721-VIEW: BASE URI was changed correctly", async function (): Promise<void> {
    const baseURI = await this.instanceERC721.getBaseURI();
    expect(baseURI).to.equal(this.baseURI);
  });
  it("ERC721-VIEW: Minter address equal to constructor argumnet (true)", async function (): Promise<void> {
    const minter = await this.instanceERC721
      .connect(this.minterERC721.address)
      .getUserMinterRole();
    expect(minter).to.equal(true);
  });
  it("ERC721-VIEW: Minter address equal to constructor argumnet (false)", async function (): Promise<void> {
    const minter = await this.instanceERC721.getUserMinterRole();
    expect(minter).to.equal(false);
  });
  it("ERC721-VIEW: changeMinterRole works correctly", async function (): Promise<void> {
    const minter1 = await this.instanceERC721
      .connect(this.minterERC721.address)
      .getUserMinterRole();
    expect(minter1).to.equal(true);
    await this.instanceERC721
      .connect(this.owner)
      .changeMinterRole(this.instanceMarketplace.address);
    const minter2 = await this.instanceERC721
      .connect(this.instanceMarketplace.address)
      .getUserMinterRole();
    expect(minter2).to.equal(true);
    const minter3 = await this.instanceERC721
      .connect(this.minterERC721.address)
      .getUserMinterRole();
    expect(minter3).to.equal(false);
  });
  it("ERC721-VIEW: supportsInterface", async function (): Promise<void> {
    let isValid = true;
    for (const item of this.interfaces) {
      isValid =
        isValid && (await this.instanceERC721.supportsInterface(item.value));
    }
    expect(isValid).to.equal(true);
  });
};
