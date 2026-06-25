# ProveIt

[![CI](https://github.com/MisbahAnsar/stellar-proofdrop/actions/workflows/ci.yml/badge.svg)](https://github.com/MisbahAnsar/stellar-proofdrop/actions/workflows/ci.yml)

Paid tasks with on-chain proof verification on **Stellar Soroban**.

Creators fund tasks with XLM locked in a smart contract. Workers submit proof off-chain; only a **SHA-256 hash** is stored on-chain. Creators review submissions and release payment on approval.

## Screenshots

> Add images to [`docs/screenshots/`](docs/screenshots/) and uncomment the lines below.

<!--
![Home task list](docs/screenshots/home.png)
![Create task](docs/screenshots/create-task.png)
![Submit proof](docs/screenshots/submit-proof.png)
![Dashboard](docs/screenshots/dashboard.png)
![Creator review](docs/screenshots/review.png)
-->

_Placeholder — screenshots coming soon._

## Features

- Freighter wallet connect / disconnect
- Create funded tasks on Soroban testnet
- Proof upload with client-side hashing and local preview
- Creator approve / reject with automatic payment release
- Live dashboard with event-driven updates (no manual refresh)
- Accessible UI: skeletons, empty states, error boundaries

## Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui |
| State | TanStack React Query, React Hook Form, Zod |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Chain | `@stellar/stellar-sdk`, Soroban RPC |
| Contracts | Rust, Soroban SDK 25 |
| Tooling | Bun, Vitest, ESLint, Prettier, GitHub Actions |

## Installation

### Prerequisites

- [Bun](https://bun.sh) 1.1+ (or Node.js 20+)
- [Freighter](https://www.freighter.app/) browser extension
- [Rust](https://rustup.rs/) 1.84+ (for contracts only)
- Stellar CLI / Soroban CLI (for contract deployment)

```bash
rustup target add wasm32v1-none
```

### Setup

```bash
git clone https://github.com/MisbahAnsar/stellar-proofdrop.git
cd stellar-proofdrop
bun install
cp .env.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_PROVEIT_CONTRACT_ID` after deploying the contract (see [Deployment](#deployment)).

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
bun run build
bun start
```

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`:

| Variable | Required | Description | Default |
| -------- | -------- | ----------- | ------- |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | No | `testnet` or `mainnet` | `testnet` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | No | Custom Soroban RPC URL | Network default |
| `NEXT_PUBLIC_PROVEIT_CONTRACT_ID` | Yes* | Deployed contract ID (`C…`) | — |

\*Required for on-chain flows. Validated at runtime in [`src/lib/env.ts`](src/lib/env.ts).

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Next.js App]
    Wallet[Freighter Wallet]
    LS[(localStorage)]
    UI --> Wallet
    UI --> LS
  end

  subgraph offchain [Off-chain today]
    Meta[Task metadata]
    Proof[Proof files]
    Activity[Activity feed]
    LS --- Meta
    LS --- Proof
    LS --- Activity
  end

  subgraph chain [Stellar Soroban]
    Contract[ProveIt Contract]
    SAC[XLM SAC]
    Contract --> SAC
  end

  UI -->|sign tx| Wallet
  UI -->|Soroban RPC| Contract
  Contract -->|events| UI
```

**Design principles**

1. **Funds on-chain** — rewards are locked in the ProveIt contract until approval.
2. **Proof off-chain** — file content stays local; only the hash is stored on-chain.
3. **Event-driven UI** — `taskEventBus` + React Query keep lists in sync without reloads.
4. **Thin client** — transaction helpers in `src/services/stellar/` follow prepare → sign → submit → confirm.

### Task lifecycle

```
Open → ProofSubmitted → Approved (payment released)
                    ↘ Rejected → Open (resubmit)
```

## Folder structure

```
stellar-proofdrop/
├── .github/workflows/     # CI (lint, test, build)
├── contracts/
│   └── proveit/           # Soroban escrow contract (Rust)
├── docs/
│   └── screenshots/       # README screenshot assets
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/
│   │   ├── feedback/      # Error fallback, loading regions
│   │   ├── layout/        # Shell, navbar, page header
│   │   ├── skeletons/     # Loading skeletons
│   │   ├── ui/            # shadcn/ui primitives
│   │   └── wallet/        # Freighter controls
│   ├── config/            # Site + Stellar network config
│   ├── features/
│   │   ├── dashboard/     # Dashboard sections + activity
│   │   └── tasks/         # Forms, hooks, task UI
│   ├── lib/
│   │   ├── dashboard/     # Filters, activity helpers
│   │   ├── events/        # In-app event bus
│   │   ├── proof/         # Hashing + validation
│   │   └── stellar/       # Amounts, errors
│   ├── providers/         # React Query, wallet, event sync
│   ├── services/
│   │   ├── activity/      # Activity localStorage store
│   │   ├── proofs/        # Proof file store
│   │   ├── stellar/       # Soroban transactions + events
│   │   ├── tasks/         # Task metadata store
│   │   └── wallet/        # Freighter integration
│   └── types/             # Shared TypeScript types
├── .env.example
├── vitest.config.ts
└── package.json
```

Contract details: [`contracts/README.md`](contracts/README.md)

## Soroban contract

The `proveit` contract escrows XLM and coordinates the task lifecycle.

| Function | Who calls | Effect |
| -------- | --------- | ------ |
| `initialize` | Admin | Set reward token (XLM SAC) |
| `create_task` | Creator | Lock XLM, emit `task_created` |
| `submit_proof` | Worker | Store proof hash, emit `proof_submitted` |
| `approve_task` | Creator | Pay worker, emit `task_approved` |
| `reject_task` | Creator | Reopen task, emit `task_rejected` |
| `get_task` | Anyone | Read task state |
| `get_task_count` | Anyone | Total tasks |

**On-chain task fields:** `creator`, `reward`, `proof_hash`, `worker`, `status`

**Events:** `task_created`, `proof_submitted`, `task_approved`, `task_rejected`

Build and test:

```bash
bun run test:contracts
cd contracts && cargo build --target wasm32v1-none --release
```

Redeploy the contract after pulling contract changes before testing on testnet.

## Demo instructions

End-to-end walkthrough on **Stellar testnet**:

### 1. Prepare wallets

- Install [Freighter](https://www.freighter.app/)
- Switch Freighter to **Testnet**
- Fund two accounts from a [friendbot faucet](https://laboratory.stellar.org/#account-creator?network=testnet) (creator + worker)

### 2. Deploy contract

Deploy `contracts/proveit` with your preferred Soroban workflow, then copy the contract ID into `.env.local`:

```env
NEXT_PUBLIC_PROVEIT_CONTRACT_ID=C...
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

Restart `bun dev`.

### 3. Create a task (creator wallet)

1. Open `/create` and connect Freighter as the **creator**
2. Fill title, description, reward (e.g. `1` XLM), optional deadline
3. Submit and approve the transaction in Freighter
4. Confirm the task appears on `/` and `/dashboard`

### 4. Submit proof (worker wallet)

1. Open the task from the home list (`/tasks/[id]`)
2. Connect Freighter as the **worker**
3. Upload a proof file (JPEG, PNG, WebP, PDF, or text ≤ 5 MB)
4. Submit proof — only the hash is written on-chain

### 5. Review (creator wallet)

1. Open `/dashboard` as the **creator**
2. Find the task under **Pending reviews**
3. **Approve** to release XLM to the worker, or **Reject** to reopen the task

Activity and lists update automatically via event subscriptions.

## Deployment

### Frontend (Vercel recommended)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables (same as `.env.example`)
4. Build command: `bun run build`
5. Install command: `bun install`

Works on any Node-compatible host — set `NEXT_PUBLIC_*` vars at build time.

### Contract (testnet)

```bash
cd contracts
cargo build --target wasm32v1-none --release
# Deploy with Stellar/Soroban CLI — see Stellar docs for your CLI version
```

After deployment:

1. Call `initialize` with the testnet XLM SAC address
2. Set `NEXT_PUBLIC_PROVEIT_CONTRACT_ID` in your frontend environment
3. Redeploy the frontend

## Testing

| Suite | Command | Count |
| ----- | ------- | ----- |
| Frontend | `bun run test:frontend` | 20 tests |
| Contracts | `bun run test:contracts` | 28 tests |
| Full CI locally | `bun run ci` | lint + typecheck + tests + build |

GitHub Actions runs on every push/PR to `main`: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Developer notes

### Scripts

| Command | Description |
| ------- | ----------- |
| `bun dev` | Development server |
| `bun run build` | Production build |
| `bun run lint` / `lint:fix` | ESLint |
| `bun run format` | Prettier |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test:watch` | Vitest watch mode |

### Conventions

- **Light theme only** — white background, gray borders, no gradients
- **Feature folders** — colocate UI, hooks, and schemas under `src/features/`
- **Services** — side effects (RPC, storage) live in `src/services/`
- **Event bus** — `taskEventBus` for cross-page refresh without prop drilling
- **Transactions** — use `signAndSubmitTransaction` in `src/services/stellar/transaction.ts`

### Adding shadcn components

```bash
bunx shadcn@latest add <component>
```

### Local storage limitation

Task metadata and proof files are stored in `localStorage` for demo purposes. They are **per-browser** and not shared across devices. A backend is planned for production use.

## Future improvements

- [ ] Backend API for task metadata and proof storage (IPFS/S3)
- [ ] On-chain `get_task` reads in the UI for cross-device consistency
- [ ] Task cancellation and creator refunds
- [ ] Deadline enforcement
- [ ] Mainnet deployment guide and audited contract release
- [ ] Multi-asset rewards beyond XLM SAC
- [ ] Notification webhooks for proof submissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `bun run ci` before opening a PR
4. Open a pull request with a clear description

## License

[MIT](LICENSE)
