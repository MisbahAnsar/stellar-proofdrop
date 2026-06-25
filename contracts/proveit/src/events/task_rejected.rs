use soroban_sdk::{contractevent, Address};

#[contractevent(topics = ["task", "rejected"])]
pub struct TaskRejectedEvent {
    pub task_id: u64,
    pub creator: Address,
    pub worker: Address,
}
