use soroban_sdk::{testutils::Address as _, testutils::Events, Address, BytesN, Event};

use crate::errors::ContractError as Error;
use crate::events::TaskCreatedEvent;
use crate::types::TaskStatus;
use crate::ProveItContractClient;

use super::common::{contract_address, mint, setup, token_balance};

#[test]
fn initialize_sets_token_and_task_count() {
    let ctx = setup();

    assert_eq!(ctx.client.get_token(), ctx.token);
    assert_eq!(ctx.client.get_task_count(), 0);
}

#[test]
fn initialize_rejects_double_initialization() {
    let ctx = setup();
    let result = ctx.client.try_initialize(&ctx.token);

    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn create_task_locks_funds_and_persists_state() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let reward = 500_i128;

    mint(&ctx, &creator, reward);

    let task_id = ctx.client.create_task(&creator, &reward);
    let task = ctx.client.get_task(&task_id);

    assert_eq!(task_id, 1);
    assert_eq!(task.creator, creator);
    assert_eq!(task.reward, reward);
    assert_eq!(task.status, TaskStatus::Open);
    assert_eq!(task.proof_hash, BytesN::from_array(&ctx.env, &[0u8; 32]));
    assert_eq!(token_balance(&ctx, &creator), 0);
    assert_eq!(token_balance(&ctx, &contract_address(&ctx)), reward);
    assert_eq!(ctx.client.get_task_count(), 1);
}

#[test]
fn create_task_emits_task_created_event() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let reward = 250_i128;

    mint(&ctx, &creator, reward);

    let task_id = ctx.client.create_task(&creator, &reward);

    let expected = TaskCreatedEvent {
        task_id,
        creator: creator.clone(),
        reward,
    };
    let expected_xdr = expected.to_xdr(&ctx.env, &ctx.client.address);
    let events = ctx.env.events().all().filter_by_contract(&ctx.client.address);

    assert_eq!(events.events(), &[expected_xdr]);
}

#[test]
fn create_task_rejects_zero_reward() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);

    mint(&ctx, &creator, 100);

    let result = ctx.client.try_create_task(&creator, &0);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn create_task_rejects_negative_reward() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);

    mint(&ctx, &creator, 100);

    let result = ctx.client.try_create_task(&creator, &-1);
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn create_task_requires_sufficient_balance() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);

    mint(&ctx, &creator, 50);

    let result = ctx.client.try_create_task(&creator, &100);
    assert!(result.is_err());
}

#[test]
fn get_task_returns_not_found_for_missing_task() {
    let ctx = setup();

    let result = ctx.client.try_get_task(&99);
    assert_eq!(result, Err(Ok(Error::TaskNotFound)));
}

#[test]
fn multiple_tasks_receive_incrementing_ids() {
    let ctx = setup();
    let creator_a = Address::generate(&ctx.env);
    let creator_b = Address::generate(&ctx.env);

    mint(&ctx, &creator_a, 300);
    mint(&ctx, &creator_b, 700);

    let first = ctx.client.create_task(&creator_a, &300);
    let second = ctx.client.create_task(&creator_b, &700);

    assert_eq!(first, 1);
    assert_eq!(second, 2);
    assert_eq!(ctx.client.get_task_count(), 2);
    assert_eq!(ctx.client.get_task(&first).creator, creator_a);
    assert_eq!(ctx.client.get_task(&second).creator, creator_b);
    assert_eq!(token_balance(&ctx, &contract_address(&ctx)), 1000);
}

#[test]
fn uninitialized_contract_rejects_create_task() {
    let env = soroban_sdk::Env::default();
    env.mock_all_auths();

    let contract_id = env.register(crate::ProveItContract, ());
    let client = ProveItContractClient::new(&env, &contract_id);
    let creator = Address::generate(&env);

    let result = client.try_create_task(&creator, &100);
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn uninitialized_contract_rejects_get_task() {
    let env = soroban_sdk::Env::default();
    env.mock_all_auths();

    let contract_id = env.register(crate::ProveItContract, ());
    let client = ProveItContractClient::new(&env, &contract_id);

    let result = client.try_get_task(&1);
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn get_token_fails_when_not_initialized() {
    let env = soroban_sdk::Env::default();
    env.mock_all_auths();

    let contract_id = env.register(crate::ProveItContract, ());
    let client = ProveItContractClient::new(&env, &contract_id);

    let result = client.try_get_token();
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}
