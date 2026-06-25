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
        ├── events.rs       # On-chain event definitions
        ├── storage/        # Persistence keys and helpers
        │   ├── keys.rs
        │   └── mod.rs
        ├── types/          # Domain models
        │   ├── task.rs     # Task, TaskStatus
        │   └── mod.rs
        └── tests/          # Unit tests
            ├── common.rs   # Test harness helpers
            └── contract.rs
```

## Implemented

| Capability       | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `initialize`     | Registers the reward token contract (XLM SAC)              |
| `create_task`    | Locks reward funds, stores task state, emits `TaskCreated` |
| `get_task`       | Reads a task by ID                                         |
| `get_task_count` | Returns total tasks created                                |
| `get_token`      | Returns configured token address                           |

### Task state

Each task stores:

- `creator` — task creator address
- `reward` — locked amount
- `proof_hash` — 32-byte placeholder (`0x00…`) until proof submission is implemented
- `status` — lifecycle enum (`Open`, `ProofSubmitted`, `Approved`, `Rejected`, `Cancelled`)

### Events

- `task_created` — emitted when a task is created (`task_id`, `creator`, `reward`)

## Future expansion

Reserved `TaskStatus` variants and module boundaries support upcoming handlers:

- Proof submission (`proof_hash` update)
- Creator approval / rejection
- Automatic payout on approval
- Cancellation and refunds

Add new handlers in `contract.rs`, events in `events.rs`, and storage helpers in `storage/`.

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

12 unit tests cover initialization, task creation, fund locking, event emission, validation, and error paths.

```bash
cargo test
```
