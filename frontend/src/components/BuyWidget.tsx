import { useState } from "react";
import { parseUnits, createWalletClient, custom } from "viem";
import { arcTestnet } from "../lib/arc.ts";

interface Props {
  tokenAddress: string;
  currentPrice: string;
  onBuySuccess?: () => void;
}

export function BuyWidget({ tokenAddress, currentPrice, onBuySuccess }: Props) {
  const [usdcAmount, setUsdcAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const priceInUsdc = parseInt(currentPrice) / 1e6;
  const estimatedTokens =
    usdcAmount ? (parseFloat(usdcAmount) / priceInUsdc).toFixed(2) : "0.00";

  async function handleBuy() {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      const [fanAddress] = await walletClient.requestAddresses();
      const amountInUnits = parseUnits(usdcAmount, 6);
      const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;

      await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: [
          {
            name: "approve",
            type: "function",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ] as const,
        functionName: "approve",
        args: [tokenAddress as `0x${string}`, amountInUnits],
        account: fanAddress,
      });

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: "buy",
            type: "function",
            inputs: [{ name: "usdcAmount", type: "uint256" }],
            outputs: [],
          },
        ] as const,
        functionName: "buy",
        args: [amountInUnits],
        account: fanAddress,
      });

      setTxHash(hash);
      setUsdcAmount("");
      if (onBuySuccess) setTimeout(onBuySuccess, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Amount input */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#64748B",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          USDC AMOUNT
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            placeholder="0.00"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            className="input-field"
            style={{ paddingRight: 60 }}
          />
          <span
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: "#3B82F6",
              fontWeight: 600,
            }}
          >
            USDC
          </span>
        </div>
      </div>

      {/* Estimate */}
      <div
        style={{
          background: "#080C14",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          border: "1px solid #1E2D45",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "#4A5568" }}>You receive</span>
          <span
            style={{
              fontSize: 14,
              color: "white",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ~{estimatedTokens} tokens
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "#4A5568" }}>
            Price per token
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#3B82F6",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ${priceInUsdc.toFixed(4)} USDC
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#4A5568" }}>Platform fee</span>
          <span
            style={{
              fontSize: 13,
              color: "#4A5568",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            2.5%
          </span>
        </div>
      </div>

      {/* Tier hint */}
      {usdcAmount && parseFloat(usdcAmount) > 0 && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            marginBottom: 16,
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <p style={{ fontSize: 12, color: "#A78BFA" }}>
            {parseFloat(estimatedTokens) >= 1000 ?
              "💎 Unlocks Diamond tier!"
            : parseFloat(estimatedTokens) >= 100 ?
              "🥇 Unlocks Gold tier!"
            : parseFloat(estimatedTokens) >= 10 ?
              "🥈 Unlocks Silver tier!"
            : "Buy 10+ tokens to unlock Silver tier"}
          </p>
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={loading || !usdcAmount}
        className="btn-primary"
        style={{ width: "100%", fontSize: 15 }}
      >
        {loading ? "Processing..." : "Buy Tokens"}
      </button>

      {txHash && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <p style={{ color: "#10B981", fontSize: 13, marginBottom: 6 }}>
            ✅ Transaction submitted!
          </p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#10B981", fontSize: 12 }}
          >
            View on ArcScan →
          </a>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <p style={{ color: "#EF4444", fontSize: 13 }}>❌ {error}</p>
        </div>
      )}
    </div>
  );
}
