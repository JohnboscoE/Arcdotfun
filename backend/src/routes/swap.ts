import { Router }                          from "express"
import type { Request, Response }          from "express"
import { SwapKit }                         from "@circle-fin/swap-kit"
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2"

export const swapRouter = Router()

swapRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { tokenIn, tokenOut, amountIn, fanAddress } = req.body

    if (!tokenIn || !tokenOut || !amountIn) {
      res.status(400).json({
        error: "tokenIn, tokenOut and amountIn are required"
      })
      return
    }

    if (tokenIn === tokenOut) {
      res.status(400).json({ error: "tokenIn and tokenOut must be different" })
      return
    }

    const kitKey = process.env.CIRCLE_KIT_KEY
    if (!kitKey) throw new Error("CIRCLE_KIT_KEY not set in backend .env")

    console.log(`⇄ Swapping ${amountIn} ${tokenIn} → ${tokenOut} for ${fanAddress ?? "platform"}...`)

    const adapter = createViemAdapterFromPrivateKey({
      privateKey: process.env.PLATFORM_PRIVATE_KEY as string,
    })

    const kit = new SwapKit()

    const swapOptions: any = {
      from:     { adapter, chain: "Arc_Testnet" },
      tokenIn:  tokenIn  as "USDC" | "EURC",
      tokenOut: tokenOut as "USDC" | "EURC",
      amountIn: amountIn.toString(),
      config:   { kitKey },
    }

    // If fan address provided, send output tokens to them
    if (fanAddress) {
      swapOptions.toAddress = fanAddress
    }

    const result = await kit.swap(swapOptions)

    console.log(`✅ Swap complete:`, result)

    res.json({
      success:     true,
      tokenIn:     result.tokenIn,
      tokenOut:    result.tokenOut,
      amountIn:    result.amountIn,
      amountOut:   result.amountOut,
      txHash:      result.txHash,
      explorerUrl: result.explorerUrl,
      fees:        result.fees,
      sentTo:      fanAddress ?? result.toAddress,
    })
  } catch (err: any) {
    console.error("Swap error:", err)
    res.status(500).json({ error: err.message ?? "Swap failed" })
  }
})