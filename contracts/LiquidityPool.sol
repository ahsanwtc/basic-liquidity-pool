// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import './GovernanceToken.sol';
import './LpToken.sol';
import './UnderlyingToken.sol';

contract LiquidityPool is LpToken {
  mapping(address => uint) public checkpoints;
  UnderlyingToken public underlyingToken;
  GovernanceToken public governanceToken;
  uint public constant REWARD_PER_BLOCK = 1;

  constructor(address _underlyingToken, address _gevernanceToken) {
    underlyingToken = UnderlyingToken(_underlyingToken);
    governanceToken = GovernanceToken(_gevernanceToken);
  }

  function deposit(uint _amount) external {
    /* rewards are distributed with respect to blocks */
    if (checkpoints[msg.sender] == 0) {
      checkpoints[msg.sender] = block.number;
    }
    _distributeRewards(msg.sender);
    underlyingToken.transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, _amount);
  }

  function withdraw(uint _amount) external {
    require(balanceOf(msg.sender) >= _amount, 'not enough Lp Tokens');
    _distributeRewards(msg.sender);
    underlyingToken.transfer(msg.sender, _amount);
    _burn(msg.sender, _amount);
  }

  function _distributeRewards(address beneficiary) internal {
    uint checkpoint = checkpoints[beneficiary];
    if (block.number - checkpoint > 0) {
      uint distributionAmount = balanceOf(beneficiary) * (block.number - checkpoint) * REWARD_PER_BLOCK;
      governanceToken.mint(beneficiary, distributionAmount);
      checkpoints[beneficiary] = block.number;
    }
  }
}
