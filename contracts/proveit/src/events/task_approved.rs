use soroban_sdk::{contractevent, Address};

#[contractevent(topics = ["task", "approved"])]
pub struct TaskApprovedEvent {
    pub task_id: u64,
    pub creator: Address,
    pub worker: Address,
    pub reward: i128,
}
