import { useState } from "react";
import { createWalletClient, custom, parseUnits, parseAbi } from "viem";
import { arcTestnet, arcClient } from "../lib/arc.ts";

const TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    icon: "💵",
    color: "#2563EB",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    icon: "💶",
    color: "#7C3AED",
  },
  {
    symbol: "USYC",
    name: "US Treasury Yield",
    address: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
    decimals: 6,
    icon: "🏛️",
    color: "#10B981",
  },
];

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
]);

export function Send() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [balance, setBalance] = useState<string>("0.00");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
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
    await loadBalance(address, selectedToken);
  }

  async function loadBalance(address: string, token: (typeof TOKENS)[0]) {
    try {
      const bal = await arcClient.readContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      setBalance((Number(bal) / 10 ** token.decimals).toFixed(4));
    } catch {
      setBalance("0.00");
    }
  }

  async function handleTokenChange(token: (typeof TOKENS)[0]) {
    setSelectedToken(token);
    setTxHash(null);
    setError(null);
    if (walletAddress) await loadBalance(walletAddress, token);
  }

  async function handleSend() {
    if (!recipient || !amount) return;
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setError("Invalid recipient address");
      return;
    }
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      const hash = await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          recipient as `0x${string}`,
          parseUnits(amount, selectedToken.decimals),
        ],
        account: walletAddress as `0x${string}`,
      });

      setTxHash(hash);
      setAmount("");
      await loadBalance(walletAddress, selectedToken);
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
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
              margin: "0 auto 16px",
            }}
          >
            ↗
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
            }}
          >
            Send Tokens
          </h1>
          <p style={{ color: "#4A5568", fontSize: 15 }}>
            Transfer any Arc-supported token to any wallet
          </p>
        </div>

        <div
          style={{
            background: "#0D1321",
            border: "1px solid #1E2D45",
            borderRadius: 20,
            padding: 28,
          }}
        >
          {/* Wallet connect */}
          {!walletAddress ?
            <button
              onClick={connectWallet}
              className="btn-primary"
              style={{ width: "100%", fontSize: 15, marginBottom: 20 }}
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
            </div>
          }

          {/* Token selector */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#64748B",
                marginBottom: 10,
                fontWeight: 600,
              }}
            >
              SELECT TOKEN
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenChange(token)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `1px solid ${
                      selectedToken.symbol === token.symbol ?
                        token.color
                      : "#1E2D45"
                    }`,
                    background:
                      selectedToken.symbol === token.symbol ?
                        `${token.color}15`
                      : "#080C14",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{token.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        color:
                          selectedToken.symbol === token.symbol ?
                            "white"
                          : "#64748B",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {token.symbol}
                    </p>
                    <p style={{ color: "#4A5568", fontSize: 11 }}>
                      {token.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Balance */}
          {walletAddress && (
            <div
              style={{
                background: "#080C14",
                borderRadius: 10,
                padding: "10px 14px",
                border: "1px solid #1E2D45",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "#4A5568" }}>
                Available balance
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {balance} {selectedToken.symbol}
              </span>
            </div>
          )}

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
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="input-field"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
              }}
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
                style={{ paddingRight: 90 }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  onClick={() => setAmount(balance)}
                  style={{
                    fontSize: 11,
                    color: "#3B82F6",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  MAX
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: selectedToken.color,
                    fontWeight: 600,
                  }}
                >
                  {selectedToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          {amount && recipient && (
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
                <span style={{ fontSize: 13, color: "#4A5568" }}>Sending</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {amount} {selectedToken.symbol}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#4A5568" }}>To</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#64748B",
                  }}
                >
                  {recipient.slice(0, 8)}...{recipient.slice(-6)}
                </span>
              </div>
            </div>
          )}

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

          {txHash ?
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <p
                style={{
                  color: "#10B981",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                ✅ Sent successfully!
              </p>
              <p style={{ color: "#4A5568", fontSize: 13, marginBottom: 8 }}>
                {amount} {selectedToken.symbol} sent to {recipient.slice(0, 6)}
                ...{recipient.slice(-4)}
              </p>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#10B981", fontSize: 13 }}
              >
                View on ArcScan →
              </a>
            </div>
          : <button
              onClick={handleSend}
              disabled={loading || !amount || !recipient}
              className="btn-primary"
              style={{ width: "100%", fontSize: 15 }}
            >
              {loading ? "Sending..." : `Send ${selectedToken.symbol} →`}
            </button>
          }
        </div>
      </div>
    </div>
  );
}
