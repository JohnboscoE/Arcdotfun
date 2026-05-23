import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCreators } from "../lib/api.ts";
import { CreatorCard } from "../components/CreatorCard.tsx";

export function Home() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCreators()
      .then(setCreators)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter by token address OR symbol
  const filtered = creators.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.tokenAddress?.toLowerCase().includes(q) ||
      c.symbol?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q)
    );
  });

  // If search looks like a contract address (0x...) navigate directly
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && search.startsWith("0x") && search.length === 42) {
      window.location.href = `/creator/${search}`;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080C14" }}>
      {/* Hero */}
      <div
        className="grid-bg"
        style={{
          position: "relative",
          padding: "80px 32px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#3B82F6",
            }}
          />
          <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>
            Powered by Arc — Stablecoin L1
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: "-1px",
          }}
        >
          Own a piece of your
          <br />
          <span className="gradient-text">favourite creators</span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#64748B",
            maxWidth: 480,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          Buy creator tokens with USDC, unlock exclusive content, and share in
          their success — settled instantly on Arc.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/launch" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary"
              style={{ fontSize: 15, padding: "12px 28px" }}
            >
              Launch Your Token →
            </button>
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginTop: 56,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Settlement", value: "<1 sec" },
            { label: "Gas Token", value: "USDC" },
            { label: "Creators", value: creators.length || "0" },
          ].map((s) => (
            <div key={s.label}>
              <p
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: "#4A5568" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search + grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
        {/* Search bar */}
        <div style={{ marginBottom: 32, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              color: "#4A5568",
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, ticker (e.g. ALEX) or paste a contract address (0x...)"
            className="input-field"
            style={{ paddingLeft: 44, fontSize: 14 }}
          />
          {search.startsWith("0x") && search.length === 42 && (
            <Link to={`/creator/${search}`} style={{ textDecoration: "none" }}>
              <button
                className="btn-primary"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "6px 14px",
                  fontSize: 12,
                }}
              >
                Go →
              </button>
            </Link>
          )}
        </div>

        {/* Header row */}
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
              fontSize: 24,
              fontWeight: 700,
              color: "white",
            }}
          >
            {search ? `Results for "${search}"` : "Discover Creators"}
          </h2>
          <Link to="/launch" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 13 }}>
              + Launch yours
            </button>
          </Link>
        </div>

        {/* Grid */}
        {loading ?
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#4A5568" }}
          >
            Loading creators...
          </div>
        : filtered.length === 0 ?
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              border: "1px dashed #1E2D45",
              borderRadius: 20,
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <p
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              {search ? "No results found" : "No creators yet"}
            </p>
            <p style={{ color: "#4A5568", marginBottom: 24 }}>
              {search ?
                "Try a different ticker or paste the full contract address"
              : "Be the first to launch your token on Arc"}
            </p>
            {!search && (
              <Link to="/launch" style={{ textDecoration: "none" }}>
                <button className="btn-primary">Launch Your Token →</button>
              </Link>
            )}
          </div>
        : <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((c) => (
              <CreatorCard
                key={c.walletId}
                name={c.name}
                symbol={c.symbol}
                description={c.description}
                tokenAddress={c.tokenAddress ?? ""}
                status={c.status}
              />
            ))}
          </div>
        }
      </div>
    </div>
  );
}
