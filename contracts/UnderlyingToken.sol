// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UnderlyingToken is ERC20 {
  constructor() ERC20('Underlying Token', 'UTK') { }

  function faucet(address _to, uint _amount) external {
    _mint(_to, _amount);
  }
}