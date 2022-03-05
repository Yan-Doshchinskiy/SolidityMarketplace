import { ethers } from "hardhat";
import argumentsArray from "../arguments/ERC721";

// hardhat run --network mumbai scripts/deployToken.ts
// hardhat verify --network mumbai --constructor-args ./arguments/ERC721.ts 0x395fBb7dCF74d7576f3C6c66164353Bff385B86A

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const Token = await ethers.getContractFactory("TokenERC721");
  const Contract = await Token.deploy(...argumentsArray);
  await Contract.deployed();
  console.log("ERC721 Contract deployed to:", Contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
