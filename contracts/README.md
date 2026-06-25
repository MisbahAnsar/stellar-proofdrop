# ProveIt Soroban Contracts

Rust smart contracts for the ProveIt task escrow protocol on Stellar Soroban.

## Layout

```
contracts/
├── Cargo.toml              # Workspace manifest
└── proveit/
    └── src/
        ├── lib.rs          # Crate entry, public exports
        ├── contract.rs     # Contract interface and handlers
        ├── errors.rs       # Typed contract errors
        ├── events/         # On-chain event definitions
        │   ├── mod.rs
        │   ├── task_created.rs
        │   └── proof_submitted.rs
        ├── storage/        # Persistence keys and helpers
        │   ├── keys.rs
        │   └── mod.rs
        ├── types/          # Domain models
        │   ├── task.rs     # Task, TaskStatus
        │   └── mod.rs
        └── tests/          # Unit tests
            ├── common.rs   # Test harness helpers
            ├── contract.rs
            └── proof.rs
```

## Implemented

| Capability       | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `initialize`     | Registers the reward token contract (XLM SAC)                |
| `create_task`    | Locks reward funds, stores task state, emits `TaskCreated`     |
| `submit_proof`   | Worker stores proof hash, updates status, emits event        |
| `get_task`       | Reads a task by ID                                           |
| `get_task_count` | Returns total tasks created                                  |
| `get_token`      | Returns configured token address                             |

### Task state

Each task stores:

- `creator` — task creator address
- `reward` — locked amount
- `proof_hash` — 32-byte SHA-256 hash (empty until proof submission)
- `status` — lifecycle enum (`Open`, `ProofSubmitted`, `Approved`, `Rejected`, `Cancelled`)

### Events

- `task_created` — emitted when a task is created (`task_id`, `creator`, `reward`)
- `proof_submitted` — emitted when a worker submits proof (`task_id`, `worker`, `proof_hash`)

## Future expansion

Reserved `TaskStatus` variants and module boundaries support upcoming handlers:

- Creator approval / rejection
- Automatic payout on approval
- Cancellation and refunds

Add new handlers in `contract.rs`, events in `events/`, and storage helpers in `storage/`.

## Prerequisites

- Rust 1.84+
- `wasm32v1-none` target

```bash
rustup target add wasm32v1-none
```

## Commands

```bash
# From contracts/
cargo test
cargo build --target wasm32v1-none --release
```

WASM artifact:

```
target/wasm32v1-none/release/proveit.wasm
```

## Testing

18 unit tests cover initialization, task creation, fund locking, proof submission, event emission, validation, and error paths.

```bash
cargo test
```
