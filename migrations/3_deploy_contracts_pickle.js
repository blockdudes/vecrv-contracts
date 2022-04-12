const { ether, balance, constants, time } = require("@openzeppelin/test-helpers");
const { addContract, getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

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
const BigNumber = require("bignumber.js");

function toBN(number) {
  return new BigNumber(number);
}

module.exports = async function (deployer, network, accounts) {
  global.created = true;
  const contractList = getContract();
  const pickle = await IERC20.at("0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5");
  const feeDistro = "0x74C6CadE3eF61d64dcc9b97490d9FbB231e4BdCc";
  ///TODO  get this address
  const voteOwnership = "0xe478de485ad2fe566d49342cbd03e49ed7db3356";
  ///TODO  get this address
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const vePickle = "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf";

  // whitelisted address
  const voterProxyAddress = "0x05A7Ebd3b20A2b0742FdFDe8BA79F6D22Ea9C351";
  const voterProxyOwner = "0x30a8609c9d3f4a9ee8ebd556388c6d8479af77d1";

  // user has pickle balance in his wallet
  const pickleUser = "0xF8dB00cDdEEDd6BEA28dfF88F6BFb1B531A6cBc9";
  // user has p3CRV balance in his wallet
  const p3CRVUser = "0x1fe5F397e38fFe61E663d96821F41bCF83ed7959";

  const MAXTiME = toBN(4 * 364 * 86400);
  //deployer account
  const admin = accounts[0];

  const rFactory = await RewardFactory.deployed();
  const tFactory = await TokenFactory.deployed();
  const sFactory = await StashFactory.deployed();
  const ve3dRewardPool = await VE3DRewardPool.deployed();

  await web3.eth.sendTransaction({ from: admin, to: voterProxyOwner, value: web3.utils.toWei("1") });
  await web3.eth.sendTransaction({ from: admin, to: pickleUser, value: web3.utils.toWei("1") });
  await web3.eth.sendTransaction({ from: admin, to: p3CRVUser, value: web3.utils.toWei("1") });

  // voter proxy
  const voter = await VoterProxy.at(voterProxyAddress);

  // fund admint pickle tokens
  logTransaction(await pickle.transfer(admin, web3.utils.toWei("16000"), { from: pickleUser }), "fund pickls to admin");
  // fund voter proxy pickle token
  logTransaction(
    await pickle.transfer(voter.address, web3.utils.toWei("1000"), { from: admin }),
    "fund pickle to voter proxy"
  );

  addContract("system", "pickle_address", pickle.address);
  addContract("system", "pickle_voterProxy", voter.address);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    contractList.system.vetokenMinter,
    pickle.address,
    feeDistro,
    voteOwnership,
    voteParameter
  );
  const booster = await Booster.deployed();
  addContract("system", "pickle_booster", booster.address);
  logTransaction(await voter.setOperator(booster.address, { from: voterProxyOwner }), "voter setOperator");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance DILL", "ve3Dill");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3_pickle", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, pickle.address, vePickle, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "pickle_depositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, pickle.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "pickle_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address, { from: voterProxyOwner }), "voter proxy setDepositor");

  logTransaction(await depositor.initialLock(), "initial Lock created on DILL");

  logTransaction(await rFactory.addOperator(booster.address, pickle.address), "reward factory add operator");
  logTransaction(await tFactory.addOperator(booster.address), "token factory add operator");
  logTransaction(await sFactory.addOperator(booster.address), "stash factory add operator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool factory add operator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(
      pickle.address,
      depositor.address,
      ve3TokenRewardPool.address,
      ve3Token.address
    ),
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
