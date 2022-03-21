const { ether, balance, constants, time } = require("@openzeppelin/test-helpers");
const { addContract } = require("./helper/addContracts");

const VeToken = artifacts.require("VeToken");
const VoterProxy = artifacts.require("VoterProxy");
const RewardFactory = artifacts.require("RewardFactory");
const VE3Token = artifacts.require("VE3Token");
const VeAssetDepositor = artifacts.require("VeAssetDepositor");
const BaseRewardPool = artifacts.require("BaseRewardPool");
const Booster = artifacts.require("Booster");
const TokenFactory = artifacts.require("TokenFactory");
const VE3DRewardPool = artifacts.require("VE3DRewardPool");
const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");
const VeTokenMinter = artifacts.require("VeTokenMinter");

module.exports = async function (deployer, network, accounts) {
  const pickle = await IERC20.at("0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5");
  const feeDistro = "0x74C6CadE3eF61d64dcc9b97490d9FbB231e4BdCc";
  const voteOwnership = "0xe478de485ad2fe566d49342cbd03e49ed7db3356";
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const vePickle = "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf";
  // whitelisted address
  const voterProxyAddress = "0x05A7Ebd3b20A2b0742FdFDe8BA79F6D22Ea9C351";
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";
  const voterProxyOwner = "0x30a8609c9d3f4a9ee8ebd556388c6d8479af77d1";
  const vetokenOperator = "0xa2a379a34cc30c69ab5597bb1c4b6c5c8b23d87e";
  // user has pickle balance in his wallet
  const pickleUser = "0xF8dB00cDdEEDd6BEA28dfF88F6BFb1B531A6cBc9";
  //deployer account
  const admin = accounts[0];

  web3.eth.sendTransaction({ from: admin, to: voterProxyOwner, value: web3.utils.toWei("10") });
  web3.eth.sendTransaction({ from: admin, to: vetokenOperator, value: web3.utils.toWei("10") });

  console.log("deploying from: " + admin);

  // voter proxy
  const voter = await PcikleVoterProxy.at(voterProxyAddress);

  // fund admint pickle tokens
  await pickle.transfer(admin, web3.utils.toWei("16000"), { from: pickleUser });
  // fund voter proxy pickle token
  await pickle.transfer(voter.address, web3.utils.toWei("1000"), { from: admin });

  addContract("system", "pickle", pickle.address);
  addContract("system", "pickleVoterProxy", voter.address);
  addContract("system", "vetoken", veTokenAddress);
  addContract("system", "vetokenMinter", vetokenMinter.address);

  // booster
  await deployer.deploy(Booster, voter.address, vetokenMinter, pickle.address, feeDistro, voteOwnership, voteParameter);
  const booster = await Booster.deployed();
  addContract("system", "pickleBooster", booster.address);
  await voter.setOperator(booster.address, { from: voterProxyOwner });

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance DILL", ve3Dill);
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3Dill", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, veTokenAddress, vePickle);
  const depositor = await PickleDepositor.deployed();
  addContract("system", "pickleDepositor", depositor.address);

  await ve3Token.setOperator(depositor.address);
  await voter.setDepositor(depositor.address, { from: voterProxyOwner });
  await depositor.initialLock();
  console.log("initial Lock created on DILL");

  await booster.setTreasury(depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, pickle.address, booster.address, rFactory.address);
  const VE3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "VE3TokenRewardPool", VE3TokenRewardPool.address);

  // vetokenRewardPool
  // await deployer.deploy(
  //   vetokenRewardPool,
  //   veTokenAddress,
  //   pickle.address,
  //   pickleDepositor.address,
  //   vtpickleTokenRewards.address,
  //   vtpickleToken.address,
  //   booster.address,
  //   admin
  // );
  // const vetokenRewards = await vetokenRewardPool.deployed();
  // addContract("system", "vetokenRewards", vetokenRewards.address);

  //await booster.setRewardContracts(vtpickleTokenRewards.address, vetokenRewards.address);

  // poolmanager

  await booster.setPoolManager(poolManager.address);
  await booster.setFactories(rFactory.address, tFactory.address);
  await booster.setFeeInfo();
};
