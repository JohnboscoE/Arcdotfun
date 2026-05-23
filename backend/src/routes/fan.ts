import { Router }             from "express"
import type { Request, Response } from "express"
import { createPublicClient, http, parseAbi, defineChain } from "viem"
import { tokenEvents }        from "../services/events.js"

export const fanRouter = Router()

const arcTestnet = defineChain({
  id:   5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [process.env.ARC_RPC!] } },
})

const arcClient = createPublicClient({
  chain:     arcTestnet,
  transport: http(process.env.ARC_RPC!),
})

const TOKEN_ABI = parseAbi([
  "function currentPrice() view returns (uint256)",
  "function accessTier(address fan) view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
])

// In-memory price history per token
const priceHistory: Record<string, { price: number; timestamp: string }[]> = {}

// Record price snapshot
async function recordPrice(tokenAddress: string) {
  try {
    const price = await arcClient.readContract({
      address:      tokenAddress as `0x${string}`,
      abi:          TOKEN_ABI,
      functionName: "currentPrice",
    })
    if (!priceHistory[tokenAddress]) priceHistory[tokenAddress] = []
    priceHistory[tokenAddress].push({
      price:     Number(price) / 1e6,
      timestamp: new Date().toISOString(),
    })
    // Keep last 100 data points
    if (priceHistory[tokenAddress].length > 100) {
      priceHistory[tokenAddress].shift()
    }
  } catch {}
}

// GET /api/fan/token/:address/info
fanRouter.get("/token/:address/info", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as `0x${string}`

    const [price, supply, symbol, name] = await Promise.all([
      arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "currentPrice" }),
      arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "totalSupply"  }),
      arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "symbol"       }),
      arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "name"         }),
    ])

    // Record price snapshot every time info is fetched
    await recordPrice(address)

    res.json({
      tokenAddress: address,
      currentPrice: price.toString(),
      totalSupply:  supply.toString(),
      symbol,
      name,
      priceHistory: priceHistory[address] ?? [],
      events:       tokenEvents[address]  ?? [],
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fan/:fanAddress/tier/:tokenAddress
fanRouter.get("/:fanAddress/tier/:tokenAddress", async (req: Request, res: Response) => {
  try {
    const tokenAddress = req.params.tokenAddress as `0x${string}`
    const fanAddress   = req.params.fanAddress   as `0x${string}`

    const [tier, balance] = await Promise.all([
      arcClient.readContract({
        address: tokenAddress, abi: TOKEN_ABI,
        functionName: "accessTier", args: [fanAddress],
      }),
      arcClient.readContract({
        address: tokenAddress, abi: TOKEN_ABI,
        functionName: "balanceOf", args: [fanAddress],
      }),
    ])

    res.json({
      fanAddress, tokenAddress,
      tier,
      balance: balance.toString(),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fan/token/:address/reserve
fanRouter.get("/token/:address/reserve", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as `0x${string}`

    const reserveAbi = parseAbi([
      "function getReserve() view returns (uint256)",
    ])

    const reserve = await arcClient.readContract({
      address,
      abi:          reserveAbi,
      functionName: "getReserve",
    })

    res.json({
      tokenAddress: address,
      reserve:      reserve.toString(),
      reserveUsdc:  (Number(reserve) / 1e6).toFixed(4),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})