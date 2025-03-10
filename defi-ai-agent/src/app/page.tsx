// app/page.tsx
"use client";

import { WagmiProvider } from "wagmi";
// import { arbitrumSepolia,mantleSepoliaTestnet,sonicTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import AIAgent from "@/components/AIAgent";
import {  getDefaultConfig, darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { mantleSepoliaTestnet } from "viem/chains";


const sonicBlazeTestnet = {
  id: 57054,
  name: "Sonic Blaze Testnet",
  iconUrl:"https://miro.medium.com/v2/resize:fit:400/0*aRHYdVg5kllfc7Gn.jpg",
  nativeCurrency: { name: "Sonic Blaze Testnet", symbol: "S", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.blaze.soniclabs.com"] },
  },
  blockExplorers: {
    default: { name: "Sonic Blaze Testnet", url: "https://blaze.soniclabs.com/" },
  },
}

const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "6780ea76605adb8e2893655e41c392a3",
  chains: [sonicBlazeTestnet,mantleSepoliaTestnet],
  transports: {
    // [arbitrumSepolia.id]: http(),
    [mantleSepoliaTestnet.id]: http(),
    [sonicBlazeTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({accentColor:"#372fa3"})} modalSize="wide">
          <AIAgent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
