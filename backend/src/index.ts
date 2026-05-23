import express from "express"
import cors    from "cors"
import "dotenv/config"

const app  = express()
const PORT = process.env.PORT ?? 3001

const corsOptions = {
  origin:         "*",
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))  // works fine in Express 4
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", chain: "ARC-TESTNET" })
})

async function startServer() {
  try {
    const { creatorRouter }     = await import("./routes/creator.js")
    const { fanRouter }         = await import("./routes/fan.js")
    const { swapRouter }        = await import("./routes/swap.js")
    const { watchCreatorToken } = await import("./services/events.js")
    const { db }                = await import("./db.js")

    app.use("/api/creator", creatorRouter)
    app.use("/api/fan",     fanRouter)
    app.use("/api/swap",    swapRouter)

    db.getAllCreators().forEach(c => {
      if (c.tokenAddress) watchCreatorToken(c.tokenAddress as `0x${string}`)
    })

    console.log(`✅ All routes loaded`)
  } catch (err) {
    console.error("❌ Failed to load routes:", err)
  }
}

startServer()

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})