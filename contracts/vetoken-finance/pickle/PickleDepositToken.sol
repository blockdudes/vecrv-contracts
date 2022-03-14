// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../Interfaces/Interfaces.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PickleDepositToken is ERC20 {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public operator;

    constructor(address _operator, address _lptoken)
        ERC20(
            string(abi.encodePacked(ERC20(_lptoken).name(), " veToken Deposit")),
            string(abi.encodePacked("VE3D", ERC20(_lptoken).symbol()))
        )
    {
        operator = _operator;
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == operator, "!authorized");

        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external {
        require(msg.sender == operator, "!authorized");

        _burn(_from, _amount);
    }
}
