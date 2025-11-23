const crypto = require('crypto')
const readline = require('readline')
require('dotenv').config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const algorithm = 'aes-256-gcm'

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function generateMasterKey() {
  // Generate 32 random bytes and encode as base64
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('base64')
}

function encrypt(text, secretKey) {
  const masterKey = process.env.DB_MASTER_KEY || 'default-salt'
  const key = crypto.scryptSync(secretKey, masterKey, 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText, secretKey) {
  const masterKey = process.env.DB_MASTER_KEY || 'default-salt'
  const key = crypto.scryptSync(secretKey, masterKey, 32)
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

async function main() {
  const mode = process.argv[2]

  if (mode === 'encrypt') {
    const text = await question('Enter string to encrypt: ')
    const key = await question('Enter encryption key: ')
    const encrypted = encrypt(text, key)
    console.log('\nEncrypted string:')
    console.log(encrypted)
  } else if (mode === 'decrypt') {
    const text = await question('Enter encrypted string: ')
    const key = await question('Enter encryption key: ')
    try {
      const decrypted = decrypt(text, key)
      console.log('\nDecrypted string:')
      console.log(decrypted)
    } catch (error) {
      console.log('\nError: Invalid encrypted string or wrong key')
    }
  } else if (mode === 'generate-key') {
    const masterKey = generateMasterKey()
    console.log('\nGenerated Master Key (Base64):')
    console.log(masterKey)
    console.log('\nAdd this to your .env file as:')
    console.log(`MASTER_KEY=${masterKey}`)
  } else {
    console.log('Usage:')
    console.log('  npm run encryptstr    - Encrypt a string')
    console.log('  npm run decryptstr    - Decrypt a string')
    console.log('  npm run generatekey    - Generate a new master key')
  }

  rl.close()
}

main()