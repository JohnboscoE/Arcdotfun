import { Router } from "express";
import { createCreatorWallet, deployCreatorToken, getTransactionStatus, getContractAddress, } from "../services/circle.js";
import { watchCreatorToken } from "../services/events.js";
export const creatorRouter = Router();
// In-memory store — replace with a real DB later
const creators = {};
// POST /api/creator/launch
// Creator submits their name, token name, symbol
creatorRouter.post("/launch", async (req, res) => {
    try {
        const { creatorName, tokenName, symbol, description } = req.body;
        if (!creatorName || !tokenName || !symbol) {
            res.status(400).json({ error: "creatorName, tokenName and symbol are required" });
            return;
        }
        // Step 1: Create a wallet for the creator
        console.log(`🚀 Creating wallet for ${creatorName}...`);
        const wallet = await createCreatorWallet(creatorName);
        if (!wallet)
            throw new Error("Wallet creation failed");
        // Step 2: Deploy their ERC-20 token
        console.log(`🪙 Deploying token ${symbol}...`);
        const { contractId, transactionId } = await deployCreatorToken(tokenName, symbol, wallet.address);
        // Step 3: Save creator data
        const creator = {
            id: wallet.id,
            name: creatorName,
            tokenName,
            symbol,
            description,
            walletId: wallet.id,
            walletAddress: wallet.address,
            contractId,
            transactionId,
            tokenAddress: null, // filled in after deployment confirms
            status: "deploying",
            createdAt: new Date().toISOString(),
        };
        creators[wallet.id] = creator;
        res.status(201).json({
            message: "Token deployment initiated",
            creatorId: wallet.id,
            walletAddress: wallet.address,
            transactionId,
            contractId,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// GET /api/creator/:id/status
// Poll this until tokenAddress is available
creatorRouter.get("/:id/status", async (req, res) => {
    try {
        const creatorId = req.params.id;
        if (typeof creatorId !== "string") {
            res.status(400).json({ error: "Invalid creator id" });
            return;
        }
        const creator = creators[creatorId];
        if (!creator) {
            res.status(404).json({ error: "Creator not found" });
            return;
        }
        // If already confirmed, return immediately
        if (creator.tokenAddress) {
            res.json(creator);
            return;
        }
        // Check transaction status on-chain
        const tx = await getTransactionStatus(creator.transactionId);
        if (tx?.state === "COMPLETE") {
            // Get the deployed contract address
            const tokenAddress = await getContractAddress(creator.contractId);
            creator.tokenAddress = tokenAddress;
            creator.status = "live";
            // Start watching for buy/sell events
            if (tokenAddress) {
                try {
                    watchCreatorToken(tokenAddress);
                }
                catch (watchError) {
                    console.error("Token watcher failed:", watchError);
                }
            }
        }
        res.json(creator);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/creator/all
creatorRouter.get("/all", (_req, res) => {
    res.json(Object.values(creators));
});
