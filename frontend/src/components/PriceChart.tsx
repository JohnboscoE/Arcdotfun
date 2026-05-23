import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { price: number; timestamp: string }[];
}

export function PriceChart({ data }: Props) {
  if (data.length < 2)
    return (
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
          Price Chart
        </h2>
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#4A5568", fontSize: 14 }}>
            Not enough data yet — price history builds as trades happen
          </p>
        </div>
      </div>
    );

  const formatted = data.map((d) => ({
    price: d.price,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));
  const change =
    data.length >= 2 ?
      ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
    : 0;
  const isUp = change >= 0;

  return (
    <div
      style={{
        background: "#0D1321",
        border: "1px solid #1E2D45",
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "white",
          }}
        >
          Price Chart
        </h2>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
            background: isUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            color: isUp ? "#10B981" : "#EF4444",
            border: `1px solid ${isUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isUp ? "#10B981" : "#EF4444"}
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor={isUp ? "#10B981" : "#EF4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#4A5568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min * 0.999, max * 1.001]}
            tick={{ fill: "#4A5568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(4)}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0D1321",
              border: "1px solid #1E2D45",
              borderRadius: 8,
              color: "white",
            }}
            formatter={(v: any) => [
              `$${parseFloat(v).toFixed(6)} USDC`,
              "Price",
            ]}
            labelFormatter={(l) => `Time: ${l}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isUp ? "#10B981" : "#EF4444"}
            strokeWidth={2}
            fill="url(#priceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
