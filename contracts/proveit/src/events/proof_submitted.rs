use soroban_sdk::{contractevent, Address, BytesN};

#[contractevent(topics = ["task", "proof_submitted"])]
pub struct ProofSubmittedEvent {
    pub task_id: u64,
    pub worker: Address,
    pub proof_hash: BytesN<32>,
}
