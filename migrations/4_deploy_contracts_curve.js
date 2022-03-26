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

function toBN(number) {
  return new BigNumber(number);
}

module.exports = async function (deployer, network, accounts) {
  let smartWalletWhitelistAddress = "0xca719728Ef172d0961768581fdF35CB116e0B7a4";
  let crv = await IERC20.at("0xD533a949740bb3306d119CC777fa900bA034cd52");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  const feeDistro = "0xa464e6dcda8ac41e03616f95f4bc98a13b8922dc";
  const voteOwnership = "0xE478de485ad2fe566d49342Cbd03E49ed7DB3356";
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const veCRV = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
  ///TODO check the address
  const gaugeProxy = "0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5";
  ///TODO check the address
  const gaugeController = "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB";
  const curveMintr = "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
  const crvUser = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
  const veTokenAddress = "0x1F209ed40DD77183e9B69c72106F043e0B51bf24";

  let admin = accounts[0];

  web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("10") });
  web3.eth.sendTransaction({ from: admin, to: crvUser, value: web3.utils.toWei("10") });

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

  // voter proxy
  await deployer.deploy(VoterProxy, "CurveVoterProxy", crv.address, veCRV, gaugeController, curveMintr, 0);
  const voter = await VoterProxy.deployed();
  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  await whitelist.approveWallet(voter.address, { from: checkerAdmin });
  console.log("witelisted is ", await whitelist.check(voter.address));

  // fund admint crv tokens
  await crv.transfer(admin, web3.utils.toWei("100000"), { from: crvUser });
  // fund voter proxy crv token
  await crv.transfer(voter.address, web3.utils.toWei("10000"), { from: admin });
  // vetoken
  addContract("system", "crv", crv.address);
  addContract("system", "curveVoterProxy", voter.address);
  addContract("system", "vetoken", veTokenAddress);

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
  await voter.setOperator(booster.address);

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance veCRV", "ve3CRV");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3CRV", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, crv.address, veCRV);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "curveDepositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, crv.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "ve3TokenRewardPool", ve3TokenRewardPool.address);

  // VE3DRewardPool
  await deployer.deploy(
    VE3DRewardPool,
    veTokenAddress,
    crv.address,
    depositor.address,
    ve3TokenRewardPool.address,
    ve3Token.address,
    booster.address,
    rFactory.address
  );
  const ve3dRewardPool = await VE3DRewardPool.deployed();
  addContract("system", "ve3dRewardPool", ve3dRewardPool.address);

  // configurations
  await ve3Token.setOperator(depositor.address);

  await voter.setDepositor(depositor.address);

  await depositor.initialLock();
  console.log("initial Lock created on veCRV");

  await poolManager.addBooster(booster.address, gaugeProxy);
  await rFactory.addOperator(booster.address, crv.address);
  await tFactory.addOperator(booster.address);
  await sFactory.addOperator(booster.address);

  await booster.setTreasury(depositor.address);
  /// TODO add xVE3D token pool
  await booster.setRewardContracts(ve3TokenRewardPool.address, ve3dRewardPool.address, ve3dRewardPool.address);
  await booster.setPoolManager(poolManager.address);
  await booster.setFactories(rFactory.address, sFactory.address, tFactory.address);
  await booster.setFeeInfo(toBN(10000), toBN(0));
};
