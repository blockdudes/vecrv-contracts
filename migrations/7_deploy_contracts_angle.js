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
  let angle = await IERC20.at("0x31429d1856aD1377A8A0079410B297e1a9e214c2");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  let angleAdmin = "0xdC4e6DFe07EFCa50a197DF15D9200883eF4Eb1c8";
  const feeDistro = "0x7F82ff050128e29Fd89D85d01b93246F744E62A0";
  ///TODO  get this address
  const voteOwnership = "0xe478de485ad2fe566d49342cbd03e49ed7db3356";
  ///TODO  get this address
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const veANGLE = "0x0C462Dbb9EC8cD1630f1728B2CFD2769d09f0dd5";

  const gaugeController = "0x9aD7e7b0877582E14c17702EecF49018DD6f2367";
  ///TODO get this address
  const angleMintr = "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
  const angleUser = "0x2Fc443960971e53FD6223806F0114D5fAa8C7C4e";
  const sanDAI_EURUser = "0x5aB0e4E355b08e692933c1F6f85fd0bE56aD18A6";

  const MAXTiME = toBN(4 * 365 * 86400);

  let admin = accounts[0];

  const rFactory = await RewardFactory.deployed();
  const tFactory = await TokenFactory.deployed();
  const sFactory = await StashFactory.deployed();
  const ve3dRewardPool = await VE3DRewardPool.deployed();

  await web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: angleUser, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: angleAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: sanDAI_EURUser, value: web3.utils.toWei("1") });

  // voter proxy
  await deployer.deploy(VoterProxy, "angleVoterProxy", angle.address, veANGLE, gaugeController, angleMintr, 4);
  const voter = await VoterProxy.deployed();

  // set wallet checker in escrow
  const escrow = new web3.eth.Contract(escrowABI, veANGLE);

  await escrow.methods.commit_smart_wallet_checker(smartWalletWhitelistAddress).send({ from: angleAdmin });

  await escrow.methods.apply_smart_wallet_checker().send({ from: angleAdmin });

  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  logTransaction(await whitelist.approveWallet(voter.address, { from: checkerAdmin }), "whitelist voter proxy");

  // fund admint angle tokens
  logTransaction(await angle.transfer(admin, web3.utils.toWei("10000"), { from: angleUser }), "fund admin angle");
  // fund voter proxy angle token
  logTransaction(await angle.transfer(voter.address, web3.utils.toWei("1000"), { from: admin }), "fund voter angle");
  // vetoken
  addContract("system", "angle_address", angle.address);
  addContract("system", "angle_voterProxy", voter.address);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    contractList.system.vetokenMinter,
    angle.address,
    feeDistro,
    constants.ZERO_ADDRESS,
    constants.ZERO_ADDRESS
  );
  const booster = await Booster.deployed();
  addContract("system", "angle_booster", booster.address);
  logTransaction(await voter.setOperator(booster.address), "voter setOperator");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance veANGLE", "ve3ANGLE");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3_angle", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, angle.address, veANGLE, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "angle_depositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, angle.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "angle_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address), "voter setDepositor");

  logTransaction(await depositor.initialLock(), "initial Lock created on veANGLE");

  logTransaction(await rFactory.addOperator(booster.address, angle.address), "rFactory addOperator");
  logTransaction(await tFactory.addOperator(booster.address), "tFactory addOperator");
  logTransaction(await sFactory.addOperator(booster.address), "sFactory addOperator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool addOperator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(angle.address, depositor.address, ve3TokenRewardPool.address, ve3Token.address),
    "ve3dRewardPool addRewardToken"
  );

  logTransaction(await booster.setTreasury(depositor.address), "booster setTreasury");
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
