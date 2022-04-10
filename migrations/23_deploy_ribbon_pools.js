const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.ribbon_booster;

  logTransaction(
    await poolManager.addPool(
      "0xe63151A0Ed4e5fafdc951D877102cf0977Abd365",
      "0x98c371567b8A196518dcb4A4383387A2C7339382",
      boosterAdd,
      3
    ),
    "add gauge AAVE"
  );

  logTransaction(
    await poolManager.addPool(
      "0x65a833afDc250D9d38f8CD9bC2B1E3132dB13B2F",
      "0x8913EAb16a302dE3E498BbA39940e7A55c0B9325",
      boosterAdd,
      3
    ),
    "add gauge WBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0x53773E034d9784153471813dacAFF53dBBB78E8c",
      "0x4e079dCA26A4fE2586928c1319b20b1bf9f9be72",
      boosterAdd,
      3
    ),
    "add gauge stETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x25751853Eab4D0eB3652B5eB6ecB102A2789644B",
      "0x9038403C3F7C6B5Ca361C82448DAa48780D7C8Bd",
      boosterAdd,
      3
    ),
    "add gauge ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624",
      "0xa8A9699161f266f7E79080ca0b65210820BE8732",
      boosterAdd,
      3
    ),
    "add gauge ryvUSDC"
  );

  // funcd account[0] with lp token rAAVE-THETA
  const rAAVE = await IERC20.at("0xe63151A0Ed4e5fafdc951D877102cf0977Abd365");
  logTransaction(
    await rAAVE.transfer(accounts[0], web3.utils.toWei("0.5"), { from: "0x97a6B2f935B8f0BD61675a0D1E90Afd39651C205" }),
    "funcd account[0] with lp token rAAVE-THETA"
  );
};
