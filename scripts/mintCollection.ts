// import { ethers } from "hardhat";
// import ArrayOfUri from "../tokensURI/ArrayOfUri";
//
// // hardhat run --network rinkeby scripts/deploy.ts
// // hardhat verify --network rinkeby --constructor-args ./scripts/argument.ts 0xCa7e44B9f9C108857eE89cde9879085aE6d5395d
//
// async function main(): Promise<void> {
//   const [signer] = await ethers.getSigners();
//   const instance = await ethers.getContractAt(
//     "TokenERC721",
//     process.env.CONTRACT_ADDRESS as string,
//     signer
//   );
//   const mintAddress = process.env.MINT_ADDRESS as string;
//   for (const item of ArrayOfUri) {
//     await instance.mintToken(mintAddress, item);
//   }
//   console.log("Collection minted");
// }
//
// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
