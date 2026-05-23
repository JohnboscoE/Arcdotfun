import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTokenInfo } from "../lib/api.ts";
import { BuyWidget } from "../components/BuyWidget.tsx";
import { PriceChart } from "../components/PriceChart.tsx";
import { SendModal } from "../components/SendModal.tsx";
import { arcClient } from "../lib/arc.ts";
import { parseAbi, parseUnits, createWalletClient, custom } from "viem";
import { arcTestnet } from "../lib/arc.ts";
import swift_arc_logo from "../assets/swift_arc_logo.png";

const TOKEN_ABI = parseAbi([
  "function currentPrice() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function accessTier(address fan) view returns (string)",
  "function balanceOf(address) view returns (uint256)",
]);

const TIERS: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    min: number;
  }
> = {
  diamond: {
    label: "💎 Diamond",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    min: 1000,
  },
  gold: {
    label: "🥇 Gold",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    min: 100,
  },
  silver: {
    label: "🥈 Silver",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
    min: 10,
  },
  none: { label: "No Tier", color: "#4A5568", bg: "transparent", min: 0 },
};

export function Profile() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();

  const [price, setPrice] = useState<string>("1000000");
  const [supply, setSupply] = useState<string>("0");
  const [events, setEvents] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [fanAddress, setFanAddress] = useState<string | null>(null);
  const [fanTier, setFanTier] = useState<string>("none");
  const [fanBalance, setFanBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [showSend, setShowSend] = useState(false);

  // Sell state
  const [sellAmount, setSellAmount] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellTxHash, setSellTxHash] = useState<string | null>(null);
  const [sellError, setSellError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenAddress) return;
    getTokenInfo(tokenAddress)
      .then((info) => {
        setPrice(info.currentPrice ?? "1000000");
        setSupply(info.totalSupply ?? "0");
        setEvents(info.events ?? []);
        setPriceHistory(info.priceHistory ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tokenAddress]);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0] as `0x${string}`;
    setFanAddress(address);

    const [tier, balance] = await Promise.all([
      arcClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: "accessTier",
        args: [address],
      }),
      arcClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      }),
    ]);

    setFanTier(tier as string);
    setFanBalance((Number(balance) / 1e18).toFixed(2));
  }

  async function handleSell() {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return;
    setSellLoading(true);
    setSellError(null);
    setSellTxHash(null);

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
            name: "sell",
            type: "function",
            inputs: [{ name: "tokenAmount", type: "uint256" }],
            outputs: [],
          },
        ] as const,
        functionName: "sell",
        args: [parseUnits(sellAmount, 18)],
        account: from,
      });

      setSellTxHash(hash);
      setSellAmount("");
      setTimeout(connectWallet, 2000);
    } catch (err: any) {
      setSellError(err.message);
    } finally {
      setSellLoading(false);
    }
  }

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#4A5568" }}>
        Loading token...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#EF4444" }}>
        Error: {error}
      </div>
    );

  const priceUsd = (parseInt(price) / 1e6).toFixed(4);
  const supplyNum = (parseInt(supply) / 1e18).toFixed(0);
  const tier = TIERS[fanTier] ?? TIERS.none;

  const sellEstimate =
    sellAmount ?
      (parseFloat(sellAmount) * (parseInt(price) / 1e6) * 0.975).toFixed(4)
    : "0.00";

  return (
    <div style={{ minHeight: "100vh", background: "#080C14" }}>
      {showSend && (
        <SendModal
          tokenAddress={tokenAddress!}
          onClose={() => setShowSend(false)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(59,130,246,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid #1E2D45",
          padding: "40px 32px 32px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}
            >
              <img src={swift_arc_logo} alt="Swift Arc Logo" />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Creator Token
              </h1>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#4A5568",
                }}
              >
                {tokenAddress}
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {fanAddress && (
                <button
                  onClick={() => setShowSend(true)}
                  className="btn-ghost"
                  style={{ fontSize: 13 }}
                >
                  ↗ Send
                </button>
              )}
              {fanAddress ?
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <p
                    style={{ fontSize: 11, color: "#4A5568", marginBottom: 2 }}
                  >
                    Connected
                  </p>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: "#3B82F6",
                    }}
                  >
                    {fanAddress.slice(0, 6)}...{fanAddress.slice(-4)}
                  </p>
                </div>
              : <button
                  onClick={connectWallet}
                  className="btn-primary"
                  style={{ fontSize: 14 }}
                >
                  Connect Wallet
                </button>
              }
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Token Price", value: `$${priceUsd}`, unit: "USDC" },
              {
                label: "Total Supply",
                value: parseInt(supplyNum).toLocaleString(),
                unit: "tokens",
              },
              {
                label: "Transactions",
                value: events.length.toString(),
                unit: "total",
              },
              ...(fanAddress ?
                [{ label: "Your Balance", value: fanBalance, unit: "tokens" }]
              : []),
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0D1321",
                  border: "1px solid #1E2D45",
                  borderRadius: 12,
                  padding: "14px 20px",
                  minWidth: 140,
                }}
              >
                <p style={{ fontSize: 12, color: "#4A5568", marginBottom: 4 }}>
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {s.value}
                  <span
                    style={{ fontSize: 12, color: "#4A5568", marginLeft: 4 }}
                  >
                    {s.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 24,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Tier badge */}
            {fanAddress && (
              <div
                style={{
                  background: tier.bg,
                  border: `1px solid ${tier.color}30`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <p style={{ fontSize: 12, color: "#4A5568", marginBottom: 8 }}>
                  YOUR ACCESS TIER
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <p
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: tier.color,
                    }}
                  >
                    {tier.label}
                  </p>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 20,
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {fanBalance}
                    </p>
                    <p style={{ fontSize: 12, color: "#4A5568" }}>
                      tokens held
                    </p>
                  </div>
                </div>
                {fanTier === "none" && (
                  <p style={{ fontSize: 13, color: "#4A5568", marginTop: 8 }}>
                    Buy 10+ tokens to unlock Silver tier
                  </p>
                )}
              </div>
            )}

            {/* Price chart */}
            <PriceChart data={priceHistory} />

            {/* Access tiers */}
            <div
              style={{
                background: "#0D1321",
                border: "1px solid #1E2D45",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 16,
                }}
              >
                Access Tiers
              </h2>
              {Object.entries(TIERS)
                .filter(([k]) => k !== "none")
                .map(([key, t]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: fanTier === key ? t.bg : "transparent",
                      border: `1px solid ${fanTier === key ? t.color + "40" : "#1E2D45"}`,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {key === "diamond" ?
                          "💎"
                        : key === "gold" ?
                          "🥇"
                        : "🥈"}
                      </span>
                      <div>
                        <p
                          style={{
                            color: t.color,
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </p>
                        <p style={{ fontSize: 12, color: "#4A5568" }}>
                          {key === "diamond" ?
                            "Livestreams, DMs, merch drops"
                          : key === "gold" ?
                            "Exclusive posts, Discord access"
                          : "Early content access"}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          color: t.color,
                        }}
                      >
                        {t.min}+ tokens
                      </p>
                      {fanTier === key && (
                        <p style={{ fontSize: 11, color: t.color }}>● Active</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Activity feed */}
            <div
              style={{
                background: "#0D1321",
                border: "1px solid #1E2D45",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 16,
                }}
              >
                Recent Activity
              </h2>
              {events.length === 0 ?
                <p style={{ color: "#4A5568", fontSize: 14 }}>
                  No transactions yet — be the first buyer!
                </p>
              : [...events]
                  .reverse()
                  .slice(0, 8)
                  .map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #1E2D45",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background:
                              e.type === "buy" ?
                                "rgba(16,185,129,0.1)"
                              : "rgba(239,68,68,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {e.type === "buy" ? "↑" : "↓"}
                        </div>
                        <div>
                          <p
                            style={{
                              color: e.type === "buy" ? "#10B981" : "#EF4444",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {e.type === "buy" ? "Buy" : "Sell"}
                          </p>
                          <p
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                              color: "#4A5568",
                            }}
                          >
                            {e.fan?.slice(0, 6)}...{e.fan?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {e.type === "buy" ?
                            `$${(parseInt(e.usdcSpent ?? "0") / 1e6).toFixed(2)} USDC`
                          : `${(parseInt(e.tokensSold ?? "0") / 1e18).toFixed(2)} tokens`
                          }
                        </p>
                        <p style={{ fontSize: 11, color: "#4A5568" }}>
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Right — Trade widget */}
          <div>
            <div
              style={{
                background: "#0D1321",
                border: "1px solid #1E2D45",
                borderRadius: 20,
                overflow: "hidden",
                position: "sticky",
                top: 80,
              }}
            >
              {/* Buy / Sell tabs */}
              <div
                style={{ display: "flex", borderBottom: "1px solid #1E2D45" }}
              >
                {(["buy", "sell"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "14px 0",
                      background: activeTab === tab ? "transparent" : "#080C14",
                      border: "none",
                      borderBottom:
                        activeTab === tab ?
                          `2px solid ${tab === "buy" ? "#10B981" : "#EF4444"}`
                        : "2px solid transparent",
                      color: activeTab === tab ? "white" : "#4A5568",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {tab === "buy" ? "↑ Buy" : "↓ Sell"}
                  </button>
                ))}
              </div>

              <div style={{ padding: 24 }}>
                {
                  activeTab === "buy" ?
                    <BuyWidget
                      tokenAddress={tokenAddress!}
                      currentPrice={price}
                      onBuySuccess={connectWallet}
                    />
                    // Sell panel
                  : <div>
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
                          TOKEN AMOUNT TO SELL
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
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
                              color: "#EF4444",
                              fontWeight: 600,
                            }}
                          >
                            TOKENS
                          </span>
                        </div>
                        {fanAddress && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "#4A5568",
                              marginTop: 6,
                            }}
                          >
                            Balance: {fanBalance} tokens
                            <span
                              onClick={() => setSellAmount(fanBalance)}
                              style={{
                                color: "#3B82F6",
                                marginLeft: 8,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Max
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Estimate */}
                      <div
                        style={{
                          background: "#080C14",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 20,
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
                          <span style={{ fontSize: 13, color: "#4A5568" }}>
                            You receive
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: "white",
                              fontWeight: 600,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            ~{sellEstimate} USDC
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 13, color: "#4A5568" }}>
                            Platform fee
                          </span>
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

                      {sellError && (
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 16,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <p style={{ color: "#EF4444", fontSize: 13 }}>
                            ❌ {sellError}
                          </p>
                        </div>
                      )}

                      {/* Reserve warning */}
                      <div
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          marginBottom: 12,
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <p style={{ fontSize: 12, color: "#F59E0B" }}>
                          ⚠️ Sell uses the contract reserve. Buy tokens first to
                          fund it.
                        </p>
                      </div>

                      {sellTxHash ?
                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                          }}
                        >
                          <p
                            style={{
                              color: "#10B981",
                              fontSize: 13,
                              marginBottom: 6,
                            }}
                          >
                            Tokens sold!
                          </p>
                          <a
                            href={`https://testnet.arcscan.app/tx/${sellTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#10B981", fontSize: 12 }}
                          >
                            View on ArcScan →
                          </a>
                        </div>
                      : <button
                          onClick={handleSell}
                          disabled={sellLoading || !sellAmount}
                          style={{
                            width: "100%",
                            padding: "12px 0",
                            background:
                              "linear-gradient(135deg, #EF4444, #DC2626)",
                            border: "none",
                            borderRadius: 10,
                            color: "white",
                            fontWeight: 600,
                            fontSize: 15,
                            cursor:
                              sellLoading || !sellAmount ? "not-allowed" : (
                                "pointer"
                              ),
                            opacity: sellLoading || !sellAmount ? 0.4 : 1,
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                          }}
                        >
                          {sellLoading ? "Processing..." : "Sell Tokens"}
                        </button>
                      }
                    </div>

                }
              </div>
            </div>

            {/* ArcScan */}
            <a
              href={`https://testnet.arcscan.app/address/${tokenAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 16,
                color: "#2D3748",
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              View on ArcScan →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
