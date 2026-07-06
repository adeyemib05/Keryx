/**
 * fund-buyer.mts — minimal, focused version
 * Just does the deposit. No balance checks that hang.
 * Run: cmd /c npx tsx scripts/fund-buyer.mts
 */

import { GatewayClient } from '@circle-fin/x402-batching/client'
import * as fs from 'fs'
import * as path from 'path'

process.stdout.write('=== fund-buyer starting ===\n')

// Load the private key
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const pkMatch = envContent.match(/^BUYER_PRIVATE_KEY=(.*)$/m)
const BUYER_PK = (pkMatch ? pkMatch[1].trim() : '') as `0x${string}`
const addrMatch = envContent.match(/^BUYER_ADDRESS=(.*)$/m)
const BUYER_ADDR = addrMatch ? addrMatch[1].trim() : '(unknown)'

process.stdout.write(`Buyer address: ${BUYER_ADDR}\n`)
process.stdout.write(`Private key loaded: ${BUYER_PK ? 'YES (' + BUYER_PK.slice(0, 8) + '...)' : 'NO'}\n`)

if (!BUYER_PK || BUYER_PK.length < 10) {
  process.stderr.write('ERROR: BUYER_PRIVATE_KEY not found\n')
  process.exit(1)
}

process.stdout.write('Creating GatewayClient...\n')
const gateway = new GatewayClient({
  chain: 'arcTestnet',
  privateKey: BUYER_PK,
})
process.stdout.write('GatewayClient created.\n')

// ── Check balances with a timeout ──────────────────────────────────────────
process.stdout.write('Checking balances (timeout: 20s)...\n')
const balanceTimeout = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('getBalances timed out after 20s')), 20_000)
)

let walletUsdc = '(unknown)'
let gatewayUsdc = '(unknown)'
let walletBal = 0n
let gatewayBal = 0n

try {
  const balances = await Promise.race([gateway.getBalances(), balanceTimeout])
  walletBal = balances.wallet.balance
  gatewayBal = balances.gateway.available
  walletUsdc = balances.wallet.formatted
  gatewayUsdc = balances.gateway.formattedAvailable
  process.stdout.write(`  Wallet USDC (ERC-20) : ${walletUsdc}\n`)
  process.stdout.write(`  Gateway balance      : ${gatewayUsdc}\n`)
} catch (e: any) {
  process.stderr.write(`getBalances failed: ${e.message}\n`)
  process.stderr.write('Proceeding to deposit attempt anyway...\n')
}

// ── Deposit ────────────────────────────────────────────────────────────────
if (gatewayBal > 0n) {
  process.stdout.write(`\nGateway already has ${gatewayUsdc} — no deposit needed!\n`)
  process.stdout.write('You can restart the dev server and test the agent now.\n')
  process.exit(0)
}

process.stdout.write('\nGateway balance is 0. Attempting deposit of 1 USDC...\n')

const depositTimeout = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('deposit timed out after 120s')), 120_000)
)

try {
  const depositResult = await Promise.race([gateway.deposit('1'), depositTimeout])
  process.stdout.write(`  Approve tx : ${(depositResult as any).approveTxHash ?? '(skipped)'}\n`)
  process.stdout.write(`  Deposit tx : ${(depositResult as any).depositTxHash}\n`)
} catch (e: any) {
  process.stderr.write(`\nDEPOSIT FAILED: ${e.message}\n`)
  if (e.cause) process.stderr.write(`Cause: ${JSON.stringify(e.cause)}\n`)
  if (e.details) process.stderr.write(`Details: ${e.details}\n`)
  process.exit(1)
}

// ── Final check ────────────────────────────────────────────────────────────
process.stdout.write('\nChecking final balance...\n')
try {
  const final = await Promise.race([gateway.getBalances(), balanceTimeout])
  process.stdout.write(`  Gateway balance after deposit: ${final.gateway.formattedAvailable}\n`)
  if (final.gateway.available > 0n) {
    process.stdout.write('\n✅ Success! Gateway funded. Restart dev server and test.\n')
  } else {
    process.stdout.write('\n⚠️ Gateway still zero — deposit may still be confirming.\n')
  }
} catch {
  process.stdout.write('Could not re-check balance. Check Gateway dashboard.\n')
}
