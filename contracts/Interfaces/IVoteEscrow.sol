// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface IVoteEscrow {
    enum EscrowModle {
        CURVE,
        PICKLE,
        SNOW,
        RIBBON,
        IDLE
    }

    function create_lock(uint256, uint256) external;

    function increase_amount(uint256) external;

    function increase_unlock_time(uint256) external;

    function withdraw() external;

    function smart_wallet_checker() external view returns (address);
}
