const RewardFactory = artifacts.require("RewardFactory");
const TokenFactory = artifacts.require("TokenFactory");
const VeTokenMinter = artifacts.require("VeTokenMinter");
const PoolManager = artifacts.require("PoolManager");
const VeToken = artifacts.require("VeToken");

module.exports = async function (deployer, network, accounts) {
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";
  const vetokenOperator = "0xa2a379a34cc30c69ab5597bb1c4b6c5c8b23d87e";
  const admin = accounts[0];
  web3.eth.sendTransaction({ from: admin, to: vetokenOperator, value: web3.utils.toWei("10") });
  // vetoken minter
  await deployer.deploy(VeTokenMinter, veTokenAddress);
  let vetokenMinter = await VeTokenMinter.deployed();
  //mint vetoke to minter contract
  const vetoken = await VeToken.at(veTokenAddress);
  await vetoken.mint(vetokenMinter.address, web3.utils.toWei("30000000"), { from: vetokenOperator });

  // reward factory
  await deployer.deploy(RewardFactory);
  const rFactory = await RewardFactory.deployed();
  //addContract("system", "rFactory", rFactory.address);

  // token factory
  await deployer.deploy(TokenFactory);
  const tFactory = await TokenFactory.deployed();
  //addContract("system", "tFactory", tFactory.address);

  // pool manager
  await deployer.deploy(PoolManager);
  const poolManager = await PoolManager.deployed();
  //addContract("system", "poolManager", poolManager.address);
};
