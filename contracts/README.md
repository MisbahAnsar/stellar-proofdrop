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
        │   ├── proof_submitted.rs
        │   ├── task_approved.rs
        │   └── task_rejected.rs
        ├── storage/        # Persistence keys and helpers
        │   ├── keys.rs
        │   └── mod.rs
        ├── types/          # Domain models
        │   ├── task.rs     # Task, TaskStatus
        │   └── mod.rs
        └── tests/          # Unit tests
            ├── common.rs   # Test harness helpers
            ├── contract.rs
            ├── proof.rs
            └── review.rs
```

## Implemented

| Capability       | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `initialize`     | Registers the reward token contract (XLM SAC)                |
| `create_task`    | Locks reward funds, stores task state, emits `TaskCreated`     |
| `submit_proof`   | Worker stores proof hash, updates status, emits event        |
| `approve_task`   | Creator approves, releases reward to worker, emits event     |
| `reject_task`    | Creator rejects, reopens task for resubmission, emits event  |
| `get_task`       | Reads a task by ID                                           |
| `get_task_count` | Returns total tasks created                                  |
| `get_token`      | Returns configured token address                             |

### Task state

Each task stores:

- `creator` — task creator address
- `reward` — locked amount
- `proof_hash` — 32-byte SHA-256 hash (empty until proof submission)
- `worker` — address that submitted proof (set on `submit_proof`)
- `status` — lifecycle enum (`Open`, `ProofSubmitted`, `Approved`, `Rejected`, `Cancelled`)

### Events

- `task_created` — emitted when a task is created (`task_id`, `creator`, `reward`)
- `proof_submitted` — emitted when a worker submits proof (`task_id`, `worker`, `proof_hash`)
- `task_approved` — emitted when a creator approves (`task_id`, `creator`, `worker`, `reward`)
- `task_rejected` — emitted when a creator rejects (`task_id`, `creator`, `worker`)

### Review flow

- **Approve** — requires `ProofSubmitted` status and creator auth; transfers reward from contract to worker; sets `Approved`
- **Reject** — requires `ProofSubmitted` status and creator auth; clears proof hash and worker; sets `Open` so workers can resubmit

## Future expansion

Reserved `TaskStatus` variants and module boundaries support upcoming handlers:

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

28 unit tests cover initialization, task creation, fund locking, proof submission, creator review, event emission, validation, and error paths.

```bash
cargo test
```
