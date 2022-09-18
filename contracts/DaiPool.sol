// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// import "@openzeppelin/contracts/utils/Counters.sol";

contract DaiPool is ERC20("tDaiPool", "tDP") {
    using SafeMath for uint256;
    IERC20 public dai;

    constructor(IERC20 _dai) {
        dai = _dai;
    }

    function deposit(uint256 _amount) public {
        uint256 totalDai = dai.balanceOf(address(this));
        uint256 totalShares = totalSupply();

        if (totalShares == 0 || totalDai == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = _amount.mul(totalShares).div(totalDai);
            _mint(msg.sender, what);
        }
        dai.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _amount) public {
        uint256 totalShares = totalSupply();

        uint256 _share = _amount.mul(
            totalShares.div(dai.balanceOf(address(this)))
        );

        _burn(msg.sender, _share);
        dai.transfer(msg.sender, _amount);
    }

    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();

        uint256 what = _share.mul(dai.balanceOf(address(this))).div(
            totalShares
        );
        _burn(msg.sender, _share);
        dai.transfer(msg.sender, what);
    }

    function daiOwned() public view returns (uint256) {
        uint256 totalShares = totalSupply();
        uint256 _share = balanceOf(msg.sender);

        uint256 what = _share.mul(dai.balanceOf(address(this))).div(
            totalShares
        );

        return what;
    }

    function burn(uint256 _share) public {
        _burn(msg.sender, _share);
    }

    function mint(address _account, uint256 _amount) public {
        _mint(_account, _amount);
    }

    function withdrawAll() public {
        uint256 totalShares = totalSupply();
        uint256 _amount = balanceOf(msg.sender);

        uint256 _share = _amount.mul(
            totalShares.div(dai.balanceOf(address(this)))
        );

        _burn(msg.sender, _share);
        dai.transfer(msg.sender, _amount);
    }
}
