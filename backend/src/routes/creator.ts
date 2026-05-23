import { Router }                 from "express"
import type { Request, Response } from "express"
import { createCreatorWallet, deployCreatorToken } from "../services/circle.js"
import { watchCreatorToken }      from "../services/events.js"
import { db }                     from "../db.js"

export const creatorRouter = Router()

// POST /api/creator/launch
creatorRouter.post("/launch", async (req: Request, res: Response) => {
  try {
    const { creatorName, tokenName, symbol, description } = req.body

    if (!creatorName || !tokenName || !symbol) {
      res.status(400).json({ error: "creatorName, tokenName and symbol are required" })
      return
    }

    console.log(`🚀 Creating wallet for ${creatorName}...`)
    const wallet = await createCreatorWallet(creatorName)
    if (!wallet) throw new Error("Wallet creation failed")

    const creatorAddress = wallet.address as string

    console.log(`🪙 Deploying token ${symbol}...`)
    const { tokenAddress, txHash } = await deployCreatorToken(
      tokenName, symbol, creatorAddress,
    )

    const creator = {
      id:            wallet.id,
      name:          creatorName,
      tokenName,
      symbol,
      description:   description ?? "",
      walletId:      wallet.id,
      walletAddress: wallet.address as string,
      tokenAddress,
      txHash,
      status:        "live",
      createdAt:     new Date().toISOString(),
    }

    // Save to disk — persists across restarts
    db.saveCreator(creator)

    // Start watching for buy/sell events
    watchCreatorToken(tokenAddress as `0x${string}`)

    res.status(201).json({
      message:       "Token deployed successfully",
      creatorId:     wallet.id,
      walletAddress: wallet.address,
      tokenAddress,
      txHash,
    })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/creator/:id/status
creatorRouter.get("/:id/status", (req: Request, res: Response) => {
  const creator = db.getCreator(req.params.id)
  if (!creator) {
    res.status(404).json({ error: "Creator not found" })
    return
  }
  res.json(creator)
})

// GET /api/creator/all
creatorRouter.get("/all", (_req: Request, res: Response) => {
  res.json(db.getAllCreators())
})