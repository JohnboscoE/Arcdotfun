/// <reference types="vite/client" />

import type { EIP1193Provider } from "viem"

declare global {
  interface Window {
    ethereum?: any
  }
}

export {}
