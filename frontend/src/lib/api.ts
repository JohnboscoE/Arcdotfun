import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export async function launchCreatorToken(data: {
  creatorName: string
  tokenName:   string
  symbol:      string
  description: string
  walletAddress: string  // ← added
}) {
  const res = await api.post("/api/creator/launch", data)
  return res.data
}

export async function getCreatorStatus(creatorId: string) {
  const res = await api.get(`/api/creator/${creatorId}/status`)
  return res.data
}

export async function getAllCreators() {
  const res = await api.get("/api/creator/all")
  return res.data
}

export async function getTokenInfo(tokenAddress: string) {
  const res = await api.get(`/api/fan/token/${tokenAddress}/info`)
  return res.data
}

export async function getFanTier(fanAddress: string, tokenAddress: string) {
  const res = await api.get(`/api/fan/${fanAddress}/tier/${tokenAddress}`)
  return res.data
}

// Add this to the bottom of api.ts
export async function executeSwap(data: {
  tokenIn:    string
  tokenOut:   string
  amountIn:   string
  fanAddress?: string
}) {
  const res = await api.post("/api/swap", data)
  return res.data
}