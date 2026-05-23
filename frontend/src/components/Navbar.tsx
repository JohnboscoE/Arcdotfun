import { Link, useLocation } from "react-router-dom";
import swift_arc_logo from "../assets/swift_arc_logo.png";

export function Navbar() {
  const location = useLocation();

  const links = [
    { path: "/", label: "Discover" },
    { path: "/swap", label: "Swap" },
    { path: "/send", label: "Send" },
  ];

  return (
    <nav
      style={{
        borderBottom: "1px solid #1E2D45",
        padding: "0 32px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(8,12,20,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            <img
              src={swift_arc_logo}
              alt="Logo"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "white",
              letterSpacing: "-0.3px",
            }}
          >
            ArcDotFun
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                color: location.pathname === link.path ? "white" : "#64748B",
                fontSize: 14,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 8,
                background:
                  location.pathname === link.path ?
                    "rgba(59,130,246,0.1)"
                  : "transparent",
                transition: "all 0.2s",
                display: "block",
              }}
            >
              {link.label}
            </span>
          </Link>
        ))}

        <Link to="/launch" style={{ textDecoration: "none", marginLeft: 8 }}>
          <button
            className="btn-primary"
            style={{ padding: "8px 20px", fontSize: 14 }}
          >
            Launch Token
          </button>
        </Link>
      </div>
    </nav>
  );
}
