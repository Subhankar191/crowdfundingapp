const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const CrowdfundingPlatform = await ethers.getContractFactory("CrowdfundingPlatform");

  const crowdfundingPlatform = await CrowdfundingPlatform.deploy();

  await crowdfundingPlatform.waitForDeployment();

  console.log("CrowdfundingPlatform contract deployed to:", crowdfundingPlatform.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
