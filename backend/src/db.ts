import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH   = join(__dirname, "../../db.json")

interface Creator {
  id:            string
  name:          string
  tokenName:     string
  symbol:        string
  description:   string
  walletId:      string
  walletAddress: string
  tokenAddress:  string
  txHash:        string
  status:        string
  createdAt:     string
}

interface DB {
  creators: Record<string, Creator>
}

// Load DB from disk
function load(): DB {
  if (!existsSync(DB_PATH)) return { creators: {} }
  const raw = readFileSync(DB_PATH, "utf8")
  return JSON.parse(raw) as DB
}

// Save DB to disk
function save(data: DB): void {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export const db = {
  getCreators(): Record<string, Creator> {
    return load().creators
  },

  getCreator(id: string): Creator | undefined {
    return load().creators[id]
  },

  saveCreator(creator: Creator): void {
    const data = load()
    data.creators[creator.id] = creator
    save(data)
  },

  getAllCreators(): Creator[] {
    return Object.values(load().creators)
  },
}