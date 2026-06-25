# ProveIt

Production-ready Stellar Soroban dApp for paid tasks with on-chain proof verification.

Users create small paid tasks, lock XLM in a smart contract, and release payment when proof is approved. Proof data is stored off-chain; only the proof hash is stored on-chain.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-nova)
- **Data fetching:** TanStack React Query v5
- **Validation:** Zod
- **Package manager:** Bun

## Project structure

```
src/
├── app/                  # Next.js routes and global styles
├── components/
│   ├── layout/           # App shell, navbar
│   └── ui/               # shadcn/ui primitives
├── config/               # App-wide configuration
├── contracts/            # Soroban bindings (future)
├── features/             # Domain feature modules (future)
├── hooks/                # Shared React hooks
├── lib/                  # Utilities, env validation
├── providers/            # React context providers
├── services/             # Stellar / Soroban clients (future)
└── types/                # Shared TypeScript types
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+

### Install

```bash
bun install
```

### Environment variables

Copy the example file and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable                      | Description                              | Default                 |
| ----------------------------- | ---------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`         | Public app URL                           | `http://localhost:3000` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network (`testnet` \| `mainnet`) | `testnet`               |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint (optional)          | —                       |

Environment variables are validated at runtime via `src/lib/env.ts`.

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `bun dev`              | Start development server |
| `bun run build`        | Production build         |
| `bun start`            | Start production server  |
| `bun run lint`         | Run ESLint               |
| `bun run lint:fix`     | Run ESLint with auto-fix |
| `bun run format`       | Format with Prettier     |
| `bun run format:check` | Check formatting         |
| `bun run typecheck`    | TypeScript type check    |

## Tooling

### Tailwind CSS

- Tailwind v4 with PostCSS (`postcss.config.mjs`)
- Theme tokens in `src/app/globals.css`
- Light theme only: white background, gray borders, no gradients

### shadcn/ui

- Initialized with `components.json`
- Add components: `bunx shadcn@latest add <component>`

### ESLint

- `eslint-config-next` (core-web-vitals + TypeScript)
- `eslint-config-prettier` to avoid rule conflicts

### Prettier

- `prettier-plugin-tailwindcss` for class sorting
- Config: `.prettierrc`

## UI conventions

- **Light theme only** — no dark mode
- **White background** (`--background`)
- **Gray borders** (`--border`)
- **Minimal aesthetic** — no gradients

## Completed (scaffolding)

- [x] Scalable `src/` folder architecture
- [x] Required libraries installed
- [x] shadcn/ui configured
- [x] Tailwind CSS v4 configured with theme variables
- [x] ESLint + Prettier configured
- [x] Environment variable setup with Zod validation
- [x] React Query provider
- [x] Reusable app layout and responsive shell
- [x] Navbar with mobile navigation
- [x] Light-only minimal theme

## Next steps

- Soroban smart contract
- Wallet connection (Freighter / compatible wallets)
- Task creation, proof submission, and approval flows
- Off-chain proof storage integration

## License

Private — all rights reserved.
