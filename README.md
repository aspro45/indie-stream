# IndieStream

A **decentralized Indie Media Streaming App** built on [Next.js](https://nextjs.org) and [Shelby Protocol](https://shelby.xyz) — decentralized hot-storage on the Aptos blockchain.

## Features

- 🎬 **Upload Dashboard** — Drag & drop audio/video files, uploaded to Shelby's decentralized network
- 🔍 **Content Feed** — Browse all media with gradient thumbnails and metadata
- ▶️ **Media Player** — Stream directly from Shelby's fast retrieval URLs
- 👤 **Wallet Accounts** — Connect your Aptos wallet (Petra, etc.) to track your uploads

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Storage | [Shelby Protocol](https://shelby.xyz) — decentralized hot-storage on Aptos |
| Blockchain | Aptos Testnet |
| Wallet | `@aptos-labs/wallet-adapter-react` |
| Styling | Vanilla CSS with dark theme |

## Getting Started

### Prerequisites

1. **Shelby API Key** — Get one at [docs.shelby.xyz](https://docs.shelby.xyz/sdks/typescript/acquire-api-keys)
2. **Aptos Account** — Fund with APT (testnet faucet) + ShelbyUSD (Shelby Discord)

### Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Fill in your keys in .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SHELBY_API_KEY=your_shelby_api_key
```

> That's it! No private key or account address needed — uploads are signed directly by the user's Aptos wallet in the browser.

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**
4. Deploy!

> **Note**: The JSON metadata store (`data/media.json`) is a local MVP approach. For production, swap in a persistent database.

## Architecture

```
Upload (browser) → API Route (server) → Shelby SDK → Shelby Network (Aptos)
                                      → data/media.json (metadata)

Stream (browser) ← HTML5 <video/audio> ← https://api.testnet.shelby.xyz/shelby/v1/blobs/{addr}/{name}
```

## Links

- [Shelby Protocol Docs](https://docs.shelby.xyz)
- [Aptos Testnet Faucet](https://aptos.dev/network/faucet)
- [Shelby Discord](https://discord.gg/shelbyprotocol)
