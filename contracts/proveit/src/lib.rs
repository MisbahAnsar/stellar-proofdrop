#![no_std]

mod contract;
mod errors;
mod events;
mod storage;
mod types;

pub use contract::{ProveItContract, ProveItContractClient};
pub use errors::ContractError;
pub use events::{ProofSubmittedEvent, TaskCreatedEvent};
pub use types::{Task, TaskStatus};

#[cfg(test)]
mod tests;
