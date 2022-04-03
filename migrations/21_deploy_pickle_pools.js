const { getContract } = require("./helper/addContracts");
const { logTransaction } = require("./helper/logger.js");

const PoolManager = artifacts.require("PoolManager");

module.exports = async function (deployer, network, accounts) {
  const contractList = getContract();

  const poolManager = await PoolManager.at(contractList.system.poolManager);
  const boosterAdd = contractList.system.pickleBooster;

  logTransaction(
    await poolManager.addPool("0xdc98556ce24f007a5ef6dc1ce96322d65832a819", boosterAdd, 0),
    "add gauge PICKLE/ETH LP"
  );

  logTransaction(
    await poolManager.addPool("0x5eff6d166d66bacbc1bf52e2c54dd391ae6b1f48", boosterAdd, 0),
    "add gauge pSUSHIYVECRV"
  );

  logTransaction(
    await poolManager.addPool("0x1bb74b5ddc1f4fc91d6f9e7906cf68bc93538e33", boosterAdd, 0),
    "add gauge p3CRV"
  );

  logTransaction(
    await poolManager.addPool("0x55282da27a3a02ffe599f6d11314d239dac89135", boosterAdd, 0),
    "add gauge pSLPDAI"
  );
  logTransaction(
    await poolManager.addPool("0x8c2d16b7f6d3f989eb4878ecf13d695a7d504e43", boosterAdd, 0),
    "add gauge pSLPUSDC"
  );

  logTransaction(
    await poolManager.addPool("0xa7a37ae5cb163a3147de83f15e15d8e5f94d6bce", boosterAdd, 0),
    "add gauge pSLPUSDT"
  );

  logTransaction(
    await poolManager.addPool("0xde74b6c547bd574c3527316a2ee30cd8f6041525", boosterAdd, 0),
    "add gauge pSLPWBTC"
  );

  logTransaction(
    await poolManager.addPool("0x3261D9408604CC8607b687980D40135aFA26FfED", boosterAdd, 0),
    "add gauge pSLPYFI"
  );

  logTransaction(
    await poolManager.addPool("0x77c8a58d940a322aea02dbc8ee4a30350d4239ad", boosterAdd, 0),
    "add gauge pstETHCRV"
  );

  logTransaction(
    await poolManager.addPool("0x3bcd97dca7b1ced292687c97702725f37af01cac", boosterAdd, 0),
    "add gauge pUNIMIRUST"
  );

  logTransaction(
    await poolManager.addPool("0x2350fc7268f3f5a6cc31f26c38f706e41547505d", boosterAdd, 0),
    "add gauge pUNIBACDAI"
  );

  logTransaction(
    await poolManager.addPool("0x748712686a78737da0b7643df78fdf2778dc5944", boosterAdd, 0),
    "add gauge pUNIBASV2DAI"
  );

  logTransaction(
    await poolManager.addPool("0xafb2fe266c215b5aae9c4a9dadc325cc7a497230", boosterAdd, 0),
    "add gauge pUNImTSLAUST"
  );

  logTransaction(
    await poolManager.addPool("0xf303b35d5bcb4d9ed20fb122f5e268211dec0ebd", boosterAdd, 0),
    "add gauge pUNImAAPLUST"
  );
  logTransaction(
    await poolManager.addPool("0x7c8de3ee2244207a54b57f45286c9ee1465fee9f", boosterAdd, 0),
    "add gauge pUNImQQQUST"
  );

  logTransaction(
    await poolManager.addPool("0x1ed1fd33b62bea268e527a622108fe0ee0104c07", boosterAdd, 0),
    "add gauge pUNImSLVUST"
  );

  logTransaction(
    await poolManager.addPool("0x1cf137f651d8f0a4009ded168b442ea2e870323a", boosterAdd, 0),
    "add gauge pUNImBABAUST"
  );
  logTransaction(
    await poolManager.addPool("0xecb520217dccc712448338b0bb9b08ce75ad61ae", boosterAdd, 0),
    "add gauge pSUSHIETH"
  );

  logTransaction(
    await poolManager.addPool("0xc1513c1b0b359bc5acf7b772100061217838768b", boosterAdd, 0),
    "add gauge pUNIFEITRIBE"
  );

  logTransaction(
    await poolManager.addPool("0xced67a187b923f0e5ebcc77c7f2f7da20099e378", boosterAdd, 0),
    "add gauge pSUSHIYVBOOST"
  );

  logTransaction(
    await poolManager.addPool("0x927e3bcbd329e89a8765b52950861482f0b227c4", boosterAdd, 0),
    "add gauge pUNILUSDETH"
  );

  logTransaction(
    await poolManager.addPool("0x9eb0aad5bb943d3b2f7603deb772faa35f60adf9", boosterAdd, 0),
    "add gauge pSUSHIALCX"
  );
  logTransaction(
    await poolManager.addPool("0xeb801ab73e9a2a482aa48caca13b1954028f4c94", boosterAdd, 0),
    "add gauge pYEARNUSDCV2"
  );

  logTransaction(
    await poolManager.addPool("0x4ffe73cf2eef5e8c8e0e10160bce440a029166d2", boosterAdd, 0),
    "add gauge pYEARNCRVLUSD"
  );

  logTransaction(
    await poolManager.addPool("0xdcfae44244b3fabb5b351b01dc9f050e589cf24f", boosterAdd, 0),
    "add gauge pSlpCvxEth"
  );
  logTransaction(
    await poolManager.addPool("0x65b2532474f717d5a8ba38078b78106d56118bbb", boosterAdd, 0),
    "add gauge pLQTY"
  );

  logTransaction(
    await poolManager.addPool("0xe6487033f5c8e2b4726af54ca1449fec18bd1484", boosterAdd, 0),
    "add gauge pSADDLED4"
  );
  logTransaction(
    await poolManager.addPool("0x993f35FaF4AEA39e1dfF28f45098429E0c87126C", boosterAdd, 0),
    "add gauge pABRAMIMETH"
  );

  logTransaction(
    await poolManager.addPool("0xdb84a6a48881545e8595218b7a2a3c9bd28498ae", boosterAdd, 0),
    "add gauge pABRASPELLETH"
  );
  logTransaction(
    await poolManager.addPool("0x1Bf62aCb8603Ef7F3A0DFAF79b25202fe1FAEE06", boosterAdd, 0),
    "add gauge pABRAMIM3CRV"
  );
  logTransaction(
    await poolManager.addPool("0xeb8174f94fdaccb099422d9a816b8e17d5e393e3", boosterAdd, 0),
    "add gauge pUNIFOXETH"
  );
  logTransaction(
    await poolManager.addPool("0x1d92e1702d7054f74eac3a9569aeb87fc93e101d", boosterAdd, 0),
    "add gauge pSUSHITRUETH"
  );
  logTransaction(
    await poolManager.addPool("0x4e9806345fb39ffebd70a01f177a675805019ba8", boosterAdd, 0),
    "add gauge pYEARNCRVIB"
  );

  logTransaction(
    await poolManager.addPool("0x0989a227e7c50311f7de61e5e61f7c28df8936f0", boosterAdd, 0),
    "add gauge pUNIRLYETH"
  );

  logTransaction(
    await poolManager.addPool("0xf1478a8387c449c55708a3ec11c143c35daf5e74", boosterAdd, 0),
    "add gauge pCURVECVXCRV"
  );
  logTransaction(
    await poolManager.addPool("0xB245280Fd1795f5068DEf8E8f32DB7846b030b2B", boosterAdd, 0),
    "add gauge pCvxCrv"
  );
  logTransaction(
    await poolManager.addPool("0x506748d736b77f51c5b490e4ac6c26b8c3975b14", boosterAdd, 0),
    "add gauge pUNIRBNETH"
  );
  logTransaction(
    await poolManager.addPool("0xc97f3fd224d90609831a2b74b46642ac43afe5ee", boosterAdd, 0),
    "add gauge pCvxCvxEth"
  );
  logTransaction(
    await poolManager.addPool("0x69cc22b240bdcdf4a33c7b3d04a660d4cf714370", boosterAdd, 0),
    "add gauge pUniLooksEth"
  );
  logTransaction(
    await poolManager.addPool("0xb4ebc2c371182deea04b2264b9ff5ac4f0159c69", boosterAdd, 0),
    "add gauge pLooks"
  );
};
