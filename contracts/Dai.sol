// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dai is ERC20("DAI", "DAI"), Ownable {
    // Define the supply of 1,000,000
    uint256 constant initialSupply = 1000000 * (10**18);

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
