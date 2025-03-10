// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import { IERC20Metadata, IERC20 } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { OFTAdapter } from "@layerzerolabs/oft-evm/contracts/OFTAdapter.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LZ_Adapter is OFTAdapter {
    using SafeERC20 for IERC20;
    constructor(
        address _innerToken,
        address _lzEndpoint,
        address _delegate
    ) OFTAdapter(_innerToken, _lzEndpoint, _delegate) Ownable() {}
    // adapter setting

}
