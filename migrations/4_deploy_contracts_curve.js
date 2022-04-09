const { ether, balance, constants, time } = require("@openzeppelin/test-helpers");
const { addContract } = require("./helper/addContracts");

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
const { logAddress, logTransaction } = require("./helper/logger");

function toBN(number) {
  return new BigNumber(number);
}

module.exports = async function (deployer, network, accounts) {
  global.created = true;
  let smartWalletWhitelistAddress = "0xca719728Ef172d0961768581fdF35CB116e0B7a4";
  let crv = await IERC20.at("0xD533a949740bb3306d119CC777fa900bA034cd52");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  const feeDistro = "0xa464e6dcda8ac41e03616f95f4bc98a13b8922dc";
  const voteOwnership = "0xE478de485ad2fe566d49342Cbd03E49ed7DB3356";
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const veCRV = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
  ///TODO check the address
  //const gaugeProxy = "0x0000000022D53366457F9d5E68Ec105046FC4383";
  ///TODO check the address
  const gaugeController = "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB";
  const curveMintr = "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
  const crvUser = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";

  const MAXTiME = toBN(4 * 364 * 86400);

  let admin = accounts[0];

  await web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("10") });

  await web3.eth.sendTransaction({ from: admin, to: crvUser, value: web3.utils.toWei("10") });

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
  await deployer.deploy(VoterProxy, "CurveVoterProxy", crv.address, veCRV, gaugeController, curveMintr, 0);
  const voter = await VoterProxy.deployed();
  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  logTransaction(await whitelist.approveWallet(voter.address, { from: checkerAdmin }), "whitelist voter proxy");

  // fund admint crv tokens
  logTransaction(await crv.transfer(admin, web3.utils.toWei("100000"), { from: crvUser }), "funcd crv to admin");
  // fund voter proxy crv token
  logTransaction(
    await crv.transfer(voter.address, web3.utils.toWei("10000"), { from: admin }),
    "fund crv to voter proxy"
  );
  // vetoken
  addContract("system", "crv", crv.address);
  addContract("system", "curveVoterProxy", voter.address);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    vetokenMinter.address,
    crv.address,
    feeDistro,
    voteOwnership,
    voteParameter
  );
  const booster = await Booster.deployed();
  addContract("system", "curveBooster", booster.address);
  logTransaction(await voter.setOperator(booster.address), "voter setOperator");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance veCRV", "ve3CRV");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3CRV", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, crv.address, veCRV, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "curveDepositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, crv.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "curve_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address), "voter setOperator");

  logTransaction(await depositor.initialLock(), "initial Lock created on veCRV");

  logTransaction(await rFactory.addOperator(booster.address, crv.address), "rFactory setOperator");
  logTransaction(await tFactory.addOperator(booster.address), "tFactory setOperator");
  logTransaction(await sFactory.addOperator(booster.address), "sFactory setOperator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool setOperator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(crv.address, depositor.address, ve3TokenRewardPool.address, ve3Token.address),
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
