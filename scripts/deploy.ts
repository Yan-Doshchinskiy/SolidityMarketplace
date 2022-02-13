import { ethers } from "hardhat";
import argumentsArray from "../arguments/ERC721";

// hardhat run --network rinkeby scripts/deploy.ts
// hardhat verify --network rinkeby 0x70D3B2DaF5e75aA8e51c6ad282427E1CB115FE6A  "Dummy Cat" "DMMC" "QmeMAT5163i31Gv25SGRKZ4Hx8jYiUVyyKoxJ6V245PFWX"

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
