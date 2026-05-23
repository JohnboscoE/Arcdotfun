import "dotenv/config"
import { initiateDeveloperControlledWalletsClient }
  from "@circle-fin/developer-controlled-wallets"
import { createPublicClient, createWalletClient, http,
         defineChain, decodeEventLog } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load ABIs from compiled artifacts
const creatorTokenArtifact  = JSON.parse(
  readFileSync(join(__dirname, "../abi/CreatorToken.json"), "utf8")
)
const factoryArtifact = JSON.parse(
  readFileSync(join(__dirname, "../abi/SocialTokenFactory.json"), "utf8")
)

const CREATOR_TOKEN_ABI = creatorTokenArtifact.abi
const FACTORY_ABI       = factoryArtifact.abi
const CREATOR_TOKEN_BYTECODE = creatorTokenArtifact.bytecode.object as `0x${string}`

// ── Arc Testnet chain ─────────────────────────────────────────────
const arcTestnet = defineChain({
  id:   5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [process.env.ARC_RPC!] } },
})

// ── Viem clients ──────────────────────────────────────────────────
export const publicClient = createPublicClient({
  chain:     arcTestnet,
  transport: http(process.env.ARC_RPC!),
})

const platformAccount = privateKeyToAccount(
  process.env.PLATFORM_PRIVATE_KEY as `0x${string}`
)

export const walletClient = createWalletClient({
  account:   platformAccount,
  chain:     arcTestnet,
  transport: http(process.env.ARC_RPC!),
})

// ── Circle SDK ────────────────────────────────────────────────────
export const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey:       process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
})

// ── Create a Circle wallet for a creator ─────────────────────────
export async function createCreatorWallet(creatorName: string) {
  const walletSet = await circleClient.createWalletSet({
    name: `${creatorName} WalletSet`,
  })

  const wallet = await circleClient.createWallets({
    blockchains: ["ARC-TESTNET"],
    count:       1,
    walletSetId: walletSet.data?.walletSet?.id ?? "",
    accountType: "SCA",
  })

  return wallet.data?.wallets?.[0]
}

// ── Deploy CreatorToken directly, then register with factory ──────
export async function deployCreatorToken(
  tokenName:      string,
  symbol:         string,
  creatorAddress: string,
) {
  const factoryAddress = process.env.FACTORY_ADDRESS as `0x${string}`
  const usdcAddress    = process.env.USDC_ADDRESS    as `0x${string}`
  const platformAddr   = process.env.PLATFORM_WALLET_ADDRESS as `0x${string}`

  console.log(`📦 Deploying CreatorToken "${tokenName}" (${symbol})...`)


    console.log("factoryAddress:", factoryAddress)
  console.log("usdcAddress:", usdcAddress)
  console.log("platformAddr:", platformAddr)
  console.log("creatorAddress:", creatorAddress)

  // Step 1: Deploy CreatorToken contract directly
  const txHash = await walletClient.deployContract({
    abi:      CREATOR_TOKEN_ABI,
    bytecode: CREATOR_TOKEN_BYTECODE,
    args:     [tokenName, symbol, creatorAddress, usdcAddress, platformAddr],
  })

  console.log(`⛓  Deploy tx sent: ${txHash}`)

  // Step 2: Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  const tokenAddress = receipt.contractAddress

  if (!tokenAddress) throw new Error("Contract address not found in receipt")

  console.log(`✅ CreatorToken deployed at: ${tokenAddress}`)

  // Step 3: Register with factory
  console.log(`📋 Registering with factory...`)
  const registerTx = await walletClient.writeContract({
    address:      factoryAddress,
    abi:          FACTORY_ABI,
    functionName: "registerToken",
    args:         [creatorAddress, tokenAddress, tokenName, symbol],
  })

  await publicClient.waitForTransactionReceipt({ hash: registerTx })
  console.log(`✅ Registered with factory`)

  return { tokenAddress, txHash }
}

// ── Get wallet balance ────────────────────────────────────────────
export async function getWalletBalance(walletId: string) {
  const response = await circleClient.getWalletTokenBalance({ id: walletId })
  return response.data?.tokenBalances
}