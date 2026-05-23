import express    from "express"
import cors       from "cors"
import "dotenv/config"
import { creatorRouter } from "./routes/creator.js"
import { fanRouter }     from "./routes/fan.js"
import { watchCreatorToken } from "./services/events.js"
import { db } from "./db.js" 
import { swapRouter } from "./routes/swap.js"

const app  = express()
const PORT = process.env.PORT ?? 3001

// CORS — must be before all routes
const corsOptions = {
  origin:  "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))

// Handle preflight OPTIONS requests for all routes
app.options("*", cors(corsOptions))

app.use(express.json())

// Routes
app.use("/api/creator", creatorRouter)
app.use("/api/fan",     fanRouter)
app.use("/api/swap",    swapRouter)

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", chain: "ARC-TESTNET" })
})

// Re-watch existing tokens on startup
const existingCreators = db.getAllCreators()
if (existingCreators.length > 0) {
  console.log(`🔄 Restoring ${existingCreators.length} token watcher(s)...`)
  existingCreators.forEach(c => {
    if (c.tokenAddress) {
      watchCreatorToken(c.tokenAddress as `0x${string}`)
    }
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})