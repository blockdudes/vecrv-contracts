const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.idle_booster;

  logTransaction(
    await poolManager.addPool(
      "0x790E38D85a364DD03F682f5EcdC88f8FF7299908",
      "0x21dDA17dFF89eF635964cd3910d167d562112f57",
      boosterAdd,
      3
    ),
    "add gauge AATranche_crvALUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x2688FC68c4eac90d9E5e1B94776cF14eADe8D877",
      "0x675eC042325535F6e176638Dd2d4994F645502B9",
      boosterAdd,
      3
    ),
    "add gauge AATranche_lido"
  );

  logTransaction(
    await poolManager.addPool(
      "0x15794DA4DCF34E674C18BbFAF4a67FF6189690F5",
      "0x7ca919Cf060D95B3A51178d9B1BCb1F324c8b693",
      boosterAdd,
      3
    ),
    "add gauge AATranche_frax"
  );

  logTransaction(
    await poolManager.addPool(
      "0xFC96989b3Df087C96C806318436B16e44c697102",
      "0x8cC001dd6C9f8370dB99c1e098e13215377Ecb95",
      boosterAdd,
      3
    ),
    "add gauge AATranche_mim"
  );

  logTransaction(
    await poolManager.addPool(
      "0x158e04225777BBEa34D2762b5Df9eBD695C158D2",
      "0xDfB27F2fd160166dbeb57AEB022B9EB85EA4611C",
      boosterAdd,
      3
    ),
    "add gauge AATranche_3eur"
  );

  logTransaction(
    await poolManager.addPool(
      "0x060a53BCfdc0452F35eBd2196c6914e0152379A6",
      "0x30a047d720f735Ad27ad384Ec77C36A4084dF63E",
      boosterAdd,
      3
    ),
    "add gauge AATranche_stecrv"
  );

  logTransaction(
    await poolManager.addPool(
      "0x4585F56B06D098D4EDBFc5e438b8897105991c6A",
      "0xAbd5e3888ffB552946Fc61cF4C816A73feAee42E",
      boosterAdd,
      3
    ),
    "add gauge AATranche_musd"
  );

  logTransaction(
    await poolManager.addPool(
      "0xfC558914b53BE1DfAd084fA5Da7f281F798227E7",
      "0x41653c7AF834F895Db778B1A31EF4F68Be48c37c",
      boosterAdd,
      3
    ),
    "add gauge AATranche_mstable"
  );

  // funcd account[0] with lp token AA_idleCvxalUSD3CRV-f
  const idleCvxalUSD3CRV = await IERC20.at("0x790E38D85a364DD03F682f5EcdC88f8FF7299908");
  logTransaction(
    await idleCvxalUSD3CRV.transfer(accounts[0], web3.utils.toWei("1000"), {
      from: "0xD2d24db10c43811302780e082A3E6f73a97eA48F",
    }),
    "funcd account[0] with lp token AA_idleCvxalUSD3CRV-f"
  );
};
