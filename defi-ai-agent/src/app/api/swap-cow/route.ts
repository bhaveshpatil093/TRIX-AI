import { NextRequest, NextResponse } from "next/server";
import Safe from "@safe-global/protocol-kit";
import {
  createPublicClient,
  defineChain,
  http,
} from "viem";
import { sepolia } from "viem/chains";
import { OperationType, MetaTransactionData } from "@safe-global/types-kit";
import {
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  SupportedChainId,
  OrderKind,
  SigningScheme,
} from "@cowprotocol/cow-sdk";
import { VoidSigner } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { COW_ADDRESS, WETH_ADDRESS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log({ body }); // Log the incoming request body for debugging

    const { 
      SAFE_ADDRESS, 
      SIGNER_PRIVATE_KEY, 
      buyAddress, 
      sellAddress, 
      inputAmt 
    } = body;

    const RPC_URL = process.env.RPC_URL;

    if (!SAFE_ADDRESS || !SIGNER_PRIVATE_KEY || !RPC_URL) {
      return NextResponse.json(
        { error: "Missing required input or environment variables" },
        { status: 400 }
      );
    }

    // Log the addresses to verify they are correct
    console.log('SAFE_ADDRESS:', SAFE_ADDRESS);
    console.log('SIGNER_PRIVATE_KEY:', SIGNER_PRIVATE_KEY);
    console.log('buyAddress:', buyAddress);
    console.log('sellAddress:', sellAddress);

    // Check if addresses are valid hex strings or not
    // if (!/^0x[a-fA-F0-9]{40}$/.test(buyAddress) || !/^0x[a-fA-F0-9]{40}$/.test(sellAddress)) {
    //   return NextResponse.json(
    //     { error: "Invalid address format. Expected a 0x-prefixed 40-character address" },
    //     { status: 400 }
    //   );
    // }

    const protocolKit = await Safe.init({
      provider: RPC_URL,
      signer: SIGNER_PRIVATE_KEY,
      safeAddress: SAFE_ADDRESS,
    });

    const smartContractWalletAddress = SAFE_ADDRESS;
    const traderParams = {
      chainId: SupportedChainId.SEPOLIA,
      signer: new VoidSigner(
        smartContractWalletAddress,
        new JsonRpcProvider(RPC_URL)
      ),
      appCode: "awesome-app",
    };

    const sdk = new TradingSdk(traderParams, { enableLogging: false });
    const parameters: TradeParameters = {
      kind: OrderKind.SELL,
      sellToken: WETH_ADDRESS,
      sellTokenDecimals: 18,
      buyToken: COW_ADDRESS,
      buyTokenDecimals: 18,
      amount: String(Number(inputAmt) * 10 ** 18),
    };

    const advancedParameters: SwapAdvancedSettings = {
      quoteRequest: {
        signingScheme: SigningScheme.PRESIGN,
      },
    };

    const orderId = await sdk.postSwapOrder(parameters, advancedParameters);
    console.log(`Order ID: [${orderId}]`);

    const preSignTransaction = await sdk.getPreSignTransaction({
      orderId,
      account: smartContractWalletAddress,
    });

    const customChain = defineChain({
      ...sepolia,
      name: "custom chain",
      transport: http(RPC_URL),
    });

    const publicClient = createPublicClient({
      chain: customChain,
      transport: http(RPC_URL),
    });

    const safePreSignTx: MetaTransactionData = {
      to: preSignTransaction.to,
      value: preSignTransaction.value,
      data: preSignTransaction.data,
      operation: OperationType.Call,
    };

    const safeTx = await protocolKit.createTransaction({
      transactions: [safePreSignTx],
      onlyCalls: true,
    });

    const txResponse = await protocolKit.executeTransaction(safeTx);
    console.log(`Sent tx hash: [${txResponse.hash}]`);
    await publicClient.waitForTransactionReceipt({
      hash: txResponse.hash as `0x${string}`,
    });

    return NextResponse.json({
      message: "Transaction executed successfully",
      transactionHash: txResponse.hash,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
