const { ether, balance, constants, time } = require("@openzeppelin/test-helpers");
const { addContract, getContract } = require("./helper/addContracts");
const escrowABI = require("./helper/escrowABI.json");

const VoterProxy = artifacts.require("VoterProxy");
const RewardFactory = artifacts.require("RewardFactory");
const VE3Token = artifacts.require("VE3Token");
const VeAssetDepositor = artifacts.require("VeAssetDepositor");
const BaseRewardPool = artifacts.require("BaseRewardPool");
const Booster = artifacts.require("Booster");
const TokenFactory = artifacts.require("TokenFactory");
const StashFactory = artifacts.require("StashFactory");
const VE3DRewardPool = artifacts.require("VE3DRewardPool");
const PoolManager = artifacts.require("PoolManager");
const VeTokenMinter = artifacts.require("VeTokenMinter");
const IERC20 = artifacts.require("IERC20");
const SmartWalletWhitelist = artifacts.require("SmartWalletWhitelist");
const BigNumber = require("bignumber.js");
const { logTransaction } = require("./helper/logger");

function toBN(number) {
  return new BigNumber(number);
}

module.exports = async function (deployer, network, accounts) {
  global.created = true;
  const contractList = getContract();
  let smartWalletWhitelistAddress = "0xca719728Ef172d0961768581fdF35CB116e0B7a4";
  let idle = await IERC20.at("0x875773784Af8135eA0ef43b5a374AaD105c5D39e");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  let idleAdmin = "0xd6dabbc2b275114a2366555d6c481ef08fdc2556";
  const feeDistro = "0xbabb82456c013fd7e3f25857e0729de8207f80e2";
  // const voteOwnership = "0xE478de485ad2fe566d49342Cbd03E49ed7DB3356";
  // const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const stkIDLE = "0xaac13a116ea7016689993193fce4badc8038136f";
  ///TODO check the address
  //const gaugeProxy = "0xBb1CB94F14881DDa38793d7F6F99d96Db0594051";
  ///TODO check the address
  const gaugeController = "0xaC69078141f76A1e257Ee889920d02Cc547d632f";
  const idleMintr = "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
  const idleUser = "0x3675D2A334f17bCD4689533b7Af263D48D96eC72";
  const AA_idleCvxalUSD3CRVUser = "0xD2d24db10c43811302780e082A3E6f73a97eA48F";
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";
  const MAXTiME = toBN(4 * 365 * 86400);

  let admin = accounts[0];

  const rFactory = await RewardFactory.deployed();
  const tFactory = await TokenFactory.deployed();
  const sFactory = await StashFactory.deployed();
  const ve3dRewardPool = await VE3DRewardPool.deployed();

  await web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: idleUser, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: idleAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: AA_idleCvxalUSD3CRVUser, value: web3.utils.toWei("1") });

  // voter proxy
  await deployer.deploy(VoterProxy, "ribbonVoterProxy", idle.address, stkIDLE, gaugeController, idleMintr, 4);
  const voter = await VoterProxy.deployed();

  // set wallet checker in escrow
  const escrow = new web3.eth.Contract(escrowABI, stkIDLE);
  console.log("checker is ", await escrow.methods.smart_wallet_checker().call());

  await escrow.methods.commit_smart_wallet_checker(smartWalletWhitelistAddress).send({ from: idleAdmin });

  await escrow.methods.apply_smart_wallet_checker().send({ from: idleAdmin });

  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  logTransaction(await whitelist.approveWallet(voter.address, { from: checkerAdmin }), "whitelist voter proxy");

  // fund admint idle tokens
  logTransaction(await idle.transfer(admin, web3.utils.toWei("100000"), { from: idleUser }), "fund admin idle");
  // fund voter proxy idle token
  logTransaction(await idle.transfer(voter.address, web3.utils.toWei("10000"), { from: admin }), "fund voter idle");
  // vetoken
  addContract("system", "idle_address", idle.address);
  addContract("system", "idle_voterProxy", voter.address);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    contractList.system.vetokenMinter,
    idle.address,
    feeDistro,
    constants.ZERO_ADDRESS,
    constants.ZERO_ADDRESS
  );
  const booster = await Booster.deployed();
  addContract("system", "idle_booster", booster.address);
  logTransaction(await voter.setOperator(booster.address), "voter setOperator");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance stkIDLE", "ve3RBN");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3_idle", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, idle.address, stkIDLE, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "idle_depositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, idle.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "idle_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address), "voter setDepositor");

  logTransaction(await depositor.initialLock(), "initial Lock created on stkIDLE");

  logTransaction(await rFactory.addOperator(booster.address, idle.address), "rFactory addOperator");
  logTransaction(await tFactory.addOperator(booster.address), "tFactory addOperator");
  logTransaction(await sFactory.addOperator(booster.address), "sFactory addOperator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool addOperator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(idle.address, depositor.address, ve3TokenRewardPool.address, ve3Token.address),
    "ve3dRewardPool addRewardToken"
  );

  logTransaction(await booster.setTreasury(depositor.address), "booster setTreasur");
  /// TODO add xVE3D token pool
  logTransaction(
    await booster.setRewardContracts(ve3TokenRewardPool.address, ve3dRewardPool.address, ve3dRewardPool.address),
    "booster setRewardContracts"
  );
  logTransaction(await booster.setPoolManager(contractList.system.poolManager), "booster setPoolManager");
  logTransaction(
    await booster.setFactories(rFactory.address, sFactory.address, tFactory.address),
    "booster setFactories"
  );
  logTransaction(await booster.setFeeInfo(toBN(10000), toBN(0)), "booster setFeeInfo");
};
