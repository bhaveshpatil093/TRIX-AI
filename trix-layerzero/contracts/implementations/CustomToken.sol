// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CustomToken is ERC20, ERC20Burnable, ERC20Permit {
    constructor(string memory _tokenName, string memory _tokenSymbol)
        ERC20(_tokenName, _tokenSymbol)
        ERC20Permit(_tokenSymbol)
    {
        _mint(msg.sender, 10000*(10**18));
    }
    function mint(address to, uint256 amount) public  {
        _mint(to, amount);
    }
    function burn(address to, uint256 amount) public  {
        _burn(to, amount);
    }
}