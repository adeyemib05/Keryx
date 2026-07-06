import { createPublicClient, createWalletClient, http, parseUnits, erc20Abi, getAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  const pk = envContent.match(/^BUYER_PRIVATE_KEY=(.*)$/m)?.[1].trim()
  if (!pk) throw new Error("No PK")
  
  const account = privateKeyToAccount(pk as `0x${string}`)
  console.log("Account:", account.address)

  const publicClient = createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") })
  const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") })

  const usdcAddr = getAddress('0x3600000000000000000000000000000000000000')
  const gatewayAddr = getAddress('0x356bdC6dcA493026bcFdeBBcbcfAeb6E2a06bb27') // Checksummed GatewayWallet on Arc Testnet
  const amount = parseUnits('1', 6) // 1 USDC

  console.log("Approving...")
  const tx1 = await walletClient.writeContract({
    address: usdcAddr,
    abi: erc20Abi,
    functionName: 'approve',
    args: [gatewayAddr, amount],
    chain: arcTestnet,
    account
  })
  await publicClient.waitForTransactionReceipt({ hash: tx1 })
  console.log("Approve TX:", tx1)

  console.log("Depositing...")
  const tx2 = await walletClient.writeContract({
    address: gatewayAddr,
    abi: [{
      "inputs": [{"type": "address", "name": "token"}, {"type": "uint256", "name": "amount"}],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }],
    functionName: 'deposit',
    args: [usdcAddr, amount],
    chain: arcTestnet,
    account
  })
  await publicClient.waitForTransactionReceipt({ hash: tx2 })
  console.log("Deposit TX:", tx2)
  console.log("Done!")
}

main().catch(console.error)
