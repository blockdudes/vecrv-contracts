// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Interfaces/IGauge.sol";
import "./Interfaces/IVoteEscrow.sol";
import "./Interfaces/IDeposit.sol";
import "./Interfaces/IFeeDistro.sol";
import "./Interfaces/IVoting.sol";
import "./Interfaces/ITokenMinter.sol";

contract VoterProxy {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public immutable veAsset;
    address public immutable escrow;
    address public immutable gaugeProxy;
    address public immutable curveMinter;

    address public owner;
    address public operator;
    address public depositor;
    string public name;
    IVoteEscrow.EscrowModle public escrowModle;

    mapping(address => bool) private protectedTokens;

    constructor(
        string memory _nanme,
        address _veAsset,
        address _escrow,
        address _gaugeProxy,
        address _curveMinter,
        IVoteEscrow.EscrowModle _escrowModle
    ) {
        name = _nanme;
        veAsset = _veAsset;
        escrow = _escrow;
        gaugeProxy = _gaugeProxy;
        owner = msg.sender;
        curveMinter = _curveMinter;
        escrowModle = _escrowModle;
    }

    function getName() external view returns (string memory) {
        return name;
    }

    function setOwner(address _owner) external {
        require(msg.sender == owner, "!auth");
        owner = _owner;
    }

    function setOperator(address _operator) external {
        require(msg.sender == owner, "!auth");
        require(
            operator == address(0) || IDeposit(operator).isShutdown() == true,
            "needs shutdown"
        );

        operator = _operator;
    }

    function setDepositor(address _depositor) external {
        require(msg.sender == owner, "!auth");

        depositor = _depositor;
    }

    function deposit(address _token, address _gauge) external returns (bool) {
        require(msg.sender == operator, "!auth");
        if (protectedTokens[_token] == false) {
            protectedTokens[_token] = true;
        }
        if (protectedTokens[_gauge] == false) {
            protectedTokens[_gauge] = true;
        }
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(_token).safeApprove(_gauge, 0);
            IERC20(_token).safeApprove(_gauge, balance);
            IGauge(_gauge).deposit(balance);
        }
        return true;
    }

    // Withdraw partial funds
    function withdraw(
        address _token,
        address _gauge,
        uint256 _amount
    ) public returns (bool) {
        require(msg.sender == operator, "!auth");
        uint256 _balance = IERC20(_token).balanceOf(address(this));
        if (_balance < _amount) {
            _amount = _withdrawSome(_gauge, _amount.sub(_balance));
            _amount = _amount.add(_balance);
        }
        IERC20(_token).safeTransfer(msg.sender, _amount);
        return true;
    }

    function withdrawAll(address _token, address _gauge) external returns (bool) {
        require(msg.sender == operator, "!auth");
        uint256 amount = balanceOfPool(_gauge).add(IERC20(_token).balanceOf(address(this)));
        withdraw(_token, _gauge, amount);
        return true;
    }

    function _withdrawSome(address _gauge, uint256 _amount) internal returns (uint256) {
        IGauge(_gauge).withdraw(_amount);
        return _amount;
    }

    function createLock(uint256 _value, uint256 _unlockTime) external returns (bool) {
        require(msg.sender == depositor, "!auth");
        IERC20(veAsset).safeApprove(escrow, 0);
        IERC20(veAsset).safeApprove(escrow, _value);
        IVoteEscrow(escrow).create_lock(_value, _unlockTime);
        return true;
    }

    function increaseAmount(uint256 _value) external returns (bool) {
        require(msg.sender == depositor, "!auth");
        IERC20(veAsset).safeApprove(escrow, 0);
        IERC20(veAsset).safeApprove(escrow, _value);
        IVoteEscrow(escrow).increase_amount(_value);
        return true;
    }

    function increaseTime(uint256 _value) external returns (bool) {
        require(msg.sender == depositor, "!auth");
        IVoteEscrow(escrow).increase_unlock_time(_value);
        return true;
    }

    function release() external returns (bool) {
        require(msg.sender == depositor, "!auth");
        IVoteEscrow(escrow).withdraw();
        return true;
    }

    function vote(
        uint256 _voteId,
        address _votingAddress,
        bool _support
    ) external returns (bool) {
        require(msg.sender == operator, "!auth");
        IVoting(_votingAddress).vote(_voteId, _support, false);
        return true;
    }

    function voteGaugeWeight(address _tokenVote, uint256 _weight) external returns (bool) {
        require(msg.sender == operator, "!auth");

        if (escrowModle == IVoteEscrow.EscrowModle.CURVE) {
            IVoting(gaugeProxy).vote_for_gauge_weights(_tokenVote, _weight);
        } else {
            //vote
            IVoting(gaugeProxy).vote(_tokenVote, _weight);
        }
        return true;
    }

    function claimveAsset(address _gauge) external returns (uint256) {
        require(msg.sender == operator, "!auth");

        uint256 _balance = 0;

        if (escrowModle == IVoteEscrow.EscrowModle.CURVE) {
            try ITokenMinter(curveMinter).mint(_gauge) {} catch {
                return _balance;
            }
        } else {
            try IGauge(_gauge).getReward() {} catch {
                return _balance;
            }
        }

        _balance = IERC20(veAsset).balanceOf(address(this));
        IERC20(veAsset).safeTransfer(operator, _balance);

        return _balance;
    }

    function claimFees(address _distroContract, address _token) external returns (uint256) {
        require(msg.sender == operator, "!auth");
        IFeeDistro(_distroContract).claim();
        uint256 _balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(operator, _balance);
        return _balance;
    }

    function balanceOfPool(address _gauge) public view returns (uint256) {
        return IGauge(_gauge).balanceOf(address(this));
    }
}
