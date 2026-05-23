import express from "express";
import cors from "cors";
import "dotenv/config";
import { creatorRouter } from "./routes/creator.js";
import { fanRouter } from "./routes/fan.js";
const app = express();
const PORT = process.env.PORT ?? 3001;
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/creator", creatorRouter);
app.use("/api/fan", fanRouter);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", chain: "ARC-TESTNET" });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
