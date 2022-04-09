const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");

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

  // funcd account[0] with lp token p3CRV
  //  const p3crv = await IERC20.at("0x1bb74b5ddc1f4fc91d6f9e7906cf68bc93538e33");
  //  logTransaction(
  //    await p3crv.transfer(accounts[0], web3.utils.toWei("500"), { from: "0x1fe5F397e38fFe61E663d96821F41bCF83ed7959" }),
  //    "funcd account[0] with lp token p3CRV"
  //  );
};
