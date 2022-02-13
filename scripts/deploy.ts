import { ethers } from "hardhat";
import argumentsArray from "../arguments/Marketplace";

// hardhat run --network rinkeby scripts/deploy.ts
// hardhat verify --network rinkeby --constructor-args ./arguments/Marketplace.ts 0x0BcF670Baa312A6Ef2048C6F5CCB1B99A6Fe632b

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
