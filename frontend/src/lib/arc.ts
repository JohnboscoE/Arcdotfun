import { createPublicClient, http, defineChain } from "viem"

// Define Arc Testnet as a custom chain for viem
export const arcTestnet = defineChain({
  id:   5042002,  // Arc Testnet chain ID
  name: "Arc Testnet",
  nativeCurrency: {
    name:     "USD Coin",
    symbol:   "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_ARC_RPC],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url:  "https://testnet.arcscan.app",
    },
  },
})

export const arcClient = createPublicClient({
  chain:     arcTestnet,
  transport: http(import.meta.env.VITE_ARC_RPC),
})