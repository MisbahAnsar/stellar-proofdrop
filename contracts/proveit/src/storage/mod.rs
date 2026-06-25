mod keys;

pub use keys::DataKey;

use soroban_sdk::{Address, Env};

use crate::types::Task;

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Initialized)
}

pub fn set_initialized(env: &Env) {
    env.storage().instance().set(&DataKey::Initialized, &true);
}

pub fn get_token(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Token)
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_task_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::TaskCount)
        .unwrap_or(0)
}

pub fn set_task_count(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::TaskCount, &count);
}

pub fn next_task_id(env: &Env) -> u64 {
    let next = get_task_count(env) + 1;
    set_task_count(env, next);
    next
}

pub fn get_task(env: &Env, task_id: u64) -> Option<Task> {
    env.storage().persistent().get(&DataKey::Task(task_id))
}

pub fn set_task(env: &Env, task: &Task) {
    env.storage().persistent().set(&DataKey::Task(task.id), task);
}

pub fn empty_proof_hash(env: &Env) -> soroban_sdk::BytesN<32> {
    soroban_sdk::BytesN::from_array(env, &[0u8; 32])
}
