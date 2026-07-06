# Keryx

A per-citation micropayment toll layer for independent publishers. Built for the Lepton Agents Hackathon (Canteen × Circle).

## Overview
Keryx ensures that independent publishers get paid the instant an AI agent grounds an answer in their registered content. It leverages the **x402 protocol**, Circle Gateway, and the Arc Testnet to facilitate gasless, real-time nanopayments (~500ms settlement) in USDC.

## Key Features
- **RSS Ingestion:** Publishers register their content via RSS feeds. Articles are deterministically fingerprinted via SHA-256.
- **x402 Gateway:** A `402 Payment Required` toll layer wraps the citation API, requiring valid payment signatures before releasing the content block.
- **AI Agent Integration:** A demo Q&A agent automatically searches for relevant articles, budgets its USDC, executes the nanopayment, and cites the source.
- **Supabase Realtime:** Publishers can view a live feed of their citations and earnings scaling up.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (Custom dark theme using CSS variables)
- **Database:** Supabase (PostgreSQL)
- **Payments:** `@circle-fin/x402-batching`, Viem, Circle Gateway
- **Network:** Arc Testnet (EVM 5042002)

## Environment Variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ARC_TESTNET_RPC=
SELLER_ADDRESS=
SELLER_PRIVATE_KEY=
BUYER_ADDRESS=
BUYER_PRIVATE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_BASE_URL=
```

## Running Locally
1. `npm install`
2. `npm run dev`
3. Navigate to `http://localhost:3000`

## Deployment
This application is configured for deployment on Vercel. Ensure all environment variables are mapped in your Vercel project settings.

---
*Hackathon Submission Note: This project incorporates components from the arc-nanopayments sample to demonstrate the x402 Gateway capabilities natively integrated into a Next.js App Router environment.*
