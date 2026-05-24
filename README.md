# 🪙 ArcdotFun

> **The Social Token Launchpad built on Arc** — Create your personal ERC-20 token, let fans buy in with USDC, unlock exclusive access tiers, and trade stablecoins instantly with sub-second settlement.

[![Built on Arc](https://img.shields.io/badge/Built%20on-Arc%20Testnet-3B82F6?style=flat-square)](https://arc.io)
[![Powered by Circle](https://img.shields.io/badge/Powered%20by-Circle-7C3AED?style=flat-square)](https://circle.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## What is ArcdotFun?

ArcdotFun is a decentralized social token launchpad where creators — musicians, writers, athletes, YouTubers — can launch their own personal ERC-20 token in under a minute. Fans buy the token with USDC, unlocking tiered access to exclusive content, and can trade tokens in real time on Arc's stablecoin Layer-1 blockchain.

Think of it as a cross between Rally, Friend.tech, and a creator monetization platform — but built entirely on Arc with instant settlement, no volatile gas fees, and cross-chain fan onboarding.

---

## Features

- 🚀 **One-click token launch** — Creators deploy a personal ERC-20 token with a bonding curve in seconds
- 💎 **Access tiers** — Fans unlock Silver (10+), Gold (100+), and Diamond (1000+) tiers based on token holdings
- 📈 **Live price chart** — Real-time bonding curve price chart updates as tokens are bought and sold
- 🔍 **Search** — Find any creator by name, ticker symbol, or paste a contract address directly
- ↑ **Buy / ↓ Sell** — Trade creator tokens with USDC directly from the profile page
- ↗ **Send** — Transfer USDC, EURC, or USYC to any wallet on Arc
- ⇄ **Swap** — Swap between Arc-native stablecoins (USDC ↔ EURC) via Circle's StableFX engine
- 🌐 **Cross-chain fans** — Fans on Ethereum, Solana, or Polygon can participate via Arc App Kit Unified Balance
- ⚡ **Sub-second finality** — All transactions confirm in under 1 second on Arc Testnet
- ⛽ **Gas in USDC** — No ETH needed — all fees are paid in USDC

---

## Tech Stack

### Blockchain & Smart Contracts
| Tool | Purpose |
|---|---|
| **Arc Testnet** (Chain ID: 5042002) | Layer-1 stablecoin blockchain |
| **Solidity 0.8.20** | Smart contract language |
| **Foundry (Forge)** | Contract compilation, testing, and deployment |
| **OpenZeppelin** | Audited ERC-20 base contracts |
| **Viem** | Ethereum interaction library |

### Backend
| Tool | Purpose |
|---|---|
| **Node.js + TypeScript** | Server runtime |
| **Express 4** | REST API framework |
| **Circle Developer Controlled Wallets SDK** | Create and manage creator wallets |
| **Circle Smart Contract Platform SDK** | Deploy contracts via Circle |
| **Circle SwapKit** | Execute USDC ↔ EURC swaps via StableFX |
| **Railway** | Backend hosting and deployment |

### Frontend
| Tool | Purpose |
|---|---|
| **React + TypeScript** | UI framework |
| **Vite** | Frontend build tool |
| **React Router** | Client-side routing |
| **Recharts** | Price chart visualization |
| **Circle App Kit** | Cross-chain bridge and Unified Balance |
| **Vercel** | Frontend hosting and deployment |

---

## Smart Contracts

### `CreatorToken.sol`
A custom ERC-20 with a bonding curve pricing model. Price increases as more tokens are minted.

```
Base Price:    1 USDC per token
Price Slope:   +0.001 USDC per token in supply
Platform Fee:  2.5% on every buy and sell
Reserve:       50% of each buy funds a USDC reserve for sellbacks
```

**Access Tiers:**
| Tier | Tokens Required | Perks |
|---|---|---|
| 🥈 Silver | 10+ | Early content access |
| 🥇 Gold | 100+ | Exclusive posts, Discord access |
| 💎 Diamond | 1000+ | Livestreams, DMs, merch drops |

### `SocialTokenFactory.sol`
A registry contract that tracks all deployed creator tokens. The backend deploys `CreatorToken` directly and registers it with the factory.

**Deployed Addresses (Arc Testnet):**
```
SocialTokenFactory: 0x... (update with your deployed address)
USDC:               0x3600000000000000000000000000000000000000
EURC:               0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
```

---

## Project Structure

```
ArcdotFun/
│
├── contracts/                  # Foundry smart contracts
│   ├── src/
│   │   ├── CreatorToken.sol    # ERC-20 with bonding curve + tiers
│   │   └── SocialTokenFactory.sol  # Registry for all creator tokens
│   ├── test/
│   │   └── CreatorToken.t.sol  # Foundry tests
│   ├── script/
│   │   └── Deploy.s.sol        # Deployment script
│   └── foundry.toml
│
├── backend/                    # Node.js + TypeScript API
│   ├── src/
│   │   ├── index.ts            # Express server entry point
│   │   ├── db.ts               # JSON file persistence
│   │   ├── routes/
│   │   │   ├── creator.ts      # Launch token, get creator info
│   │   │   ├── fan.ts          # Token price, tier, activity
│   │   │   └── swap.ts         # StableFX swap endpoint
│   │   ├── services/
│   │   │   ├── circle.ts       # Circle SDK wrapper
│   │   │   └── events.ts       # On-chain event listener
│   │   └── abi/                # Compiled contract ABIs
│   ├── Dockerfile
│   └── railway.json
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Home.tsx        # Discover creators + search
    │   │   ├── Launch.tsx      # Creator token launch form
    │   │   ├── Profile.tsx     # Token page with buy/sell/chart
    │   │   ├── Swap.tsx        # USDC ↔ EURC swap page
    │   │   └── Send.tsx        # Send any Arc token
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── BuyWidget.tsx
    │   │   ├── CreatorCard.tsx
    │   │   ├── PriceChart.tsx
    │   │   └── SendModal.tsx
    │   └── lib/
    │       ├── arc.ts          # Viem client for Arc Testnet
    │       └── api.ts          # Backend API wrapper
    └── vercel.json
```

---

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org)
- [Foundry](https://getfoundry.sh) — `curl -L https://foundry.paradigm.xyz | bash`
- [MetaMask](https://metamask.io) browser extension
- [Circle Developer Account](https://console.circle.com) — free

### 1. Clone the repo

```bash
git clone https://github.com/JohnboscoE/Arcdotfun.git
cd Arcdotfun
```

### 2. Set up contracts

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

Add `contracts/.env`:
```
PRIVATE_KEY=0xYourPrivateKey
PLATFORM_ADDRESS=0xYourWalletAddress
USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

Deploy to Arc Testnet:
```bash
forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.arc.network --broadcast
```

### 3. Set up the backend

```bash
cd ../backend
npm install
```

Create `backend/.env`:
```
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret
PLATFORM_WALLET_ADDRESS=0xYourWalletAddress
PLATFORM_PRIVATE_KEY=0xYourPrivateKey
FACTORY_ADDRESS=0xDeployedFactoryAddress
ARC_RPC=https://rpc.testnet.arc.network
USDC_ADDRESS=0x3600000000000000000000000000000000000000
CIRCLE_KIT_KEY=KIT_KEY:your_kit_key
PORT=3001
```

Run the backend:
```bash
npm run dev
```

### 4. Set up the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
VITE_ARC_RPC=https://rpc.testnet.arc.network
VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000
VITE_CIRCLE_KIT_KEY=KIT_KEY:your_kit_key
```

Run the frontend:
```bash
npm run dev
```

Open `http://localhost:5173`

### 5. Add Arc Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | `https://rpc.testnet.arc.network` |
| Chain ID | `5042002` |
| Symbol | `USDC` |
| Explorer | `https://testnet.arcscan.app` |

### 6. Get testnet USDC

Visit [faucet.circle.com](https://faucet.circle.com), select Arc Testnet, and request USDC to your wallet.

---

## API Endpoints

### Creator Routes
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/creator/launch` | Deploy a new creator token |
| `GET` | `/api/creator/all` | Get all creator tokens |
| `GET` | `/api/creator/:id/status` | Get creator deployment status |

### Fan Routes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/fan/token/:address/info` | Get token price, supply, events |
| `GET` | `/api/fan/:fan/tier/:token` | Get fan's access tier |

### Swap Routes
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/swap` | Execute USDC ↔ EURC swap |

---

## Deployment

### Backend → Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set Root Directory to `backend`
3. Add all environment variables from `backend/.env`
4. Railway auto-deploys on every push

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set Root Directory to `frontend`
3. Set Framework to `Vite`
4. Add environment variables with your Railway URL as `VITE_API_URL`
5. Vercel auto-deploys on every push

---

## Arc Testnet Resources

| Resource | Link |
|---|---|
| Block Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |
| RPC URL | `https://rpc.testnet.arc.network` |
| Circle Faucet | [faucet.circle.com](https://faucet.circle.com) |
| Arc Docs | [docs.arc.io](https://docs.arc.io) |
| Circle Console | [console.circle.com](https://console.circle.com) |

---

## How It Works

```
Creator signs up
    ↓
Backend creates a Circle dev-controlled wallet for them
    ↓
Backend deploys CreatorToken.sol on Arc Testnet
    ↓
Token registered with SocialTokenFactory
    ↓
Fan connects MetaMask → approves USDC → calls buy()
    ↓
Bonding curve mints tokens → price increases
    ↓
Fan holds tokens → unlocks Silver/Gold/Diamond tier
    ↓
Fan can sell() tokens back for USDC from reserve
    ↓
Events stream in real time via Arc's sub-second finality
```

---

## Running Tests

```bash
cd contracts
forge test -vv
```

Expected output:
```
[PASS] test_LaunchToken()
[PASS] test_BuyTokens()
[PASS] test_AccessTier()
```

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Built With on Arc

ArcdotFun is built on [Arc](https://arc.io) — the stablecoin Layer-1 blockchain by Circle. Arc uses USDC as the native gas token, delivers sub-second deterministic finality, and is EVM-compatible — making it the ideal chain for real-world stablecoin applications.

> *"The best way to predict the future is to build it on a stablecoin chain."*