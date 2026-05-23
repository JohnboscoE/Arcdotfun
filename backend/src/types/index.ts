export interface Creator {
  id: string
  name: string
  symbol: string
  walletAddress: string
  tokenAddress?: string
  contractId?: string
  description?: string
  createdAt: string
}

export interface DeployTokenRequest {
  creatorName: string
  tokenName: string
  symbol: string
  walletAddress: string
  description?: string
}

export interface BuyTokenRequest {
  fanAddress: string
  tokenAddress: string
  usdcAmount: string
}