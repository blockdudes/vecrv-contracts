// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Interfaces/IPools.sol";
import "./Interfaces/IRegistry.sol";

contract PoolManager {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public gaugeProxy;
    address public operator;
    address public pools;

    constructor(address _pools, address _gaugeProxy) {
        operator = msg.sender;
        pools = _pools;
        _gaugeProxy = gaugeProxy;
    }

    function setOperator(address _operator) external {
        require(msg.sender == operator, "!auth");
        operator = _operator;
    }

    //revert control of adding  pools back to operator
    function revertControl() external {
        require(msg.sender == operator, "!auth");
        IPools(pools).setPoolManager(operator);
    }

    //add a new pickle pool to the system.
    //gauge must be on pickle's gaugeProxy, thus anyone can call
    function addPool(address _lptoken) external returns (bool) {
        require(_lptoken != address(0), "lptoken is 0");

        //get  gauge by lp token from gauge proxy
        address _gauge = IRegistry(gaugeProxy).getGauge(_lptoken);
        require(_gauge != address(0), "gauge is 0");

        bool gaugeExists = IPools(pools).gaugeMap(_gauge);
        require(!gaugeExists, "already registered");

        IPools(pools).addPool(_lptoken, _gauge);

        return true;
    }

    function shutdownPool(uint256 _pid) external returns (bool) {
        require(msg.sender == operator, "!auth");

        IPools(pools).shutdownPool(_pid);
        return true;
    }
}
