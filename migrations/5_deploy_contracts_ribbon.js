const { ether, balance, constants, time } = require("@openzeppelin/test-helpers");
const { addContract } = require("./helper/addContracts");
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
  let smartWalletWhitelistAddress = "0xca719728Ef172d0961768581fdF35CB116e0B7a4";
  let rbn = await IERC20.at("0x6123b0049f904d730db3c36a31167d9d4121fa6b");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  let escrowAdmin = "0x77da011d5314d80be59e939c2f7ec2f702e1dcc4";
  const feeDistro = "0x29893Bcd1fdA6da4f29D0e21edc55Abc3A29A202";
  // const voteOwnership = "0xE478de485ad2fe566d49342Cbd03E49ed7DB3356";
  // const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const veRBN = "0x19854C9A5fFa8116f48f984bDF946fB9CEa9B5f7";
  ///TODO check the address
  //const gaugeProxy = "0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5";
  ///TODO check the address
  const gaugeController = "0x0cb9cc35cEFa5622E8d25aF36dD56DE142eF6415";
  const ribbonMintr = "0x5B0655F938A72052c46d2e94D206ccB6FF625A3A";
  const rbnUser = "0x50dFdF7836C90db447Ae6DD83a3EEE2B0417d051";
  const rAAVEUser = "0x97a6B2f935B8f0BD61675a0D1E90Afd39651C205";
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";
  const MAXTiME = toBN(2 * 365 * 86400);

  let admin = accounts[0];

  await web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: rbnUser, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: escrowAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: rAAVEUser, value: web3.utils.toWei("1") });

  const rFactory = await RewardFactory.deployed();
  addContract("system", "rFactory", rFactory.address);

  const tFactory = await TokenFactory.deployed();
  addContract("system", "tFactory", tFactory.address);

  const sFactory = await StashFactory.deployed();
  addContract("system", "sFactory", sFactory.address);

  const poolManager = await PoolManager.deployed();
  addContract("system", "poolManager", poolManager.address);

  const vetokenMinter = await VeTokenMinter.deployed();
  addContract("system", "vetokenMinter", vetokenMinter.address);

  const ve3dRewardPool = await VE3DRewardPool.deployed();
  addContract("system", "ve3dRewardPool", ve3dRewardPool.address);

  // voter proxy
  await deployer.deploy(VoterProxy, "ribbonVoterProxy", rbn.address, veRBN, gaugeController, ribbonMintr, 3);
  const voter = await VoterProxy.deployed();

  // set wallet checker in escrow
  const escrow = new web3.eth.Contract(escrowABI, veRBN);

  await escrow.methods.commit_smart_wallet_checker(smartWalletWhitelistAddress).send({ from: escrowAdmin });

  await escrow.methods.apply_smart_wallet_checker().send({ from: escrowAdmin });

  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  logTransaction(await whitelist.approveWallet(voter.address, { from: checkerAdmin }), "whitelist voter proxy");

  // fund admint rbn tokens
  logTransaction(await rbn.transfer(admin, web3.utils.toWei("100000"), { from: rbnUser }), "fund admint rbn tokens");
  // fund voter proxy rbn token
  logTransaction(
    await rbn.transfer(voter.address, web3.utils.toWei("10000"), { from: admin }),
    "fund voter proxy rbn token"
  );
  // vetoken
  addContract("system", "rbn", rbn.address);
  addContract("system", "rbnVoterProxy", voter.address);
  addContract("system", "vetoken", veTokenAddress);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    vetokenMinter.address,
    rbn.address,
    feeDistro,
    constants.ZERO_ADDRESS,
    constants.ZERO_ADDRESS
  );
  const booster = await Booster.deployed();
  addContract("system", "ribbonBooster", booster.address);
  logTransaction(await voter.setOperator(booster.address), "");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance veRBN", "ve3RBN");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3RBN", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, rbn.address, veRBN, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "ribbonDepositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, rbn.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "ribbon_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address), "voter setDepositor");

  logTransaction(await depositor.initialLock(), "initial Lock created on veRBN");

  logTransaction(await rFactory.addOperator(booster.address, rbn.address), "rFactory addOperator");
  logTransaction(await tFactory.addOperator(booster.address), "tFactory addOperator");
  logTransaction(await sFactory.addOperator(booster.address), "sFactory addOperator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool addOperator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(rbn.address, depositor.address, ve3TokenRewardPool.address, ve3Token.address),
    "ve3dRewardPool addRewardToken"
  );

  logTransaction(await booster.setTreasury(depositor.address), "booster setTreasury");
  /// TODO add xVE3D token pool
  logTransaction(
    await booster.setRewardContracts(ve3TokenRewardPool.address, ve3dRewardPool.address, ve3dRewardPool.address),
    "booster setRewardContracts"
  );
  logTransaction(await booster.setPoolManager(poolManager.address), "booster setPoolManager");
  logTransaction(
    await booster.setFactories(rFactory.address, sFactory.address, tFactory.address),
    "booster setFactories"
  );
  logTransaction(await booster.setFeeInfo(toBN(10000), toBN(0)), "booster setFeeInfo");
};
