import { createGatewayMiddleware } from '@circle-fin/x402-batching/server'

export const gateway = createGatewayMiddleware({
  sellerAddress: process.env.SELLER_ADDRESS as `0x${string}`,
  facilitatorUrl: 'https://gateway-api-testnet.circle.com',
  networks: ['eip155:5042002'], // Arc Testnet chain ID
})
