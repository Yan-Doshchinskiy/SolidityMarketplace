import { ethers } from "hardhat";
import tokenArguments from "../arguments/ERC721"
import whitelist from "../tokensURI/whitelist";

// hardhat run --network mumbai scripts/mintCollection.ts

async function mintCollenction(): Promise<void> {
  // const collectionSize = tokenArguments[5];
  const [signer] = await ethers.getSigners();
  const instance = await ethers.getContractAt(
    "TokenERC721",
    process.env.TOKEN_CONTRACT_ADDRESS as string,
    signer
  );
  // const mintAddress = process.env.MINTER_ADDRESS as string;
  // for (let i = 1; i <= collectionSize; i++) {
  //   await instance.mintToken(mintAddress);
  //   console.log("token minted");
  // }
  const limit = 5;
  for (const user of whitelist) {
    for (let i = 1; i <= limit; i++) {
      await instance.mintToken(user);
      console.log(i, "for user", user, "minted");
    }
  }
  console.log("Collection minted");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
mintCollenction().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
