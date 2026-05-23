import express    from "express"
import cors       from "cors"
import "dotenv/config"
import { creatorRouter } from "./routes/creator.js"
import { fanRouter }     from "./routes/fan.js"
import { watchCreatorToken } from "./services/events.js"
import { db }            from "./db.js"
import { swapRouter } from "./routes/swap.js"   // ← add this import


const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use("/api/creator", creatorRouter)
app.use("/api/fan",     fanRouter)

app.use("/api/swap", swapRouter) 
app.get("/health", (_req, res) => {
  res.json({ status: "ok", chain: "ARC-TESTNET" })
})

app.use(cors({
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/,      // allows any vercel subdomain
    /\.railway\.app$/,     // allows railway domains
  ],
  credentials: true,
}))



// On startup — re-watch all previously deployed tokens
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