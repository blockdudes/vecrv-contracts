const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.curveBooster;

  // logTransaction(
  //   await poolManager.addPool(
  //     "0xdc98556ce24f007a5ef6dc1ce96322d65832a819",
  //     "0xfAA267C3Bb25a82CFDB604136a29895D30fd3fd8",
  //     boosterAdd,
  //     0
  //   ),
  //   "add gauge PICKLE/ETH LP"
  // );
};
