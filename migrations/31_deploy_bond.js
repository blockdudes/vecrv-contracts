const VetokenBond = artifacts.require("VeTokenBond");
const Treasury = artifacts.require("Treasury");
const veToken = artifacts.require("veToken");
const LpTokenMock = artifacts.require("LpTokenMock");
const BondFactoryStorage = artifacts.require("BondFactoryStorage");
const BondFactory = artifacts.require("BondFactory");
const { constants } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const { logTransaction, logAddress } = require("./helper/logger.js");

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
  await deployer.deploy(Treasury, vetoken.address);
  let treasury = await Treasury.deployed();

  //bond factory storage
  await deployer.deploy(BondFactoryStorage);
  let bondFactoryStorage = await BondFactoryStorage.deployed();

  //bond factory
  await deployer.deploy(BondFactory, vetokenTreasury, bondFactoryStorage.address, accounts[0]);
  let bondFactory = await BondFactory.deployed();

  logTransaction(
    await bondFactoryStorage.setFactoryAddress(bondFactory.address),
    "bondFactoryStorage setFactoryAddress"
  );

  //bond
  await bondFactory.createBond(
    vetoken.address,
    lpTokenMock.address,
    treasury.address,
    accounts[0],
    [toBN(wei("100")), toBN(wei("100")), toBN(wei("100"))],
    [toBN(10000), toBN(20000), toBN(30000)]
  );

  let event = await bondFactoryStorage.getPastEvents("BondCreation");
  let bondAddress = event[0].returnValues.bond;

  logAddress("bond ", bondAddress);

  let bond = await VetokenBond.at(bondAddress);

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
