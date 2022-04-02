/**
 *Submitted for verification at Etherscan.io on 2021-09-25
 */

// File contracts/libraries/SafeMath.sol

// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLS ======== */

    address public immutable payoutToken;

    mapping(address => bool) public bondContract;
    mapping(address => uint256) public bondMaxSupply;
    mapping(address => uint256) public bondTotalSupply;

    /* ======== EVENTS ======== */

    event BondContractToggled(address bondContract, bool approved);
    event Withdraw(address token, address destination, uint256 amount);

    /* ======== CONSTRUCTOR ======== */

    constructor(address _payoutToken) {
        require(_payoutToken != address(0));
        payoutToken = _payoutToken;
    }

    /* ======== BOND CONTRACT FUNCTION ======== */

    /**
     *  @notice deposit principle token and recieve back payout token
     *  @param _principleTokenAddress address
     *  @param _amountPrincipleToken uint
     *  @param _amountPayoutToken uint
     */
    function deposit(
        address _principleTokenAddress,
        uint256 _amountPrincipleToken,
        uint256 _amountPayoutToken
    ) external {
        address _sender = msg.sender;
        require(bondContract[_sender], "msg.sender is not a bond contract");

        uint256 amtTillMax = bondMaxSupply[_sender].sub(bondTotalSupply[_sender]);
        require(amtTillMax >= _amountPayoutToken, "Insufficent token balance");

        IERC20(_principleTokenAddress).safeTransferFrom(
            _sender,
            address(this),
            _amountPrincipleToken
        );
        IERC20(payoutToken).safeTransfer(_sender, _amountPayoutToken);

        bondTotalSupply[_sender] += _amountPayoutToken;
    }

    /* ======== VIEW FUNCTION ======== */

    /**
     *   @notice returns payout token valuation of priciple
     *   @param _principleTokenAddress address
     *   @param _amount uint
     *   @return value_ uint
     */
    function valueOfToken(address _principleTokenAddress, uint256 _amount)
        public
        view
        returns (uint256 value_)
    {
        // convert amount to match payout token decimals
        value_ = _amount.mul(10**ERC20(payoutToken).decimals()).div(
            10**ERC20(_principleTokenAddress).decimals()
        );
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice policy can withdraw ERC20 token to desired address
     *  @param _token uint
     *  @param _destination address
     *  @param _amount uint
     */
    function withdraw(
        address _token,
        address _destination,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).safeTransfer(_destination, _amount);

        emit Withdraw(_token, _destination, _amount);
    }

    /**
        @notice toggle bond contract
        @param _bondContract address
     */
    function toggleBondContract(address _bondContract) external onlyOwner {
        bondContract[_bondContract] = !bondContract[_bondContract];
        emit BondContractToggled(_bondContract, bondContract[_bondContract]);
    }

    function updateBondMaxSupply(address _bond, uint256 _newMaxSupply) external onlyOwner {
        require(bondContract[_bond], "address is not a bond contract");
        require(_newMaxSupply >= bondTotalSupply[_bond], "Invalid new supply");
        bondMaxSupply[_bond] = _newMaxSupply;
    }
}
