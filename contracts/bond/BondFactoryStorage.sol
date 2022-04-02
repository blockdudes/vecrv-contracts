// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BondFactoryStorage is Ownable {
    /* ======== STRUCTS ======== */

    struct BondDetails {
        address _payoutToken;
        address _principleToken;
        address _treasuryAddress;
        address _bondAddress;
        address _initialOwner;
        uint256[] _tierCeilings;
        uint256[] _fees;
    }

    /* ======== STATE VARIABLS ======== */
    BondDetails[] public bondDetails;

    address public bondFactory;

    mapping(address => uint256) public indexOfBond;

    /* ======== EVENTS ======== */

    event BondCreation(address treasury, address bond, address _initialOwner);

    /* ======== POLICY FUNCTIONS ======== */

    /**
        @notice pushes bond details to array
        @param _payoutToken address
        @param _principleToken address
        @param _customTreasury address
        @param _customBond address
        @param _initialOwner address
        @param _tierCeilings uint[]
        @param _fees uint[]     
        @return _bond address
     */
    function pushBond(
        address _payoutToken,
        address _principleToken,
        address _customTreasury,
        address _customBond,
        address _initialOwner,
        uint256[] calldata _tierCeilings,
        uint256[] calldata _fees
    ) external returns (address _bond) {
        require(bondFactory == msg.sender, "Not Olympus Pro Factory");

        indexOfBond[_customBond] = bondDetails.length;

        bondDetails.push(
            BondDetails({
                _payoutToken: _payoutToken,
                _principleToken: _principleToken,
                _treasuryAddress: _customTreasury,
                _bondAddress: _customBond,
                _initialOwner: _initialOwner,
                _tierCeilings: _tierCeilings,
                _fees: _fees
            })
        );

        emit BondCreation(_customTreasury, _customBond, _initialOwner);
        return _customBond;
    }

    /**
        @notice changes olympus pro factory address
        @param _factory address
     */
    function setFactoryAddress(address _factory) external onlyOwner {
        bondFactory = _factory;
    }
}
