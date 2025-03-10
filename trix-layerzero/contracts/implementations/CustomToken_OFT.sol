// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import { SendParam } from "@layerzerolabs/oft-evm/contracts/OFTCore.sol";

contract CustomToken_OFT is OFT {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) {}

    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
    }

}

