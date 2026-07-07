# Keryx — Pay-Per-Citation AI Agent

> **Lepton Agents Hackathon submission** (Canteen × Circle) — [Live Demo](https://keryx-iota.vercel.app)

Keryx is the first AI agent that **pays publishers every time it cites their work**, using Circle's `x402` micropayment protocol on the Arc Testnet. It is a full toll layer for the agent-first internet.

---

## The Problem

AI agents consume publisher content at scale to answer user questions — often without compensating the original creators. Keryx solves this with a machine-to-machine payment rail: every citation costs the agent a small USDC fee, which flows instantly to the publisher's wallet.

---

## How It Works

```
User asks a question
       ↓
Agent identifies knowledge gaps (Groq / Llama 3.3)
       ↓
Agent fetches free previews of candidate articles
       ↓
Agent decides: PAY or SKIP based on relevance
       ↓
Circle Gateway pays the cite endpoint via x402 (Arc Testnet)
       ↓
Publisher receives USDC; citation receipt stored on-chain
       ↓
Agent integrates paid content into final answer
```

---

## Key Features

| Feature | Details |
|---|---|
| **x402 Paywall** | `402 Payment Required` toll layer on every citation endpoint |
| **AI Agent** | 5-step ReAct loop: Plan → Draft → Evaluate → Pay → Reflect |
| **RSS Ingestion** | Publishers register via RSS; articles SHA-256 fingerprinted |
| **Sybil Prevention** | Domain ownership verified via DNS TXT records |
| **Data Freshness** | Vercel Cron job re-ingests all RSS feeds every hour |
| **Publisher Dashboard** | Live USDC earnings, citations, Arc Explorer links |
| **Transaction Explorer** | Live on-chain tx table with Arc Testnet links |
| **Mobile Responsive** | Sliding drawer sidebar, responsive header |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, `nodejs` runtime) |
| Payments | `@circle-fin/x402-batching`, Circle Gateway, Viem |
| Network | Arc Testnet (Chain ID: 5042002) |
| LLM | Groq `llama-3.3-70b-versatile` |
| Database | Supabase (PostgreSQL + Realtime) |
| Deployment | Vercel (with Cron) |

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ARC_TESTNET_RPC=
SELLER_ADDRESS=
SELLER_PRIVATE_KEY=
BUYER_ADDRESS=
BUYER_PRIVATE_KEY=
GROQ_API_KEY=
NEXT_PUBLIC_BASE_URL=
CRON_SECRET=          # Optional: secures /api/cron endpoint
```

---

## Running Locally

```bash
npm install
npm run dev
# Navigate to http://localhost:3000
```

---

## Deployment

Configured for Vercel. All env vars must be set in the Vercel dashboard. The `vercel.json` configures a cron job to refresh RSS feeds every hour automatically.

---

> [!WARNING]
> **Security Disclaimer** — This is a hackathon prototype for the Arc Testnet only.
> - **Private Keys**: The buyer agent's private key is read from environment variables in the serverless function. This is **not safe for production**. A real system must use a KMS or MPC wallet..
> - **Domain Verification**: DNS TXT verification is implemented but can be bypassed via `DEMO_MODE=true`. Disable this for production.
> - **Do not use with real funds.**

*Hackathon Submission — This project incorporates components from the arc-nanopayments sample to demonstrate x402 Gateway capabilities natively in a Next.js App Router environment.*
