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

import "../Interfaces/ITreasury.sol";
import "../Interfaces/IRewards.sol";
import "../helper/FixedPoint.sol";

contract VeTokenBond is Ownable {
    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== EVENTS ======== */

    event BondCreated(uint256 deposit, uint256 payout, uint256 expires);
    event BondRedeemed(address recipient, uint256 payout, uint256 remaining);
    event BondPriceChanged(uint256 internalPrice, uint256 debtRatio);
    event ControlVariableAdjustment(
        uint256 initialBCV,
        uint256 newBCV,
        uint256 adjustment,
        bool addition
    );

    /* ======== STATE VARIABLES ======== */

    ERC20 immutable payoutToken; // token paid for principal
    IERC20 immutable principalToken; // inflow token
    ITreasury immutable customTreasury; // pays for and receives principal
    address immutable vetokenDAO;
    address vetokenTreasury; // receives fee

    address public staking; // to auto-stake payout
    bool public autoStake;

    uint256 public totalPrincipalBonded;
    uint256 public totalPayoutGiven;

    Terms public terms; // stores terms for new bonds
    Adjust public adjustment; // stores adjustment to BCV data
    FeeTiers[] private feeTiers; // stores fee tiers

    mapping(address => Bond) public bondInfo; // stores bond information for depositors

    uint256 public totalDebt; // total value of outstanding bonds; used for pricing
    uint256 public lastDecay; // reference block for debt decay

    // address immutable subsidyRouter; // pays subsidy in Vetoken to custom treasury
    // uint256 payoutSinceLastSubsidy; // principal accrued since subsidy paid

    /* ======== STRUCTS ======== */

    struct FeeTiers {
        uint256 tierCeilings; // principal bonded till next tier
        uint256 fees; // in ten-thousandths (i.e. 33300 = 3.33%)
    }

    // Info for creating new bonds
    struct Terms {
        uint256 controlVariable; // scaling variable for price
        uint256 vestingTerm; // in blocks
        uint256 minimumPrice; // vs principal value
        uint256 maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint256 maxDebt; // payout token decimal debt ratio, max % total supply created as debt
    }

    // Info for bond holder
    struct Bond {
        uint256 payout; // payout token remaining to be paid
        uint256 vesting; // Blocks left to vest
        uint256 lastBlock; // Last interaction
        uint256 truePricePaid; // Price paid (principal tokens per payout token) in ten-millionths - 4000000 = 0.4
    }

    // Info for incremental adjustments to control variable
    struct Adjust {
        bool add; // addition or subtraction
        uint256 rate; // increment
        uint256 target; // BCV when adjustment finished
        uint256 buffer; // minimum length (in blocks) between adjustments
        uint256 lastBlock; // block when last adjustment made
    }

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _customTreasury,
        address _payoutToken,
        address _principalToken,
        address _vetokenTreasury,
        //address _subsidyRouter,
        address _initialOwner,
        address _vetokenDAO,
        uint256[] memory _tierCeilings,
        uint256[] memory _fees
    ) {
        require(_customTreasury != address(0));
        customTreasury = ITreasury(_customTreasury);
        require(_payoutToken != address(0));
        payoutToken = ERC20(_payoutToken);
        require(_principalToken != address(0));
        principalToken = IERC20(_principalToken);
        require(_vetokenTreasury != address(0));
        vetokenTreasury = _vetokenTreasury;
        // require(_subsidyRouter != address(0));
        // subsidyRouter = _subsidyRouter;
        require(_vetokenDAO != address(0));
        vetokenDAO = _vetokenDAO;
        require(_initialOwner != address(0));
        _transferOwnership(_initialOwner);

        require(_tierCeilings.length == _fees.length, "tier length and fee length not the same");

        for (uint256 i; i < _tierCeilings.length; i++) {
            feeTiers.push(FeeTiers({tierCeilings: _tierCeilings[i], fees: _fees[i]}));
        }
    }

    /* ======== INITIALIZATION ======== */

    /**
     *  @notice initializes bond parameters
     *  @param _controlVariable uint
     *  @param _vestingTerm uint
     *  @param _minimumPrice uint
     *  @param _maxPayout uint
     *  @param _maxDebt uint
     *  @param _initialDebt uint
     */
    function initializeBond(
        uint256 _controlVariable,
        uint256 _vestingTerm,
        uint256 _minimumPrice,
        uint256 _maxPayout,
        uint256 _maxDebt,
        uint256 _initialDebt
    ) external onlyOwner {
        require(currentDebt() == 0, "Debt must be 0 for initialization");
        terms = Terms({
            controlVariable: _controlVariable,
            vestingTerm: _vestingTerm,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            maxDebt: _maxDebt
        });
        totalDebt = _initialDebt;
        lastDecay = block.number;
    }

    /* ======== POLICY FUNCTIONS ======== */

    enum PARAMETER {
        VESTING,
        PAYOUT,
        DEBT
    }

    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint
     */
    function setBondTerms(PARAMETER _parameter, uint256 _input) external onlyOwner {
        if (_parameter == PARAMETER.VESTING) {
            // 0
            require(_input >= 10000, "Vesting must be longer than 36 hours");
            terms.vestingTerm = _input;
        } else if (_parameter == PARAMETER.PAYOUT) {
            // 1
            require(_input <= 1000, "Payout cannot be above 1 percent");
            terms.maxPayout = _input;
        } else if (_parameter == PARAMETER.DEBT) {
            // 2
            terms.maxDebt = _input;
        }
    }

    /**
     *  @notice set control variable adjustment
     *  @param _addition bool
     *  @param _increment uint
     *  @param _target uint
     *  @param _buffer uint
     */
    function setAdjustment(
        bool _addition,
        uint256 _increment,
        uint256 _target,
        uint256 _buffer
    ) external onlyOwner {
        require(_increment <= terms.controlVariable.mul(30).div(1000), "Increment too large");

        adjustment = Adjust({
            add: _addition,
            rate: _increment,
            target: _target,
            buffer: _buffer,
            lastBlock: block.number
        });
    }

    /**
     *  @notice set contract for auto stake
     *  @param _staking address
     */
    function setStaking(address _staking, bool _autoStake) external onlyOwner {
        require(_staking != address(0));

        staking = _staking;
        autoStake = _autoStake;
    }

    /**
     *  @notice change address of Vetoken Treasury
     *  @param _vetokenTreasury uint
     */
    function changeVetokenTreasury(address _vetokenTreasury) external {
        require(msg.sender == vetokenDAO, "Only Vetoken DAO");
        vetokenTreasury = _vetokenTreasury;
    }

    /**
     *  @notice subsidy controller checks payouts since last subsidy and resets counter
     *  @return payoutSinceLastSubsidy_ uint
     */
    // function paySubsidy() external returns (uint256 payoutSinceLastSubsidy_) {
    //     require(msg.sender == subsidyRouter, "Only subsidy controller");

    //     payoutSinceLastSubsidy_ = payoutSinceLastSubsidy;
    //     payoutSinceLastSubsidy = 0;
    // }

    /* ======== USER FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _maxPrice uint
     *  @param _depositor address
     *  @return uint
     */
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor
    ) external returns (uint256) {
        require(_depositor != address(0), "Invalid address");

        decayDebt();
        require(totalDebt <= terms.maxDebt, "Max capacity reached");

        uint256 nativePrice = trueBondPrice();

        require(_maxPrice >= nativePrice, "Slippage limit: more than max price"); // slippage protection

        uint256 value = customTreasury.valueOfToken(address(principalToken), _amount);
        uint256 payout = _payoutFor(value); // payout to bonder is computed

        require(payout >= 10**payoutToken.decimals() / 100, "Bond too small"); // must be > 0.01 payout token ( underflow protection )
        require(payout <= maxPayout(), "Bond too large"); // size protection because there is no slippage

        // profits are calculated
        uint256 fee = payout.mul(currentVetokenFee()).div(1e6);

        /**
            principal is transferred in
            approved and
            deposited into the treasury, returning (_amount - profit) payout token
         */
        principalToken.safeTransferFrom(msg.sender, address(this), _amount);
        principalToken.approve(address(customTreasury), _amount);
        customTreasury.deposit(address(principalToken), _amount, payout);

        if (fee != 0) {
            // fee is transferred to dao
            payoutToken.transfer(vetokenTreasury, fee);
        }

        // total debt is increased
        totalDebt = totalDebt.add(value);

        // depositor info is stored
        bondInfo[_depositor] = Bond({
            payout: bondInfo[_depositor].payout.add(payout.sub(fee)),
            vesting: terms.vestingTerm,
            lastBlock: block.number,
            truePricePaid: trueBondPrice()
        });

        // indexed events are emitted
        emit BondCreated(_amount, payout, block.number.add(terms.vestingTerm));
        emit BondPriceChanged(_bondPrice(), debtRatio());

        totalPrincipalBonded = totalPrincipalBonded.add(_amount); // total bonded increased
        totalPayoutGiven = totalPayoutGiven.add(payout); // total payout increased
        //payoutSinceLastSubsidy = payoutSinceLastSubsidy.add(payout); // subsidy counter increased

        adjust(); // control variable is adjusted
        return payout;
    }

    /**
     *  @notice redeem bond for user
     *  @param _depositor address
     *  @param _stake bool
     *  @return uint
     */
    function redeem(address _depositor, bool _stake) external returns (uint256) {
        Bond memory info = bondInfo[_depositor];
        uint256 percentVested = percentVestedFor(_depositor); // (blocks since last interaction / vesting term remaining)

        if (autoStake) {
            _stake = true;
        }

        if (percentVested >= 10000) {
            // if fully vested
            delete bondInfo[_depositor]; // delete user info
            emit BondRedeemed(_depositor, info.payout, 0); // emit bond data
            return stakeOrSend(_depositor, _stake, info.payout); // pay user everything due
        } else {
            // if unfinished
            // calculate payout vested
            uint256 payout = info.payout.mul(percentVested).div(10000);

            // store updated deposit info
            bondInfo[_depositor] = Bond({
                payout: info.payout.sub(payout),
                vesting: info.vesting.sub(block.number.sub(info.lastBlock)),
                lastBlock: block.number,
                truePricePaid: info.truePricePaid
            });

            emit BondRedeemed(_depositor, payout, bondInfo[_depositor].payout);
            return stakeOrSend(_depositor, _stake, info.payout); // pay user everything due
        }
    }

    /* ======== INTERNAL HELPER FUNCTIONS ======== */

    /**
     *  @notice allow user to stake payout automatically
     *  @param _stake bool
     *  @param _amount uint
     *  @return uint
     */
    function stakeOrSend(
        address _recipient,
        bool _stake,
        uint256 _amount
    ) internal returns (uint256) {
        if (!_stake) {
            // if user does not want to stake
            payoutToken.transfer(_recipient, _amount); // send payout
        } else {
            // if user wants to stake
            payoutToken.approve(staking, _amount);
            IRewards(staking).stakeFor(_recipient, _amount);
        }
        return _amount;
    }

    /**
     *  @notice makes incremental adjustment to control variable
     */
    function adjust() internal {
        uint256 blockCanAdjust = adjustment.lastBlock.add(adjustment.buffer);
        if (adjustment.rate != 0 && block.number >= blockCanAdjust) {
            uint256 initial = terms.controlVariable;
            if (adjustment.add) {
                terms.controlVariable = terms.controlVariable.add(adjustment.rate);
                if (terms.controlVariable >= adjustment.target) {
                    adjustment.rate = 0;
                }
            } else {
                terms.controlVariable = terms.controlVariable.sub(adjustment.rate);
                if (terms.controlVariable <= adjustment.target) {
                    adjustment.rate = 0;
                }
            }
            adjustment.lastBlock = block.number;
            emit ControlVariableAdjustment(
                initial,
                terms.controlVariable,
                adjustment.rate,
                adjustment.add
            );
        }
    }

    /**
     *  @notice reduce total debt
     */
    function decayDebt() internal {
        totalDebt = totalDebt.sub(debtDecay());
        lastDecay = block.number;
    }

    /**
     *  @notice calculate current bond price and remove floor if above
     *  @return price_ uint
     */
    function _bondPrice() internal returns (uint256 price_) {
        price_ = terms.controlVariable.mul(debtRatio()).div(
            10**(uint256(payoutToken.decimals()).sub(5))
        );
        if (price_ < terms.minimumPrice) {
            price_ = terms.minimumPrice;
        } else if (terms.minimumPrice != 0) {
            terms.minimumPrice = 0;
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice() public view returns (uint256 price_) {
        price_ = terms.controlVariable.mul(debtRatio()).div(
            10**(uint256(payoutToken.decimals()).sub(5))
        );
        if (price_ < terms.minimumPrice) {
            price_ = terms.minimumPrice;
        }
    }

    /**
     *  @notice calculate true bond price a user pays
     *  @return price_ uint
     */
    function trueBondPrice() public view returns (uint256 price_) {
        price_ = bondPrice().add(bondPrice().mul(currentVetokenFee()).div(1e6));
    }

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout() public view returns (uint256) {
        return payoutToken.totalSupply().mul(terms.maxPayout).div(100000);
    }

    /**
     *  @notice calculate total interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function _payoutFor(uint256 _value) internal view returns (uint256) {
        return FixedPoint.fraction(_value, bondPrice()).decode112with18().div(1e11);
    }

    /**
     *  @notice calculate user's interest due for new bond, accounting for Vetoken Fee
     *  @param _value uint
     *  @return uint
     */
    function payoutFor(uint256 _value) external view returns (uint256) {
        uint256 total = FixedPoint.fraction(_value, bondPrice()).decode112with18().div(1e11);
        return total.sub(total.mul(currentVetokenFee()).div(1e6));
    }

    /**
     *  @notice calculate current ratio of debt to payout token supply
     *  @notice protocols using vetoken Pro should be careful when quickly adding large %s to total supply
     *  @return debtRatio_ uint
     */
    function debtRatio() public view returns (uint256 debtRatio_) {
        debtRatio_ = FixedPoint
            .fraction(currentDebt().mul(10**payoutToken.decimals()), payoutToken.totalSupply())
            .decode112with18()
            .div(1e18);
    }

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint
     */
    function currentDebt() public view returns (uint256) {
        return totalDebt.sub(debtDecay());
    }

    /**
     *  @notice amount to decay total debt by
     *  @return decay_ uint
     */
    function debtDecay() public view returns (uint256 decay_) {
        uint256 blocksSinceLast = block.number.sub(lastDecay);
        decay_ = totalDebt.mul(blocksSinceLast).div(terms.vestingTerm);
        if (decay_ > totalDebt) {
            decay_ = totalDebt;
        }
    }

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor(address _depositor) public view returns (uint256 percentVested_) {
        Bond memory bond = bondInfo[_depositor];
        uint256 blocksSinceLast = block.number.sub(bond.lastBlock);
        uint256 vesting = bond.vesting;

        if (vesting > 0) {
            percentVested_ = blocksSinceLast.mul(10000).div(vesting);
        } else {
            percentVested_ = 0;
        }
    }

    /**
     *  @notice calculate amount of payout token available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingPayoutFor(address _depositor) external view returns (uint256 pendingPayout_) {
        uint256 percentVested = percentVestedFor(_depositor);
        uint256 payout = bondInfo[_depositor].payout;

        if (percentVested >= 10000) {
            pendingPayout_ = payout;
        } else {
            pendingPayout_ = payout.mul(percentVested).div(10000);
        }
    }

    /**
     *  @notice current fee Vetoken takes of each bond
     *  @return currentFee_ uint
     */
    function currentVetokenFee() public view returns (uint256 currentFee_) {
        uint256 tierLength = feeTiers.length;
        for (uint256 i; i < tierLength; i++) {
            if (totalPrincipalBonded < feeTiers[i].tierCeilings || i == tierLength - 1) {
                return feeTiers[i].fees;
            }
        }
    }
}
