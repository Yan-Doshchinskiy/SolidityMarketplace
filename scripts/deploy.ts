import { ethers } from "hardhat";
import argumentsArray from "../arguments/Marketplace";

// hardhat run --network rinkeby scripts/deploy.ts
// hardhat verify --network rinkeby --constructor-args ./arguments/Marketplace.ts 0xCa7e44B9f9C108857eE89cde9879085aE6d5395d

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const Token = await ethers.getContractFactory("Marketplace");
  const Contract = await Token.deploy(...argumentsArray);
  await Contract.deployed();
  console.log("Marketplace Contract deployed to:", Contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
