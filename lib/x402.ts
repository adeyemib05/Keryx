import { createGatewayMiddleware } from '@circle-fin/x402-batching/server'

export const gateway = createGatewayMiddleware({
  sellerAddress: (process.env.SELLER_ADDRESS && process.env.SELLER_ADDRESS !== '0xBbf5864a4184A09abf030B19f54e9C082c217D5c') 
    ? process.env.SELLER_ADDRESS as `0x${string}` 
    : '0x805f25445febeda4f8a42a6b92c966e0767dc3f2',
  facilitatorUrl: 'https://gateway-api-testnet.circle.com',
  networks: ['eip155:5042002'], // Arc Testnet chain ID
})
