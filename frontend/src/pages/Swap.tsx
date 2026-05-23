import { useState } from "react";
import { parseAbi } from "viem";
import { arcClient } from "../lib/arc.ts";
import { executeSwap } from "../lib/api.ts";

const TOKENS = [
  { symbol: "USDC", name: "USD Coin", icon: "💵", color: "#2563EB" },
  { symbol: "EURC", name: "Euro Coin", icon: "💶", color: "#7C3AED" },
];

const TOKEN_ADDRESSES: Record<string, string> = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
]);

export function Swap() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0] as `0x${string}`;
    setWalletAddress(address);
    await loadBalances(address);
  }

  async function loadBalances(address: string) {
    const results: Record<string, string> = {};
    await Promise.all(
      TOKENS.map(async (t) => {
        try {
          const bal = await arcClient.readContract({
            address: TOKEN_ADDRESSES[t.symbol] as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          });
          results[t.symbol] = (Number(bal) / 1e6).toFixed(4);
        } catch {
          results[t.symbol] = "0.00";
        }
      }),
    );
    setBalances(results);
  }

  function flipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    setResult(null);
    setError(null);
  }

  function selectTokenIn(t: (typeof TOKENS)[0]) {
    if (t.symbol === tokenOut.symbol) flipTokens();
    else {
      setTokenIn(t);
      setResult(null);
      setError(null);
    }
  }

  function selectTokenOut(t: (typeof TOKENS)[0]) {
    if (t.symbol === tokenIn.symbol) flipTokens();
    else {
      setTokenOut(t);
      setResult(null);
      setError(null);
    }
  }

  async function handleSwap() {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setError("Enter an amount to swap");
      return;
    }
    if (tokenIn.symbol === tokenOut.symbol) {
      setError("Select different tokens");
      return;
    }
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const swapResult = await executeSwap({
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn: amountIn,
        fanAddress: walletAddress, // ← output goes to fan's MetaMask
      });

      setResult(swapResult);
      setAmountIn("");
      await loadBalances(walletAddress);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err.message ?? "Swap failed");
    } finally {
      setLoading(false);
    }
  }
  const estimatedOut =
    amountIn && parseFloat(amountIn) > 0 ?
      tokenIn.symbol === "USDC" ?
        (parseFloat(amountIn) * 0.924 * 0.999).toFixed(4)
      : (parseFloat(amountIn) * 1.082 * 0.999).toFixed(4)
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 14px",
            }}
          >
            ⇄
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              marginBottom: 6,
            }}
          >
            Swap Tokens
          </h1>
          <p style={{ color: "#4A5568", fontSize: 14 }}>
            Powered by Arc App Kit · StableFX settlement
          </p>
        </div>

        {/* Main card */}
        <div
          style={{
            background: "#0D1321",
            border: "1px solid #1E2D45",
            borderRadius: 20,
            padding: 24,
          }}
        >
          {/* Wallet row */}
          {!walletAddress ?
            <button
              onClick={connectWallet}
              className="btn-primary"
              style={{ width: "100%", fontSize: 14, marginBottom: 20 }}
            >
              Connect Wallet
            </button>
          : <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981",
                }}
              />
              <span style={{ fontSize: 12, color: "#10B981" }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                {TOKENS.map((t) => (
                  <span
                    key={t.symbol}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#64748B",
                    }}
                  >
                    {balances[t.symbol] ?? "—"} {t.symbol}
                  </span>
                ))}
                <button
                  onClick={() => loadBalances(walletAddress)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3B82F6",
                    fontSize: 12,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ↻
                </button>
              </div>
            </div>
          }

          {/* FROM box */}
          <div
            style={{
              background: "#080C14",
              border: "1px solid #1E2D45",
              borderRadius: 14,
              padding: 16,
              marginBottom: 6,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#4A5568",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              FROM
            </p>

            {/* Token pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {TOKENS.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => selectTokenIn(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `1px solid ${tokenIn.symbol === t.symbol ? t.color : "#1E2D45"}`,
                    background:
                      tokenIn.symbol === t.symbol ?
                        `${t.color}20`
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: tokenIn.symbol === t.symbol ? "white" : "#64748B",
                    }}
                  >
                    {t.symbol}
                  </span>
                </button>
              ))}
            </div>

            {/* Amount input — INSIDE the box */}
            <div
              style={{
                background: "#0D1321",
                border: "1px solid #1E2D45",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <input
                type="number"
                value={amountIn}
                onChange={(e) => {
                  setAmountIn(e.target.value);
                  setResult(null);
                }}
                placeholder="0.00"
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  width: "100%",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: tokenIn.color,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tokenIn.symbol}
                </span>
                {walletAddress && (
                  <span
                    onClick={() => setAmountIn(balances[tokenIn.symbol] ?? "0")}
                    style={{
                      fontSize: 10,
                      color: "#3B82F6",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    MAX: {balances[tokenIn.symbol] ?? "0"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Flip button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "6px 0",
            }}
          >
            <button
              onClick={flipTokens}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#0D1321",
                border: "1px solid #1E2D45",
                color: "#3B82F6",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              ⇅
            </button>
          </div>

          {/* TO box */}
          <div
            style={{
              background: "#080C14",
              border: "1px solid #1E2D45",
              borderRadius: 14,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#4A5568",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              TO (ESTIMATED)
            </p>

            {/* Token pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {TOKENS.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => selectTokenOut(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `1px solid ${tokenOut.symbol === t.symbol ? t.color : "#1E2D45"}`,
                    background:
                      tokenOut.symbol === t.symbol ?
                        `${t.color}20`
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: tokenOut.symbol === t.symbol ? "white" : "#64748B",
                    }}
                  >
                    {t.symbol}
                  </span>
                </button>
              ))}
            </div>

            {/* Estimated output */}
            <div
              style={{
                background: "#0D1321",
                border: "1px solid #1E2D45",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  color: result ? "white" : "#2D3748",
                }}
              >
                {result ? result.amountOut : estimatedOut || "0.00"}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: tokenOut.color,
                  fontWeight: 700,
                }}
              >
                {tokenOut.symbol}
              </span>
            </div>
          </div>

          {/* Rate row */}
          {amountIn && parseFloat(amountIn) > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 4px",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "#4A5568" }}>Est. rate</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "white",
                }}
              >
                1 {tokenIn.symbol} ≈{" "}
                {tokenIn.symbol === "USDC" ? "0.924" : "1.082"}{" "}
                {tokenOut.symbol}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <p style={{ color: "#EF4444", fontSize: 13 }}>❌ {error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <p
                style={{
                  color: "#10B981",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Swap successful!
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 13, color: "#4A5568" }}>
                  You received
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {result.amountOut} {result.tokenOut}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 13, color: "#4A5568" }}>Sent to</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#64748B",
                  }}
                >
                  {result.sentTo?.slice(0, 6)}...{result.sentTo?.slice(-4)}
                </span>
              </div>

              {result.fees?.[0] && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#4A5568" }}>Fee</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: "#4A5568",
                    }}
                  >
                    {result.fees[0].amount} {result.fees[0].token}
                  </span>
                </div>
              )}

              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#10B981", fontSize: 13 }}
              >
                View on ArcScan →
              </a>
            </div>
          )}

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={
              loading || !amountIn || tokenIn.symbol === tokenOut.symbol
            }
            className="btn-primary"
            style={{ width: "100%", fontSize: 15 }}
          >
            {loading ?
              "Swapping..."
            : `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#2D3748",
              fontSize: 11,
              marginTop: 14,
            }}
          >
            Sub-second settlement · Circle StableFX · Arc Testnet
          </p>
        </div>
      </div>
    </div>
  );
}
