const VetokenBond = artifacts.require("VetokenBond");
const Treasury = artifacts.require("Treasury");
const veToken = artifacts.require("veToken");
const LpTokenMock = artifacts.require("LpTokenMock");
const { constants } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const { logTransaction } = require("./helper/logger.js");

function toBN(number) {
  return new BigNumber(number);
}
const wei = web3.utils.toWei;

module.exports = async function (deployer, network, accounts) {
  const vetokenTreasury = "0x9e3B5c81336f17B3e484f6805815f21782290EEF";

  // vetoken
  await deployer.deploy(veToken);
  let vetoken = await veToken.deployed();

  //principal token
  await deployer.deploy(LpTokenMock);
  let lpTokenMock = await LpTokenMock.deployed();

  // treasury
  await deployer.deploy(Treasury, vetoken.address, accounts[0]);

  let treasury = await Treasury.deployed();

  //bond
  await deployer.deploy(
    VetokenBond,
    treasury.address,
    vetoken.address,
    lpTokenMock.address,
    vetokenTreasury,
    accounts[0],
    accounts[0],
    [toBN(wei("100")), toBN(wei("100")), toBN(wei("100"))],
    [toBN(10000), toBN(20000), toBN(30000)]
  );
  let bond = await VetokenBond.deployed();

  logTransaction(await treasury.toggleBondContract(bond.address), "toggleBondContract");

  logTransaction(await treasury.updateBondMaxSupply(bond.address, toBN(wei("300"))), "updateBondMaxSupply");

  logTransaction(await bond.setBondTerms(0, toBN(10000)), "setBondTerms");
  //initilize bond
  logTransaction(
    await bond.initializeBond(toBN(1000000), toBN(10000), 0, toBN(500), toBN(wei("300")), toBN(wei("300"))),
    "initializeBond"
  );

  // npx truffle run verify veToken LpTokenMock Treasury VetokenBond --network rinkeby
};
