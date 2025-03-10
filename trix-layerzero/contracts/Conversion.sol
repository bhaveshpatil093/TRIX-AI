// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Conversion {
    address public owner;
    address[] public tokenAddresses;

    constructor(address[] memory _tokenAddresses) {
        tokenAddresses = _tokenAddresses;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function convertSToDesiredToken(uint256 _tokenId) external payable {
        require(msg.value > 0, "NOT_ENOUGH_FUNDS_TRANSFER");
        uint256 calculateAmount = msg.value * 5; // 1:5 get one S transfer 5 token1
        IERC20(tokenAddresses[_tokenId]).transfer(msg.sender, calculateAmount);
    }

    function convertDesiredTokenToS(uint _tokenId,uint256 _amount) external payable {
        require(_amount > 0, "FUNDS_IS_NOT_ENOUGH");
        uint256 calculateS = _amount / 5;
        IERC20(tokenAddresses[_tokenId]).transferFrom(msg.sender,address(this),_amount);
        _sendPayment(payable(msg.sender), calculateS);
    }
    // coral , trix , diam 
    function _sendPayment(address payable recipient, uint256 _amount) private {
        (bool success, ) = recipient.call{value: _amount}("");
        require(success, "Payment failed.");
    }

    function addTokens(address _token) external onlyOwner {
        tokenAddresses.push(_token);
    }
    function withdrawFunds(address _token, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, _amount);
    }

    receive() external payable {}
}
// ["0xAF93888cbD250300470A1618206e036E11470149","0xA0D0e6c4277a869cD3c8C3FEc7D00F0bd8E109e8","0x30BF3761147Ef0c86E2f84c3784FBD89E7954670"]