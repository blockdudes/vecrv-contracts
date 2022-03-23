// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./Interfaces/IPools.sol";
import "./Interfaces/IRegistry.sol";

contract PoolManager {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // pools => gaugeProxy
    mapping(address => address) public gaugeProxies;
    address public operator;

    constructor() public {
        operator = msg.sender;
    }

    function setOperator(address _operator) external {
        require(msg.sender == operator, "!auth");
        operator = _operator;
    }

    function addBooster(address pools, address gaugeProxy) public {
        require(msg.sender == operator, "!auth");

        gaugeProxies[pools] = gaugeProxy;
    }

    function removeBooster(address pools) public {
        require(msg.sender == operator, "!auth");

        gaugeProxies[pools] = address(0);
    }

    //revert control of adding  pools back to operator
    function revertControl(address pools) external {
        require(msg.sender == operator, "!auth");
        IPools(pools).setPoolManager(operator);
    }

    ///TODO this function need to customize for curve
    //add a new veAsset pool to the system.
    //gauge must be on veAsset's gaugeProxy, thus anyone can call
    function addPool(address _lptoken, address _pools) external returns (bool) {
        require(_lptoken != address(0), "lptoken is 0");

        //get  gauge by lp token from gauge proxy
        address _gauge = IRegistry(gaugeProxies[_pools]).getGauge(_lptoken);
        require(_gauge != address(0), "gauge is 0");

        bool gaugeExists = IPools(_pools).gaugeMap(_gauge);
        require(!gaugeExists, "already registered");

        IPools(_pools).addPool(_lptoken, _gauge);

        return true;
    }

    function shutdownPool(address _pools, uint256 _pid) external returns (bool) {
        require(msg.sender == operator, "!auth");

        IPools(_pools).shutdownPool(_pid);
        return true;
    }
}
