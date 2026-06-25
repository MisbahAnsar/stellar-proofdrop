use soroban_sdk::{contract, contractimpl, token, Address, Env};

use crate::errors::ContractError;
use crate::events::TaskCreatedEvent;
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
