import { task } from "hardhat/config";

task("mint", "mint one token")
  .addParam("to", "address")
  .setAction(async ({ to }: { [key: string]: string }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const instance = await hre.ethers.getContractAt(
      "TokenERC721",
      process.env.CONTRACT_ADDRESS as string,
      signer
    );
    await instance.mintToken(to);
  });
