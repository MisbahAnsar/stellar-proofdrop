# ProveIt

Production-ready Stellar Soroban dApp for paid tasks with on-chain proof verification.

Users create small paid tasks, lock XLM in a smart contract, and release payment when proof is approved. Proof files are stored off-chain (local storage for now); only the SHA-256 hash is stored on-chain.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Wallet:** Freighter (`@stellar/freighter-api`)
- **Stellar:** `@stellar/stellar-sdk` (Soroban RPC)
- **Data:** TanStack React Query v5, React Hook Form, Zod
- **Contracts:** Rust, Soroban SDK 25
- **Package manager:** Bun

## Project structure

```
contracts/                  # Soroban smart contracts (Rust)
└── proveit/                # Task escrow contract

src/
├── app/                    # Next.js routes
├── components/
│   ├── layout/             # App shell, navbar
│   ├── ui/                 # shadcn/ui primitives
│   └── wallet/             # Wallet connect / status UI
├── config/                 # Site and Stellar network config
├── features/tasks/         # Task forms, proof submission, hooks, event sync
├── hooks/                  # Shared React hooks
├── lib/
│   ├── events/             # In-app task event bus
│   ├── proof/              # SHA-256 hashing and file validation
│   └── stellar/            # Amount helpers, errors
├── providers/              # React Query, wallet context
├── services/
│   ├── proofs/             # Local proof file storage
│   ├── stellar/            # Soroban transaction helpers
│   ├── tasks/              # Off-chain task metadata store
│   └── wallet/             # Freighter integration
└── types/                  # Shared TypeScript types
```

See [contracts/README.md](contracts/README.md) for contract architecture details.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- [Freighter](https://www.freighter.app/) browser extension
- Rust 1.84+ and `wasm32v1-none` target (for contracts)

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

| Variable                          | Description                              | Default                 |
| --------------------------------- | ---------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`             | Public app URL                           | `http://localhost:3000` |
| `NEXT_PUBLIC_STELLAR_NETWORK`     | Stellar network (`testnet` \| `mainnet`) | `testnet`               |
| `NEXT_PUBLIC_SOROBAN_RPC_URL`     | Soroban RPC endpoint (optional)          | network default         |
| `NEXT_PUBLIC_PROVEIT_CONTRACT_ID` | Deployed ProveIt contract ID             | —                       |

Environment variables are validated at runtime via `src/lib/env.ts`.

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Frontend features

### Wallet

- Connect / disconnect via Freighter
- Wallet status in navbar (truncated address + network)
- Session hydration on page load

### Create Task (`/create`)

- Zod-validated form: title, description, reward (XLM), optional deadline
- Full Soroban transaction flow: prepare → sign → submit → confirm
- Pending, success, and failed states with inline status UI
- Toast notifications for each transaction phase
- Parses `TaskCreated` contract events from confirmed transactions
- Off-chain metadata stored in `localStorage` (title, description, deadline)
- Task list refreshes automatically via React Query (no page reload)

### Submit Proof (`/tasks/[taskId]`)

Workers open a task, upload proof, and submit only the hash on-chain:

1. **File validation** — JPEG, PNG, WebP, PDF, or plain text up to 5 MB
2. **Proof preview** — local preview of the selected or stored proof file
3. **SHA-256 hash** — computed client-side before any chain call
4. **Local storage** — full proof file saved in `localStorage` (mock off-chain store)
5. **On-chain submit** — `submit_proof` stores the 32-byte hash and sets status to `ProofSubmitted`
6. **Loading states** — hashing, transaction pending, success, and error UI
7. **Creator verification** — compares local proof hash against the on-chain hash

### Task list & events

- Home (`/`) and Dashboard (`/dashboard`) show live task lists with links to task detail
- `taskEventBus` broadcasts local create/update/refresh events across pages
- Background Soroban RPC `getEvents` listener polls for `task_created` events
- React Query invalidation keeps lists in sync after on-chain confirmation

### Dashboard (`/dashboard`)

- Wallet status overview
- Funded tasks with reward, deadline, and ledger metadata

## Scripts

### Frontend

| Command                | Description              |
| ---------------------- | ------------------------ |
| `bun dev`              | Start development server |
| `bun run build`        | Production build         |
| `bun start`            | Start production server  |
| `bun run test`         | Run Vitest unit tests    |
| `bun run test:watch`   | Run Vitest in watch mode |
| `bun run lint`         | Run ESLint               |
| `bun run lint:fix`     | Run ESLint with auto-fix |
| `bun run format`       | Format with Prettier     |
| `bun run format:check` | Check formatting         |
| `bun run typecheck`    | TypeScript type check    |

### Contracts

Run from the `contracts/` directory:

| Command                                        | Description             |
| ---------------------------------------------- | ----------------------- |
| `cargo test`                                   | Run contract unit tests |
| `cargo build --target wasm32v1-none --release` | Build optimized WASM    |

## Soroban contract

The `proveit` contract supports task creation with on-chain fund locking and proof submission.

| Function         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `initialize`     | Configure the reward token (XLM SAC)                |
| `create_task`    | Lock funds, store task, emit `TaskCreated` event      |
| `submit_proof`   | Worker submits proof hash, emits `ProofSubmitted`   |
| `get_task`       | Read task by ID                                     |
| `get_task_count` | Total tasks created                                 |
| `get_token`      | Configured token address                            |

Each task stores `creator`, `reward`, `proof_hash`, and `status`. Eighteen unit tests cover initialization, validation, fund locking, proof submission, events, and error paths.

> **Note:** Redeploy the contract after pulling `submit_proof` changes before testing proof submission on testnet.

## Tooling

### Tailwind CSS

- Tailwind v4 with PostCSS (`postcss.config.mjs`)
- Theme tokens in `src/app/globals.css`
- Light theme only: white background, gray borders, no gradients

### shadcn/ui

- Initialized with `components.json`
- Add components: `bunx shadcn@latest add <component>`

## UI conventions

- **Light theme only** — no dark mode
- **White background** (`--background`)
- **Gray borders** (`--border`)
- **Minimal aesthetic** — no gradients

## Completed

- [x] Frontend scaffolding (`src/` architecture, layout, theme)
- [x] Soroban contract architecture (`contracts/proveit`)
- [x] Task creation with fund locking and events
- [x] Contract unit tests (18 passing)
- [x] Freighter wallet connect / disconnect / status
- [x] Create Task page with Zod validation
- [x] Soroban contract integration with transaction flow and events
- [x] Toast notifications and automatic task list refresh
- [x] Dashboard with local task metadata
- [x] Proof submission (hash on-chain, file in local storage)
- [x] Proof preview, validation, loading states, and creator verification
- [x] Frontend unit tests (Vitest)

## Next steps

- Creator approval / rejection handlers
- Payment release on approval
- Backend for off-chain task metadata and proof storage

## License

Private — all rights reserved.
