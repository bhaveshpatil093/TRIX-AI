import { NextRequest, NextResponse } from "next/server";
import Safe, {
  PredictedSafeProps,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import { createPublicClient, createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { SIGNER_PRIVATE_KEY } = body;
    const RPC_URL = process.env.RPC_URL;

    if (!SIGNER_PRIVATE_KEY || !RPC_URL) {
      return NextResponse.json(
        { error: "Missing required input or environment variables" },
        { status: 400 }
      );
    }

    const account = privateKeyToAccount(SIGNER_PRIVATE_KEY);

    const safeAccountConfig: SafeAccountConfig = {
      owners: [account.address],
      threshold: 1,
    };

    const predictedSafe: PredictedSafeProps = {
      safeAccountConfig,
    };

    const protocolKit = await Safe.init({
      provider: RPC_URL,
      signer: SIGNER_PRIVATE_KEY,
      predictedSafe,
    });

    const safeAddress = await protocolKit.getAddress();

    // Fund the Safe before confirming address
    const customChain = defineChain({
      ...sepolia,
      name: "custom chain",
      transport: http(RPC_URL),
    });

    const walletClient = createWalletClient({
      transport: http(RPC_URL),
      chain: customChain,
    });

    // Send some funds to the Safe (ensure the Safe address is valid)
    if (safeAddress) {
      await walletClient.sendTransaction({
        account: account,
        to: safeAddress as `0x${string}`,
        value: BigInt(0.1 * 1e18), // Fund the Safe with 0.1 ETH (adjust as needed)
      });
    }

    // If Safe is not deployed, deploy it now
    if (!safeAddress) {
      const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();

      const client = await protocolKit.getSafeProvider().getExternalSigner();
      if (!client) {
        return NextResponse.json(
          { error: "Failed to get signer" },
          { status: 500 }
        );
      }

      const transactionHash = await client.sendTransaction({
        to: deploymentTransaction.to as `0x${string}`,
        value: BigInt(deploymentTransaction.value),
        data: deploymentTransaction.data as `0x${string}`,
        chain: customChain,
      });

      const publicClient = createPublicClient({
        chain: customChain,
        transport: http(),
      });

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      // Fund Safe after deployment
      await walletClient.sendTransaction({
        account: account,
        to: safeAddress as `0x${string}`,
        value: BigInt(0.1 * 1e18), // Fund the Safe with 0.1 ETH (adjust as needed)
      });

      return NextResponse.json({
        message: "Safe deployed and funded successfully",
        safeAddress,
        transactionHash,
        txReceipt,
      });
    }

    return NextResponse.json({
      message: "Safe is already deployed and funded",
      safeAddress,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
