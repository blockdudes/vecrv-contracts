// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./VeTokenBond.sol";

import "../Interfaces/IBondFactoryStorage.sol";
import "../Interfaces/ITreasury.sol";
import "../helper/FixedPoint.sol";

contract BondFactory is Ownable {
    /* ======== STATE VARIABLS ======== */

    address public immutable vetokenTreasury;
    address public immutable bondFactoryStorage;
    //address public immutable subsidyRouter;
    address public immutable vetokenDAO;

    /* ======== CONSTRUCTION ======== */

    constructor(
        address _vetokenTreasury,
        address _bondFactoryStorage,
        //address _subsidyRouter,
        address _vetokenDAO
    ) {
        require(_vetokenTreasury != address(0));
        vetokenTreasury = _vetokenTreasury;
        require(_bondFactoryStorage != address(0));
        bondFactoryStorage = _bondFactoryStorage;
        // require(_subsidyRouter != address(0));
        // subsidyRouter = _subsidyRouter;
        require(_vetokenDAO != address(0));
        vetokenDAO = _vetokenDAO;
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
        @notice deploys custom treasury and custom bond contracts and returns address of both
        @param _payoutToken address
        @param _principleToken address
        @param _customTreasury address
        @param _initialOwner address      
        @return _bond address
     */
    function createBond(
        address _payoutToken,
        address _principleToken,
        address _customTreasury,
        address _initialOwner,
        uint256[] calldata _tierCeilings,
        uint256[] calldata _fees
    ) external onlyOwner returns (address _bond) {
        VeTokenBond bond = new VeTokenBond(
            _customTreasury,
            _payoutToken,
            _principleToken,
            _customTreasury,
            // subsidyRouter,
            _initialOwner,
            vetokenDAO,
            _tierCeilings,
            _fees
        );

        return
            IBondFactoryStorage(bondFactoryStorage).pushBond(
                _payoutToken,
                _principleToken,
                _customTreasury,
                address(bond),
                _initialOwner,
                _tierCeilings,
                _fees
            );
    }
}
