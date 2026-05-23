import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.tsx";
import { Launch } from "./pages/Launch.tsx";
import { Profile } from "./pages/Profile.tsx";
import { Swap } from "./pages/Swap.tsx";
import { Send } from "./pages/Send.tsx";
import { Navbar } from "./components/Navbar.tsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#080C14" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/launch" element={<Launch />} />
        <Route path="/creator/:tokenAddress" element={<Profile />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/send" element={<Send />} />
      </Routes>
    </div>
  );
}
