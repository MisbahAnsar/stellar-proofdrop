use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env};

use crate::errors::ContractError;
use crate::events::{
    ProofSubmittedEvent, TaskApprovedEvent, TaskCreatedEvent, TaskRejectedEvent,
};
use crate::storage;
use crate::types::{Task, TaskStatus};

#[contract]
pub struct ProveItContract;

#[contractimpl]
impl ProveItContract {
    /// Stores the token contract used for task rewards (typically native XLM SAC).
    pub fn initialize(env: Env, token: Address) -> Result<(), ContractError> {
        if storage::is_initialized(&env) {
            return Err(ContractError::AlreadyInitialized);
        }

        storage::set_token(&env, &token);
        storage::set_task_count(&env, 0);
        storage::set_initialized(&env);

        Ok(())
    }

    /// Creates a task, locks reward funds in the contract, and emits a `TaskCreated` event.
    pub fn create_task(
        env: Env,
        creator: Address,
        reward: i128,
    ) -> Result<u64, ContractError> {
        Self::require_initialized(&env)?;
        Self::validate_reward(reward)?;

        creator.require_auth();

        let token = storage::get_token(&env).ok_or(ContractError::NotInitialized)?;
        let contract_address = env.current_contract_address();

        token::Client::new(&env, &token).transfer(&creator, &contract_address, &reward);

        let task_id = storage::next_task_id(&env);
        let task = Task {
            id: task_id,
            creator: creator.clone(),
            reward,
            proof_hash: storage::empty_proof_hash(&env),
            status: TaskStatus::Open,
            worker: None,
        };

        storage::set_task(&env, &task);

        TaskCreatedEvent {
            task_id,
            creator,
            reward,
        }
        .publish(&env);

        Ok(task_id)
    }

    /// Stores a proof hash on-chain. Proof content remains off-chain.
    pub fn submit_proof(
        env: Env,
        worker: Address,
        task_id: u64,
        proof_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        Self::require_initialized(&env)?;
        worker.require_auth();

        if storage::is_empty_proof_hash(&proof_hash) {
            return Err(ContractError::InvalidProofHash);
        }

        let mut task = storage::get_task(&env, task_id).ok_or(ContractError::TaskNotFound)?;

        if task.status != TaskStatus::Open {
            return Err(ContractError::InvalidTaskStatus);
        }

        task.proof_hash = proof_hash.clone();
        task.status = TaskStatus::ProofSubmitted;
        task.worker = Some(worker.clone());
        storage::set_task(&env, &task);

        ProofSubmittedEvent {
            task_id,
            worker: worker.clone(),
            proof_hash,
        }
        .publish(&env);

        Ok(())
    }

    /// Creator approves proof and releases locked reward to the worker.
    pub fn approve_task(env: Env, creator: Address, task_id: u64) -> Result<(), ContractError> {
        Self::require_initialized(&env)?;
        creator.require_auth();

        let mut task = storage::get_task(&env, task_id).ok_or(ContractError::TaskNotFound)?;

        if task.creator != creator {
            return Err(ContractError::NotCreator);
        }

        if task.status != TaskStatus::ProofSubmitted {
            return Err(ContractError::InvalidTaskStatus);
        }

        let worker = task
            .worker
            .clone()
            .ok_or(ContractError::WorkerNotSet)?;

        let token = storage::get_token(&env).ok_or(ContractError::NotInitialized)?;
        let contract_address = env.current_contract_address();
        let reward = task.reward;

        token::Client::new(&env, &token).transfer(&contract_address, &worker, &reward);

        task.status = TaskStatus::Approved;
        storage::set_task(&env, &task);

        TaskApprovedEvent {
            task_id,
            creator,
            worker,
            reward,
        }
        .publish(&env);

        Ok(())
    }

    /// Creator rejects proof and returns the task to the open state for resubmission.
    pub fn reject_task(env: Env, creator: Address, task_id: u64) -> Result<(), ContractError> {
        Self::require_initialized(&env)?;
        creator.require_auth();

        let mut task = storage::get_task(&env, task_id).ok_or(ContractError::TaskNotFound)?;

        if task.creator != creator {
            return Err(ContractError::NotCreator);
        }

        if task.status != TaskStatus::ProofSubmitted {
            return Err(ContractError::InvalidTaskStatus);
        }

        let worker = task
            .worker
            .clone()
            .ok_or(ContractError::WorkerNotSet)?;

        task.status = TaskStatus::Open;
        task.proof_hash = storage::empty_proof_hash(&env);
        task.worker = None;
        storage::set_task(&env, &task);

        TaskRejectedEvent {
            task_id,
            creator,
            worker,
        }
        .publish(&env);

        Ok(())
    }

    pub fn get_task(env: Env, task_id: u64) -> Result<Task, ContractError> {
        Self::require_initialized(&env)?;
        storage::get_task(&env, task_id).ok_or(ContractError::TaskNotFound)
    }

    pub fn get_task_count(env: Env) -> Result<u64, ContractError> {
        Self::require_initialized(&env)?;
        Ok(storage::get_task_count(&env))
    }

    pub fn get_token(env: Env) -> Result<Address, ContractError> {
        Self::require_initialized(&env)?;
        storage::get_token(&env).ok_or(ContractError::NotInitialized)
    }

    fn require_initialized(env: &Env) -> Result<(), ContractError> {
        if storage::is_initialized(env) {
            Ok(())
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn validate_reward(reward: i128) -> Result<(), ContractError> {
        if reward > 0 {
            Ok(())
        } else {
            Err(ContractError::InvalidAmount)
        }
    }
}
