use soroban_sdk::{contracttype, Address, BytesN};

/// Lifecycle status for a task. Additional variants support future flows.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum TaskStatus {
    Open = 0,
    ProofSubmitted = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    pub id: u64,
    pub creator: Address,
    pub reward: i128,
    pub proof_hash: BytesN<32>,
    pub status: TaskStatus,
    pub worker: Option<Address>,
}
