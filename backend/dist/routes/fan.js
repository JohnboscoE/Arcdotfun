import { Router } from "express";
import { createPublicClient, http, parseAbi } from "viem";
import { tokenEvents } from "../services/events.js";
export const fanRouter = Router();
const arcClient = createPublicClient({
    transport: http(process.env.ARC_RPC),
});
const TOKEN_ABI = parseAbi([
    "function currentPrice() view returns (uint256)",
    "function accessTier(address fan) view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
]);
// GET /api/fan/token/:address/info
// Get token price, supply, and stats
fanRouter.get("/token/:address/info", async (req, res) => {
    try {
        const address = req.params.address;
        const [price, supply] = await Promise.all([
            arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "currentPrice" }),
            arcClient.readContract({ address, abi: TOKEN_ABI, functionName: "totalSupply" }),
        ]);
        res.json({
            tokenAddress: address,
            currentPrice: price.toString(), // in USDC (6 decimals)
            totalSupply: supply.toString(), // in token units (18 decimals)
            events: tokenEvents[address] ?? [],
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/fan/:fanAddress/tier/:tokenAddress
// Check what access tier a fan has for a creator token
fanRouter.get("/:fanAddress/tier/:tokenAddress", async (req, res) => {
    try {
        const tokenAddress = req.params.tokenAddress;
        const fanAddress = req.params.fanAddress;
        const [tier, balance] = await Promise.all([
            arcClient.readContract({
                address: tokenAddress,
                abi: TOKEN_ABI,
                functionName: "accessTier",
                args: [fanAddress],
            }),
            arcClient.readContract({
                address: tokenAddress,
                abi: TOKEN_ABI,
                functionName: "balanceOf",
                args: [fanAddress],
            }),
        ]);
        res.json({
            fanAddress,
            tokenAddress,
            tier,
            balance: balance.toString(),
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
