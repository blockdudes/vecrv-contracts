const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.curve_booster;

  logTransaction(
    await poolManager.addPool(
      "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
      "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A",
      boosterAdd,
      0
    ),
    "add gauge 3pool"
  );

  logTransaction(
    await poolManager.addPool(
      "0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900",
      "0xd662908ADA2Ea1916B3318327A97eB18aD588b5d",
      boosterAdd,
      2
    ),
    "add gauge AAVE"
  );

  logTransaction(
    await poolManager.addPool(
      "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
      "0x9582C4ADACB3BCE56Fea3e590F05c3ca2fb9C477",
      boosterAdd,
      3
    ),
    "add gauge alUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf",
      "0x6d10ed2cF043E6fcf51A0e7b4C2Af3Fa06695707",
      boosterAdd,
      2
    ),
    "add gauge ankrETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x410e3E86ef427e30B9235497143881f717d93c2A",
      "0xdFc7AdFa664b08767b735dE28f9E84cd30492aeE",
      boosterAdd,
      2
    ),
    "add gauge bBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B",
      "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840",
      boosterAdd,
      0
    ),
    "add gauge BUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
      "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575",
      boosterAdd,
      0
    ),
    "add gauge Compound"
  );

  logTransaction(
    await poolManager.addPool(
      "0x3a664Ab939FD8482048609f652f9a0B0677337B9",
      "0xAEA6c312f4b3E04D752946d329693F7293bC2e6D",
      boosterAdd,
      1
    ),
    "add gauge DUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x194eBd173F6cDacE046C53eACcE9B953F28411d1",
      "0x90Bb609649E0451E5aD952683D64BD2d1f245840",
      boosterAdd,
      2
    ),
    "add gauge EURS"
  );

  logTransaction(
    await poolManager.addPool(
      "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
      "0x72E158d38dbd50A483501c24f792bDAAA3e7D55C",
      boosterAdd,
      2
    ),
    "add gauge FRAX"
  );

  logTransaction(
    await poolManager.addPool(
      "0xD2967f45c4f384DEEa880F807Be904762a3DeA07",
      "0xC5cfaDA84E902aD92DD40194f0883ad49639b023",
      boosterAdd,
      0
    ),
    "add gauge GUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0xb19059ebb43466C323583928285a49f558E572Fd",
      "0x4c18E409Dc8619bFb6a1cB56D114C3f592E0aE79",
      boosterAdd,
      0
    ),
    "add gauge hBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858",
      "0x2db0E83599a91b508Ac268a6197b8B14F5e72840",
      boosterAdd,
      0
    ),
    "add gauge HUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x1AEf73d49Dedc4b1778d0706583995958Dc862e6",
      "0x5f626c30EC1215f4EdCc9982265E8b1F411D1352",
      boosterAdd,
      1
    ),
    "add gauge MUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x2fE94ea3d5d4a175184081439753DE15AeF9d614",
      "0x11137B10C210b579405c21A07489e28F3c040AB1",
      boosterAdd,
      2
    ),
    "add gauge oBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8",
      "0x64E3C23bfc40722d3B649844055F1D51c1ac041d",
      boosterAdd,
      0
    ),
    "add gauge PAX"
  );

  logTransaction(
    await poolManager.addPool(
      "0x5282a4eF67D9C33135340fB3289cc1711c13638C",
      "0xF5194c3325202F456c95c1Cf0cA36f8475C1949F",
      boosterAdd,
      2
    ),
    "add gauge IronBank"
  );

  logTransaction(
    await poolManager.addPool(
      "0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a",
      "0xFD4D8a17df4C27c1dD245d153ccf4499e806C87D",
      boosterAdd,
      2
    ),
    "add gauge Link"
  );

  logTransaction(
    await poolManager.addPool(
      "0xDE5331AC4B3630f94853Ff322B66407e0D6331E8",
      "0xd7d147c6Bb90A718c3De8C0568F9B560C79fa416",
      boosterAdd,
      2
    ),
    "add gauge pBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0x49849C98ae39Fff122806C06791Fa73784FB3675",
      "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
      boosterAdd,
      0
    ),
    "add gauge renBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xC2Ee6b0334C261ED60C72f6054450b61B8f18E35",
      "0x4dC4A289a8E33600D8bD4cf5F6313E43a37adec7",
      boosterAdd,
      1
    ),
    "add gauge RSV"
  );

  logTransaction(
    await poolManager.addPool(
      "0x02d341CcB60fAaf662bC0554d13778015d1b285C",
      "0x462253b8F74B72304c145DB0e4Eebd326B22ca39",
      boosterAdd,
      2
    ),
    "add gauge sAAVE"
  );

  logTransaction(
    await poolManager.addPool(
      "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3",
      "0x705350c4BcD35c9441419DdD5d2f097d7a55410F",
      boosterAdd,
      1
    ),
    "add gauge sBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c",
      "0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238",
      boosterAdd,
      2
    ),
    "add gauge sETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x06325440D014e39736583c165C2963BA99fAf14E",
      "0x182B723a58739a9c974cFDB385ceaDb237453c28",
      boosterAdd,
      2
    ),
    "add gauge stETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xC25a3A3b969415c80451098fa907EC722572917F",
      "0xA90996896660DEcC6E997655E065b23788857849",
      boosterAdd,
      1
    ),
    "add gauge sUSDv2"
  );

  logTransaction(
    await poolManager.addPool(
      "0x53a901d48795C58f485cBB38df08FA96a24669D5",
      "0x824F13f1a2F29cFEEa81154b46C0fc820677A637",
      boosterAdd,
      3
    ),
    "add gauge rETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd",
      "0x6828bcF74279eE32f2723eC536c22c51Eed383C6",
      boosterAdd,
      1
    ),
    "add gauge tBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF",
      "0x6955a55416a06839309018A8B0cB72c4DDC11f15",
      boosterAdd,
      3
    ),
    "add gauge TriCrypto"
  );

  logTransaction(
    await poolManager.addPool(
      "0x97E2768e8E73511cA874545DC5Ff8067eB19B787",
      "0xC2b1DF84112619D190193E48148000e3990Bf627",
      boosterAdd,
      0
    ),
    "add gauge USDK"
  );

  logTransaction(
    await poolManager.addPool(
      "0x4f3E8F405CF5aFC05D68142F3783bDfE13811522",
      "0xF98450B5602fa59CC66e1379DFfB6FDDc724CfC4",
      boosterAdd,
      0
    ),
    "add gauge USDN"
  );

  logTransaction(
    await poolManager.addPool(
      "0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6",
      "0x055be5DDB7A925BfEF3417FC157f53CA77cA7222",
      boosterAdd,
      2
    ),
    "add gauge USDP"
  );

  logTransaction(
    await poolManager.addPool(
      "0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23",
      "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53",
      boosterAdd,
      0
    ),
    "add gauge USDT"
  );

  logTransaction(
    await poolManager.addPool(
      "0x94e131324b6054c0D789b190b2dAC504e4361b53",
      "0x3B7020743Bc2A4ca9EaF9D0722d42E20d6935855",
      boosterAdd,
      2
    ),
    "add gauge UST"
  );

  logTransaction(
    await poolManager.addPool(
      "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8",
      "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1",
      boosterAdd,
      0
    ),
    "add gauge Y"
  );

  logTransaction(
    await poolManager.addPool(
      "0x571FF5b7b346F706aa48d696a9a4a288e9Bb4091",
      "0x8101E6760130be2C8Ace79643AB73500571b7162",
      boosterAdd,
      2
    ),
    "add gauge Yv2"
  );

  //funcd account[0] with lp token p3CRV
  const threeCrv = await IERC20.at("0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
  logTransaction(
    await threeCrv.transfer(accounts[0], web3.utils.toWei("10000"), {
      from: "0x701aEcF92edCc1DaA86c5E7EdDbAD5c311aD720C",
    }),
    "funcd account[0] with lp token threeCrv"
  );
};
