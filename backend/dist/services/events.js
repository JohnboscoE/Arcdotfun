import { createPublicClient, http, parseAbiItem } from "viem";
const arcClient = createPublicClient({
    transport: http(process.env.ARC_RPC),
});
export const tokenEvents = {};
const watchedTokens = new Set();
export function watchCreatorToken(tokenAddress) {
    if (watchedTokens.has(tokenAddress))
        return;
    try {
        console.log(`Watching token: ${tokenAddress}`);
        arcClient.watchEvent({
            address: tokenAddress,
            event: parseAbiItem("event TokensPurchased(address indexed fan, uint256 usdcSpent, uint256 tokensReceived)"),
            onLogs: (logs) => {
                logs.forEach((log) => {
                    const event = {
                        type: "buy",
                        fan: log.args.fan,
                        usdcSpent: log.args.usdcSpent?.toString(),
                        tokensReceived: log.args.tokensReceived?.toString(),
                        timestamp: new Date().toISOString(),
                    };
                    tokenEvents[tokenAddress] ??= [];
                    tokenEvents[tokenAddress].push(event);
                    console.log("Buy event:", event);
                });
            },
            onError: (error) => {
                console.error("Buy event watcher failed:", error);
            },
        });
        arcClient.watchEvent({
            address: tokenAddress,
            event: parseAbiItem("event TokensSold(address indexed fan, uint256 tokensSold, uint256 usdcReceived)"),
            onLogs: (logs) => {
                logs.forEach((log) => {
                    const event = {
                        type: "sell",
                        fan: log.args.fan,
                        tokensSold: log.args.tokensSold?.toString(),
                        usdcReceived: log.args.usdcReceived?.toString(),
                        timestamp: new Date().toISOString(),
                    };
                    tokenEvents[tokenAddress] ??= [];
                    tokenEvents[tokenAddress].push(event);
                    console.log("Sell event:", event);
                });
            },
            onError: (error) => {
                console.error("Sell event watcher failed:", error);
            },
        });
        watchedTokens.add(tokenAddress);
    }
    catch (error) {
        console.error("Failed to start token watcher:", error);
    }
}
