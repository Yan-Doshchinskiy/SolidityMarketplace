import { expect } from "chai";

export default (): void => {
  it("ERC721-MINT: Initial owner balance equal to zero", async function (): Promise<void> {
    const initialBalance = await this.instanceERC721.balanceOf(
      this.owner.address
    );
    expect(initialBalance).to.equal("0");
  });
  it("ERC721-MINT: Only MINTER_ROLE address can mint tokens (completed)", async function (): Promise<void> {
    await this.instanceERC721
      .connect(this.minterERC721)
      .mintToken(this.owner.address);
    const balanceAfterMint = await this.instanceERC721.balanceOf(
      this.owner.address
    );
    expect(balanceAfterMint).to.equal("1");
  });
  it("ERC721-MINT: Only MINTER_ROLE address can mint tokens (reverted)", async function (): Promise<void> {
    await expect(
      this.instanceERC721.mintToken(this.owner.address)
    ).to.be.revertedWith("AccessControl:");
  });
};
