import { task } from "hardhat/config";

task("changeMinter", "change minter address")
  .addParam("minter", "address")
  .setAction(async ({ minter }: { [key: string]: string }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const instance = await hre.ethers.getContractAt(
      "TokenERC721",
      process.env.CONTRACT_ADDRESS as string,
      signer
    );
    await instance.changeMinterRole(minter);
  });
