import { useState } from "react";
import { parseUnits, createWalletClient, custom } from "viem";
import { arcTestnet } from "../lib/arc.ts";

interface Props {
  tokenAddress: string;
  onClose: () => void;
}

export function SendModal({ tokenAddress, onClose }: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!to || !amount) return;
    if (!to.startsWith("0x") || to.length !== 42) {
      setError("Invalid wallet address");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      const [from] = await walletClient.requestAddresses();

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: "transfer",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ] as const,
        functionName: "transfer",
        args: [to as `0x${string}`, parseUnits(amount, 18)],
        account: from,
      });

      setTxHash(hash);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0D1321",
          border: "1px solid #1E2D45",
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
            }}
          >
            Send Tokens
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#4A5568",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Recipient */}
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
            RECIPIENT ADDRESS
          </label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="input-field"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "#64748B",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            AMOUNT
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field"
              style={{ paddingRight: 70 }}
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
              TOKENS
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#EF4444", fontSize: 13 }}>❌ {error}</p>
          </div>
        )}

        {txHash ?
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <p style={{ color: "#10B981", fontSize: 13, marginBottom: 6 }}>
              ✅ Tokens sent!
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
        : <button
            onClick={handleSend}
            disabled={loading || !to || !amount}
            className="btn-primary"
            style={{ width: "100%", fontSize: 15 }}
          >
            {loading ? "Sending..." : "Send Tokens →"}
          </button>
        }
      </div>
    </div>
  );
}
