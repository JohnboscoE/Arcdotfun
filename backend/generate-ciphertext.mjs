import forge from "node-forge"
import https from "https"

const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET
const API_KEY       = process.env.CIRCLE_API_KEY

// Step 1: Fetch your entity public key from Circle
function getPublicKey() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.circle.com",
      path:     "/v1/w3s/config/entity/publicKey",
      method:   "GET",
      headers:  { Authorization: `Bearer ${API_KEY}` },
    }
    https.get(options, (res) => {
      let data = ""
      res.on("data", chunk => data += chunk)
      res.on("end", () => {
        const json = JSON.parse(data)
        resolve(json.data.publicKey)
      })
    }).on("error", reject)
  })
}

// Step 2: Encrypt entity secret with that public key
function encryptEntitySecret(publicKeyPem, entitySecret) {
  const publicKey    = forge.pki.publicKeyFromPem(publicKeyPem)
  const secretBytes  = forge.util.hexToBytes(entitySecret)
  const encrypted    = publicKey.encrypt(secretBytes, "RSA-OAEP", {
    md:  forge.md.sha256.create(),
    mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
  })
  return forge.util.encode64(encrypted)
}

// Run it
const publicKey  = await getPublicKey()
const ciphertext = encryptEntitySecret(publicKey, ENTITY_SECRET)

console.log("\n  Entity Secret Ciphertext:\n")
console.log(ciphertext)
console.log("\n Circle Console → Wallets → Configurator\n")