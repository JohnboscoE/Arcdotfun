import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { launchCreatorToken, getCreatorStatus } from "../lib/api.ts";

export function Launch() {
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [form, setForm] = useState({
    creatorName: "",
    tokenName: "",
    symbol: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — connect wallet
  async function connectWallet() {
    if (!window.ethereum) {
      setError("Please install MetaMask to launch a token");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWalletAddress(accounts[0]);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    if (!form.creatorName || !form.tokenName || !form.symbol) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus("Submitting...");

    try {
      const result = await launchCreatorToken({ ...form, walletAddress });
      setStatus("Deploying your token on Arc...");

      let tokenAddress: string | null = null;
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const s = await getCreatorStatus(result.creatorId);
        if (s.tokenAddress) {
          tokenAddress = s.tokenAddress;
          break;
        }
        setStatus(`Still deploying... (${(i + 1) * 5}s)`);
      }

      if (tokenAddress) {
        setStatus("🎉 Token live!");
        setTimeout(() => navigate(`/creator/${tokenAddress}`), 1500);
      } else {
        setError("Deployment timed out — check back shortly");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 20px",
            }}
          >
            🚀
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
              letterSpacing: "-0.5px",
            }}
          >
            Launch Your Token
          </h1>
          <p style={{ color: "#4A5568", fontSize: 15 }}>
            Deploy your personal ERC-20 on Arc in under a minute
          </p>
        </div>

        {/* Wallet gate */}
        {!walletAddress ?
          <div
            style={{
              background: "#0D1321",
              border: "1px solid #1E2D45",
              borderRadius: 20,
              padding: 40,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔐</p>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "white",
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              Connect your wallet first
            </p>
            <p style={{ color: "#4A5568", fontSize: 14, marginBottom: 24 }}>
              You need a wallet to deploy and own your creator token
            </p>
            <button
              onClick={connectWallet}
              className="btn-primary"
              style={{ fontSize: 15, padding: "12px 32px" }}
            >
              Connect MetaMask
            </button>
            {error && (
              <p style={{ color: "#EF4444", fontSize: 13, marginTop: 12 }}>
                ❌ {error}
              </p>
            )}
          </div>
        : <div
            style={{
              background: "#0D1321",
              border: "1px solid #1E2D45",
              borderRadius: 20,
              padding: 32,
            }}
          >
            {/* Connected badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                marginBottom: 24,
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
                Connected: {walletAddress.slice(0, 6)}...
                {walletAddress.slice(-4)}
              </span>
            </div>

            {/* Form fields */}
            {[
              {
                label: "Your Name",
                name: "creatorName",
                placeholder: "e.g. Alex Johnson",
              },
              {
                label: "Token Name",
                name: "tokenName",
                placeholder: "e.g. Alex Token",
              },
              {
                label: "Token Symbol",
                name: "symbol",
                placeholder: "e.g. ALEX (max 5)",
              },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#64748B",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {f.label} <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  name={f.name}
                  value={(form as any)[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  maxLength={f.name === "symbol" ? 5 : undefined}
                  className="input-field"
                />
              </div>
            ))}

            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell fans what they unlock by holding your token..."
                rows={3}
                className="input-field"
                style={{ resize: "none" }}
              />
            </div>

            {/* Tier preview */}
            <div
              style={{
                background: "#080C14",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                border: "1px solid #1E2D45",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#4A5568",
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                ACCESS TIERS YOUR FANS UNLOCK
              </p>
              {[
                {
                  icon: "💎",
                  label: "Diamond",
                  tokens: "1000+",
                  color: "#06B6D4",
                },
                { icon: "🥇", label: "Gold", tokens: "100+", color: "#F59E0B" },
                {
                  icon: "🥈",
                  label: "Silver",
                  tokens: "10+",
                  color: "#94A3B8",
                },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid #1E2D45",
                  }}
                >
                  <span style={{ fontSize: 13, color: "white" }}>
                    {t.icon} {t.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Hold {t.tokens} tokens
                  </span>
                </div>
              ))}
            </div>

            {status && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "#3B82F6", fontSize: 13 }}>⟳ {status}</p>
              </div>
            )}

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

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", fontSize: 15 }}
            >
              {loading ? "Deploying..." : "Launch My Token 🚀"}
            </button>
          </div>
        }

        <p
          style={{
            textAlign: "center",
            color: "#2D3748",
            fontSize: 12,
            marginTop: 20,
          }}
        >
          Gas fees sponsored by the platform · Powered by Circle
        </p>
      </div>
    </div>
  );
}
