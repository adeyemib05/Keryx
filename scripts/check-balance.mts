import { GatewayClient } from "@circle-fin/x402-batching/client";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  let privateKey = '';
  const match = envContent.match(/^BUYER_PRIVATE_KEY=(.*)$/m);
  if (match) privateKey = match[1].trim();

  if (!privateKey) {
    console.error('BUYER_PRIVATE_KEY not found in .env.local');
    process.exit(1);
  }

  const gatewayClient = new GatewayClient({
    chain: "arcTestnet",
    privateKey: privateKey as `0x${string}`,
  });

  const balances = await gatewayClient.getBalances();
  console.log('Gateway balance:', balances.gateway.formattedAvailable);
  console.log('Wallet balance:', balances.wallet.formatted);

  if (balances.gateway.available === 0n) {
    console.log('Gateway balance is zero, depositing 1 USDC...');
    await gatewayClient.deposit("1");
    const newBalances = await gatewayClient.getBalances();
    console.log('New Gateway balance:', newBalances.gateway.formattedAvailable);
  } else {
    console.log('Gateway balance is sufficient.');
  }
}

main().catch(console.error);
