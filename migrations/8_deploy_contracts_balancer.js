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
const ForceSend = artifacts.require("ForceSend");

const IERC20 = artifacts.require("IERC20");
const SmartWalletWhitelist = artifacts.require("SmartWalletWhitelist");
const BigNumber = require("bignumber.js");
const { logTransaction } = require("./helper/logger");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

function toBN(number) {
  return new BigNumber(number);
}

module.exports = async function (deployer, network, accounts) {
  global.created = true;
  const contractList = getContract();
  let smartWalletWhitelistAddress = "0xca719728Ef172d0961768581fdF35CB116e0B7a4";
  let balancer = await IERC20.at("0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56");
  let checkerAdmin = "0x40907540d8a6c65c637785e8f8b742ae6b0b9968";
  let balancerAdmin = "0x8F42aDBbA1B16EaAE3BB5754915E0D06059aDd75";
  ///TODO  get this address
  const feeDistro = "0x7F82ff050128e29Fd89D85d01b93246F744E62A0";
  ///TODO  get this address
  const voteOwnership = "0xe478de485ad2fe566d49342cbd03e49ed7db3356";
  ///TODO  get this address
  const voteParameter = "0xBCfF8B0b9419b9A88c44546519b1e909cF330399";
  const veBALANCER = "0xC128a9954e6c874eA3d62ce62B468bA073093F25";

  const gaugeController = "0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD";

  const balancerMintr = "0x239e55F427D44C3cc793f49bFB507ebe76638a2b";
  const balancerUser = "0x1C39BAbd4E0d7BFF33bC27c6Cc5a4f1d74C9F562";
  //TODO lp token user
  // const sanDAI_EURUser = "0x5EDCf547eCE0EA1765D6C02e9E5bae53b52E09D4";

  const MAXTiME = toBN(1 * 365 * 86400);

  let admin = accounts[0];

  const rFactory = await RewardFactory.deployed();
  const tFactory = await TokenFactory.deployed();
  const sFactory = await StashFactory.deployed();
  const ve3dRewardPool = await VE3DRewardPool.deployed();

  // fund balancer admin with ethers (workaround the balancer admin contract can't recieve ether)
  let forceSend = await ForceSend.new();
  await forceSend.go(balancerAdmin, { value: ether("1"), from: admin });

  await web3.eth.sendTransaction({ from: admin, to: checkerAdmin, value: web3.utils.toWei("1") });

  await web3.eth.sendTransaction({ from: admin, to: balancerUser, value: web3.utils.toWei("1") });

  //await web3.eth.sendTransaction({ from: admin, to: sanDAI_EURUser, value: web3.utils.toWei("1") });

  // voter proxy
  await deployer.deploy(
    VoterProxy,
    "balancerVoterProxy",
    balancer.address,
    veBALANCER,
    gaugeController,
    balancerMintr,
    4
  );
  const voter = await VoterProxy.deployed();

  // set wallet checker in escrow
  const escrow = new web3.eth.Contract(escrowABI, veBALANCER);

  await escrow.methods.commit_smart_wallet_checker(smartWalletWhitelistAddress).send({ from: balancerAdmin });

  await escrow.methods.apply_smart_wallet_checker().send({ from: balancerAdmin });

  // whitelist the voter proxy
  const whitelist = await SmartWalletWhitelist.at(smartWalletWhitelistAddress);
  logTransaction(await whitelist.approveWallet(voter.address, { from: checkerAdmin }), "whitelist voter proxy");

  // fund admint balancer tokens
  logTransaction(
    await balancer.transfer(admin, web3.utils.toWei("10000"), { from: balancerUser }),
    "fund admin balancer"
  );
  // fund voter proxy balancer token
  logTransaction(
    await balancer.transfer(voter.address, web3.utils.toWei("1000"), { from: admin }),
    "fund voter balancer"
  );
  // vetoken
  addContract("system", "balancer_address", balancer.address);
  addContract("system", "balancer_voterProxy", voter.address);

  // booster
  await deployer.deploy(
    Booster,
    voter.address,
    contractList.system.vetokenMinter,
    balancer.address,
    feeDistro,
    constants.ZERO_ADDRESS,
    constants.ZERO_ADDRESS
  );
  const booster = await Booster.deployed();
  addContract("system", "balancer_booster", booster.address);
  logTransaction(await voter.setOperator(booster.address), "voter setOperator");

  // VE3Token
  await deployer.deploy(VE3Token, "VeToken Finance veBALANCER", "ve3BALANCER");
  const ve3Token = await VE3Token.deployed();
  addContract("system", "ve3_balancer", ve3Token.address);

  // Depositer
  await deployer.deploy(VeAssetDepositor, voter.address, ve3Token.address, balancer.address, veBALANCER, MAXTiME);
  const depositor = await VeAssetDepositor.deployed();
  addContract("system", "balancer_depositor", depositor.address);

  // base reward pool for VE3Token
  await deployer.deploy(BaseRewardPool, 0, ve3Token.address, balancer.address, booster.address, rFactory.address);
  const ve3TokenRewardPool = await BaseRewardPool.deployed();
  addContract("system", "balancer_ve3TokenRewardPool", ve3TokenRewardPool.address);

  // configurations
  logTransaction(await ve3Token.setOperator(depositor.address), "ve3Token setOperator");

  logTransaction(await voter.setDepositor(depositor.address), "voter setDepositor");

  logTransaction(await depositor.initialLock(), "initial Lock created on veBALANCER");

  logTransaction(await rFactory.addOperator(booster.address, balancer.address), "rFactory addOperator");
  logTransaction(await tFactory.addOperator(booster.address), "tFactory addOperator");
  logTransaction(await sFactory.addOperator(booster.address), "sFactory addOperator");
  logTransaction(await ve3dRewardPool.addOperator(booster.address), "ve3dRewardPool addOperator");
  //add rewardToken to the pool
  logTransaction(
    await ve3dRewardPool.addRewardToken(
      balancer.address,
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
