const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");
const IERC20 = artifacts.require("IERC20");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.pickleBooster;

  logTransaction(
    await poolManager.addPool(
      "0xdc98556ce24f007a5ef6dc1ce96322d65832a819",
      "0xfAA267C3Bb25a82CFDB604136a29895D30fd3fd8",
      boosterAdd,
      0
    ),
    "add gauge PICKLE/ETH LP"
  );

  logTransaction(
    await poolManager.addPool(
      "0x5eff6d166d66bacbc1bf52e2c54dd391ae6b1f48",
      "0xd3F6732D758008E59e740B2bc2C1b5E420b752c2",
      boosterAdd,
      0
    ),
    "add gauge pSUSHIYVECRV"
  );

  logTransaction(
    await poolManager.addPool(
      "0x1bb74b5ddc1f4fc91d6f9e7906cf68bc93538e33",
      "0xf5bD1A4894a6ac1D786c7820bC1f36b1535147F6",
      boosterAdd,
      0
    ),
    "add gauge p3CRV"
  );

  logTransaction(
    await poolManager.addPool(
      "0x55282da27a3a02ffe599f6d11314d239dac89135",
      "0x6092c7084821057060ce2030F9CC11B22605955F",
      boosterAdd,
      0
    ),
    "add gauge pSLPDAI"
  );
  logTransaction(
    await poolManager.addPool(
      "0x8c2d16b7f6d3f989eb4878ecf13d695a7d504e43",
      "0x8F720715d34Ff1FDa1342963EF6372d1557dB3A7",
      boosterAdd,
      0
    ),
    "add gauge pSLPUSDC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xa7a37ae5cb163a3147de83f15e15d8e5f94d6bce",
      "0x421476a3c0338E929cf9B77f7D087533bc9d2a2d",
      boosterAdd,
      0
    ),
    "add gauge pSLPUSDT"
  );

  logTransaction(
    await poolManager.addPool(
      "0xde74b6c547bd574c3527316a2ee30cd8f6041525",
      "0xD55331E7bCE14709d825557E5Bca75C73ad89bFb",
      boosterAdd,
      0
    ),
    "add gauge pSLPWBTC"
  );

  logTransaction(
    await poolManager.addPool(
      "0x3261D9408604CC8607b687980D40135aFA26FfED",
      "0x2E32b1c2D7086DB1620F4586E09BaC7147640838",
      boosterAdd,
      0
    ),
    "add gauge pSLPYFI"
  );

  logTransaction(
    await poolManager.addPool(
      "0x77c8a58d940a322aea02dbc8ee4a30350d4239ad",
      "0x4731CD18fFfF2C2A43f72eAe1B598dC3c0C16912",
      boosterAdd,
      0
    ),
    "add gauge pstETHCRV"
  );

  logTransaction(
    await poolManager.addPool(
      "0xcba1fe4fdbd90531efd929f1a1831f38e91cff1e",
      "0x042650a573f3d62d91C36E08045d7d0fd9E63759",
      boosterAdd,
      0
    ),
    "add gauge pSaddle ETH/alETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x3bcd97dca7b1ced292687c97702725f37af01cac",
      "0x02c9420467a22ad6067ef0CB4459752F45266C07",
      boosterAdd,
      0
    ),
    "add gauge pUNIMIRUST"
  );

  logTransaction(
    await poolManager.addPool(
      "0xafb2fe266c215b5aae9c4a9dadc325cc7a497230",
      "0xd7513F24B4D3672ADD9AF6C739Eb6EeBB85D8dD5",
      boosterAdd,
      0
    ),
    "add gauge pUNImTSLAUST"
  );

  logTransaction(
    await poolManager.addPool(
      "0xf303b35d5bcb4d9ed20fb122f5e268211dec0ebd",
      "0x2Df015B117343e24AEC9AC99909A4c097a2828Ab",
      boosterAdd,
      0
    ),
    "add gauge pUNImAAPLUST"
  );
  logTransaction(
    await poolManager.addPool(
      "0x7c8de3ee2244207a54b57f45286c9ee1465fee9f",
      "0x3D24b7693A0a5Bf13977b19C81460aEd3f60C150",
      boosterAdd,
      0
    ),
    "add gauge pUNImQQQUST"
  );

  logTransaction(
    await poolManager.addPool(
      "0x1ed1fd33b62bea268e527a622108fe0ee0104c07",
      "0x1456846B5A7d3c7F9Ea643a4847376fB19fC1aB1",
      boosterAdd,
      0
    ),
    "add gauge pUNImSLVUST"
  );

  logTransaction(
    await poolManager.addPool(
      "0x1cf137f651d8f0a4009ded168b442ea2e870323a",
      "0x6Ea17c249f6cFD434A01c54701A8694766b76594",
      boosterAdd,
      0
    ),
    "add gauge pUNImBABAUST"
  );
  logTransaction(
    await poolManager.addPool(
      "0xecb520217dccc712448338b0bb9b08ce75ad61ae",
      "0xdaf08622Ce348fdEA09709F279B6F5673B1e0dad",
      boosterAdd,
      0
    ),
    "add gauge pSUSHIETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xc1513c1b0b359bc5acf7b772100061217838768b",
      "0xeA5b46877E2d131405DB7e5155CC15B8e55fbD27",
      boosterAdd,
      0
    ),
    "add gauge pUNIFEITRIBE"
  );

  logTransaction(
    await poolManager.addPool(
      "0xced67a187b923f0e5ebcc77c7f2f7da20099e378",
      "0xDA481b277dCe305B97F4091bD66595d57CF31634",
      boosterAdd,
      0
    ),
    "add gauge pSUSHIYVBOOST"
  );

  logTransaction(
    await poolManager.addPool(
      "0x927e3bcbd329e89a8765b52950861482f0b227c4",
      "0xBc9d68F38881a9C161DA18881e21b2aC9dF87B55",
      boosterAdd,
      0
    ),
    "add gauge pUNILUSDETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x9eb0aad5bb943d3b2f7603deb772faa35f60adf9",
      "0xE9bEAd1d3e3A25E8AF7a6B40e48de469a9613EDe",
      boosterAdd,
      0
    ),
    "add gauge pSUSHIALCX"
  );
  logTransaction(
    await poolManager.addPool(
      "0xeb801ab73e9a2a482aa48caca13b1954028f4c94",
      "0x9e1126c51c319A1d31d928DC498c9988C094e793",
      boosterAdd,
      0
    ),
    "add gauge pYEARNUSDCV2"
  );

  logTransaction(
    await poolManager.addPool(
      "0x4ffe73cf2eef5e8c8e0e10160bce440a029166d2",
      "0x2040c856d53d5CbB111c81D5A85ccc10829c5783",
      boosterAdd,
      0
    ),
    "add gauge pYEARNCRVLUSD"
  );

  logTransaction(
    await poolManager.addPool(
      "0x729c6248f9b1ce62b3d5e31d4ee7ee95cab32dfd",
      "0xCAbdCB680fC0E477bbB0aC77b2a278cA54D0E6Ff",
      boosterAdd,
      0
    ),
    "add gauge pYearn FRAX/3CRV"
  );

  logTransaction(
    await poolManager.addPool(
      "0xdcfae44244b3fabb5b351b01dc9f050e589cf24f",
      "0x62E558CDA4619e31AF8C84Cd8F345fA474aFe1b9",
      boosterAdd,
      0
    ),
    "add gauge pSlpCvxEth"
  );
  logTransaction(
    await poolManager.addPool(
      "0x65b2532474f717d5a8ba38078b78106d56118bbb",
      "0xA7BC844a76e727Ec5250f3849148c21F4b43CeEA",
      boosterAdd,
      0
    ),
    "add gauge pLQTY"
  );

  logTransaction(
    await poolManager.addPool(
      "0xe6487033f5c8e2b4726af54ca1449fec18bd1484",
      "0x08cb0A0ba8e4f143e4e6F7BED65E02b6dFb9A16C",
      boosterAdd,
      0
    ),
    "add gauge pSADDLED4"
  );

  logTransaction(
    await poolManager.addPool(
      "0xdb84a6a48881545e8595218b7a2a3c9bd28498ae",
      "0xF7eECA3C5B0A01D051690E0cF082AE5006c7e073",
      boosterAdd,
      0
    ),
    "add gauge pABRASPELLETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xeb8174f94fdaccb099422d9a816b8e17d5e393e3",
      "0x58675Af6001e8785e69CE82746a74a37f824EBAE",
      boosterAdd,
      0
    ),
    "add gauge pUNIFOXETH"
  );
  logTransaction(
    await poolManager.addPool(
      "0x1d92e1702d7054f74eac3a9569aeb87fc93e101d",
      "0x9FEC5e5d75274f8CFa4261f8E97138920e142470",
      boosterAdd,
      0
    ),
    "add gauge pSUSHITRUETH"
  );
  logTransaction(
    await poolManager.addPool(
      "0xbc57294fc20bd23983db598fa6b3f306aa1a414f",
      "0x5E50640dCdd1E83fEAc729321bacB52525df1Cd2",
      boosterAdd,
      0
    ),
    "add gauge pSUSHITRUETH"
  );
  logTransaction(
    await poolManager.addPool(
      "0x4e9806345fb39ffebd70a01f177a675805019ba8",
      "0x87B54048B60689EE81F48F8797e7FCF64fBf081b",
      boosterAdd,
      0
    ),
    "add gauge pYEARNCRVIB"
  );

  logTransaction(
    await poolManager.addPool(
      "0x0989a227e7c50311f7de61e5e61f7c28df8936f0",
      "0x1a6e44981B4144261932E460d30C9342e961f5D9",
      boosterAdd,
      0
    ),
    "add gauge pUNIRLYETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xf1478a8387c449c55708a3ec11c143c35daf5e74",
      "0xDAADDdc2Cb94a132A1FC0D6E9999A91639294Aa7",
      boosterAdd,
      0
    ),
    "add gauge pCURVECVXCRV"
  );
  logTransaction(
    await poolManager.addPool(
      "0x1c5dbb5d9864738e84c126782460c18828859648",
      "0x4801154c499C37cFb524cdb617995331fF618c4E",
      boosterAdd,
      0
    ),
    "add gauge pCurve CRV/ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0xc97f3fd224d90609831a2b74b46642ac43afe5ee",
      "0x941c42350239B463B80795Fb78Be7817659B8bd0",
      boosterAdd,
      0
    ),
    "add gauge pCvxCvxEth"
  );
  logTransaction(
    await poolManager.addPool(
      "0x69cc22b240bdcdf4a33c7b3d04a660d4cf714370",
      "0xb5fE3204aABe02475d5B9d3C52820f2169002124",
      boosterAdd,
      0
    ),
    "add gauge pUniLooksEth"
  );
  logTransaction(
    await poolManager.addPool(
      "0xb4ebc2c371182deea04b2264b9ff5ac4f0159c69",
      "0x06A566E7812413bc66215b48D6F26321Ddf653A9",
      boosterAdd,
      0
    ),
    "add gauge pLooks"
  );

  logTransaction(
    await poolManager.addPool(
      "0x5da34d322a4b29488e711419fea36da0d0114d5c",
      "0x6667c53D631410649B1826D21cFdf41E7a7aE6b1",
      boosterAdd,
      0
    ),
    "add gauge pCurve FXS/CVXFXS"
  );

  logTransaction(
    await poolManager.addPool(
      "0xe7b69a17b3531d01fcead66faf7d9f7655469267",
      "0xA50e005c3f2f3Cd1f56B09DF558816CfCe25E934",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 FRAX/DAI"
  );
  logTransaction(
    await poolManager.addPool(
      "0x8ca1d047541fe183ae7b5d80766ec6d5ceeb942a",
      "0x162cEC141E6703d08B4844C9246e7AA56726E8C6",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 USDC/ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x0a3a5764945e29e38408637bc659981f0172b961",
      "0xcfCc3f6fd9f627D5ebBbd9E9B639B35F35a62ecf",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 LOOKS/ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x563c77b40c7f08ba735426393cf5f0e527d16c10",
      "0xFE7A1dAd74f1CBeE137353D52b4A42936C54e28C",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 USDC/USDT"
  );

  logTransaction(
    await poolManager.addPool(
      "0xaacdaaad9a9425be2d666d08f741be4f081c7ab1",
      "0xcB405E52b8cB9276D5Cd01D6b5F7135f53c5535D",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 WBTC/ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x575a9e386c33732880def8be1bad9dbc5dddf7d7",
      "0xc0a78102caA4Ed3b64bB39DFC935D744E940d67A",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 PICKLE/ETH"
  );

  logTransaction(
    await poolManager.addPool(
      "0x7f3514cbc6825410ca3fa4dea41d46964a953afb",
      "0x6092cdE5762FA9F5c8D081fb0c5eD23601f0F400",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 FRAX/USDC"
  );

  logTransaction(
    await poolManager.addPool(
      "0xf0fb82757b9f8a3a3ae3524e385e2e9039633948",
      "0xBb813D44f8B5a4E033Bdc126A9fF2800B7037230",
      boosterAdd,
      0
    ),
    "add gauge pUNIv3 COW/ETH"
  );

  // funcd account[0] with lp token p3CRV
  const p3crv = await IERC20.at("0x1bb74b5ddc1f4fc91d6f9e7906cf68bc93538e33");
  logTransaction(
    await p3crv.transfer(accounts[0], web3.utils.toWei("500"), { from: "0x1fe5F397e38fFe61E663d96821F41bCF83ed7959" }),
    "funcd account[0] with lp token p3CRV"
  );
};
