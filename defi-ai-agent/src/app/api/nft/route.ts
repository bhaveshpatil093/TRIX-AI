/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { AINFT_ADDRESS_MAP } from "@/lib/constants";
import { AINFT_ABI } from "@/lib/abi";

type Chain = "arbitrum" | "mantle-sepolia" | "sonic" | "sepolia";


const RPC_URL_MAP: Record<Chain, string> = {
  arbitrum: "https://arb1.arbitrum.io/rpc", // Sample endpoint for Arbitrum
  "mantle-sepolia": "https://endpoints.omniatech.io/v1/mantle/sepolia/public", // Sample endpoint for Mantle
  "sonic": "https://rpc.blaze.soniclabs.com", // Replace with the actual Sonic RPC endpoint
  sepolia: "https://sepolia.rpc.endpoint", // Replace with the actual Sepolia RPC endpoint
};


const EXPLORER_URL_MAP: Record<Chain, string> = {
  arbitrum: "https://arbiscan.io/tx/",
  "mantle-sepolia": "https://explorer.sepolia.mantle.xyz/tx/",
  "sonic": "https://testnet.sonicscan.org/tx/",
  sepolia: "https://sepolia.etherscan.io/tx/",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const { WALLET_ADDRESS, TOKEN_URI, chainId } = body;

    if (!privateKey || !WALLET_ADDRESS || !TOKEN_URI || !chainId) {
      return NextResponse.json(
        { error: "Missing required input or environment variables" },
        { status: 400 }
      );
    }

    // Validate the chain input
    const chain = chainId as Chain;
    if (!RPC_URL_MAP[chain] || !AINFT_ADDRESS_MAP[chain]) {
      return NextResponse.json(
        { error: "Unsupported chain id" },
        { status: 400 }
      );
    }

    const RPC_URL = RPC_URL_MAP[chain];
    const provider = new ethers.providers.JsonRpcProvider({
      url: RPC_URL,
      skipFetchSetup: true,
    });
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);


    // Get the NFT contract address for the specified chain
    const nftContractAddress = AINFT_ADDRESS_MAP[chain];
    console.log(nftContractAddress,chain,signer)
    const nftContract = new ethers.Contract(nftContractAddress, AINFT_ABI, signer);

    const tx = await nftContract.mintNFT(WALLET_ADDRESS, TOKEN_URI);
    await tx.wait();

    console.log("Transaction Hash:", tx.hash);
    return NextResponse.json({
      data: `${EXPLORER_URL_MAP[chain]}${tx.hash}`,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
