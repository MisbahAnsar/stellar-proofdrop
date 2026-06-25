use soroban_sdk::{contractevent, Address};

#[contractevent(topics = ["task", "created"])]
pub struct TaskCreatedEvent {
    pub task_id: u64,
    pub creator: Address,
    pub reward: i128,
}
