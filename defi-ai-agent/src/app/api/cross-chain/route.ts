/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    if (action === "sendOFT") {
      return handleSendOFT(body);
    } else if (action === "setPeer") {
      return;
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}

async function handleSendOFT(body: any) {
  const { srcChainId, destChainId, amount, receivingAccountAddress } = body;
  console.log("body", body);
  if (!srcChainId || !destChainId || !amount || !receivingAccountAddress) {
    return NextResponse.json(
      { error: "Missing required input or environment variables" },
      { status: 400 }
    );
  }
  try {
    const res = await axios.post("http://localhost:8080/api/sendOFT", {
      srcChainId: Number(srcChainId),
      destChainId: Number(destChainId),
      amount: Number(amount),
      receivingAccountAddress,
    });
    if(res.status !== 200) {
        return NextResponse.json({ error: "Error sending OFT" }, { status: 500 });
    }
    console.log("Response:", res.data);
    return NextResponse.json({url:res.data.data.url}, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
