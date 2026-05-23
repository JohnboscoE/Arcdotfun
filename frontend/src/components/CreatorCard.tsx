import { Link } from "react-router-dom";

interface Props {
  name: string;
  symbol: string;
  description?: string;
  tokenAddress: string;
  status: string;
}

const COLORS = [
  ["#3B82F6", "#7C3AED"],
  ["#06B6D4", "#3B82F6"],
  ["#8B5CF6", "#EC4899"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
];

export function CreatorCard({
  name,
  symbol,
  description,
  tokenAddress,
  status,
}: Props) {
  const colorIndex = symbol.charCodeAt(0) % COLORS.length;
  const [c1, c2] = COLORS[colorIndex];

  return (
    <Link to={`/creator/${tokenAddress}`} style={{ textDecoration: "none" }}>
      <div
        className="card-hover"
        style={{
          background: "#0D1321",
          border: "1px solid #1E2D45",
          borderRadius: 16,
          padding: 24,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            background: `radial-gradient(circle, ${c1}20, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "white",
            marginBottom: 16,
          }}
        >
          {symbol.slice(0, 2)}
        </div>

        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "white",
            marginBottom: 4,
          }}
        >
          {name}
        </p>

        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: c1,
            marginBottom: 10,
          }}
        >
          ${symbol}
        </p>

        {description && (
          <p
            style={{
              fontSize: 13,
              color: "#64748B",
              lineHeight: 1.5,
              marginBottom: 16,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}

        {/* Status */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background:
              status === "live" ?
                "rgba(16,185,129,0.1)"
              : "rgba(245,158,11,0.1)",
            border: `1px solid ${status === "live" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: status === "live" ? "#10B981" : "#F59E0B",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: status === "live" ? "#10B981" : "#F59E0B",
            }}
          >
            {status === "live" ? "Live" : "Deploying"}
          </span>
        </div>
      </div>
    </Link>
  );
}
