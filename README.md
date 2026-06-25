# ProveIt

Production-ready Stellar Soroban dApp for paid tasks with on-chain proof verification.

Users create small paid tasks, lock XLM in a smart contract, and release payment when proof is approved. Proof data is stored off-chain; only the proof hash is stored on-chain.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Data:** TanStack React Query v5, Zod
- **Contracts:** Rust, Soroban SDK 25
- **Package manager:** Bun

## Project structure

```
contracts/                  # Soroban smart contracts (Rust)
└── proveit/                # Task escrow contract

src/
├── app/                    # Next.js routes and global styles
├── components/
│   ├── layout/             # App shell, navbar
│   └── ui/                 # shadcn/ui primitives
├── config/                 # App-wide configuration
├── contracts/              # Generated TS bindings (future)
├── features/               # Domain feature modules (future)
├── hooks/                  # Shared React hooks
├── lib/                    # Utilities, env validation
├── providers/              # React context providers
├── services/               # Stellar / Soroban clients (future)
└── types/                  # Shared TypeScript types
```

See [contracts/README.md](contracts/README.md) for contract architecture details.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- Rust 1.84+ and `wasm32v1-none` target

```bash
rustup target add wasm32v1-none
```

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

### Frontend

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

### Contracts

Run from the `contracts/` directory:

| Command                                              | Description                |
| ---------------------------------------------------- | -------------------------- |
| `cargo test`                                         | Run contract unit tests    |
| `cargo build --target wasm32v1-none --release` | Build optimized WASM    |

## Soroban contract

The `proveit` contract supports task creation with on-chain fund locking.

| Function       | Description                                      |
| -------------- | ------------------------------------------------ |
| `initialize`   | Configure the reward token (XLM SAC)             |
| `create_task`  | Lock funds, store task, emit `TaskCreated` event |
| `get_task`     | Read task by ID                                  |
| `get_task_count` | Total tasks created                            |
| `get_token`    | Configured token address                         |

Each task stores `creator`, `reward`, `proof_hash` (placeholder), and `status`. Twelve unit tests cover initialization, validation, fund locking, events, and error paths.

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

## Completed

- [x] Frontend scaffolding (`src/` architecture, layout, theme)
- [x] Soroban contract architecture (`contracts/proveit`)
- [x] Task creation with fund locking and events
- [x] Contract unit tests (12 passing)

## Next steps

- Wallet connection (Freighter / compatible wallets)
- Proof submission and approval handlers
- Payment release on approval
- TypeScript contract bindings and frontend integration
- Off-chain proof storage integration

## License

Private — all rights reserved.
