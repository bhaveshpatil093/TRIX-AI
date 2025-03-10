export const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
export const COW_ADDRESS = "0x0625aFB445C3B6B7B929342a04A22599fd5dBB59";
export const COWSWAP_GPv2VAULT_RELAYER_ADDRESS = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";
export const INPUT_AMOUNT = (0.002 * 10 ** 18).toString(); // 0.02 ETH
type Chain = "arbitrum" | "mantle-sepolia" | "sonic" | "sepolia";

export const AINFT_ADDRESS_MAP: Record<Chain, string> = {
  arbitrum: "", // Example address for Arbitrum
  "mantle-sepolia": "0xdeBCD0975753BFE290CE7ca42ffB5CE7917463F2", // Replace with actual Mantle address
  sonic: "0x82CA1b39805C0050CbCdF3F9b73Fc35E60D01543",   // Replace with actual Sonic address
  sepolia: ""  // Replace with actual Sepolia address
};

