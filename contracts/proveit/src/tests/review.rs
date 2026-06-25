use soroban_sdk::{testutils::Address as _, testutils::Events, Address, BytesN, Event};

use crate::errors::ContractError as Error;
use crate::events::{TaskApprovedEvent, TaskRejectedEvent};
use crate::types::TaskStatus;

use super::common::{contract_address, create_open_task, mint, sample_proof_hash, setup, token_balance};

fn submit_sample_proof(
    ctx: &super::common::TestContext,
    creator: &Address,
    worker: &Address,
    reward: i128,
) -> u64 {
    let task_id = create_open_task(ctx, creator, reward);
    let proof_hash = sample_proof_hash(&ctx.env);
    ctx.client.submit_proof(worker, &task_id, &proof_hash);
    task_id
}

#[test]
fn approve_task_releases_reward_to_worker() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let reward = 100_i128;

    let task_id = submit_sample_proof(&ctx, &creator, &worker, reward);

    ctx.client.approve_task(&creator, &task_id);

    let task = ctx.client.get_task(&task_id);
    assert_eq!(task.status, TaskStatus::Approved);
    assert_eq!(token_balance(&ctx, &worker), reward);
    assert_eq!(token_balance(&ctx, &contract_address(&ctx)), 0);
}

#[test]
fn approve_task_emits_event() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let reward = 100_i128;

    let task_id = submit_sample_proof(&ctx, &creator, &worker, reward);
    ctx.client.approve_task(&creator, &task_id);

    let expected = TaskApprovedEvent {
        task_id,
        creator: creator.clone(),
        worker: worker.clone(),
        reward,
    };
    let expected_xdr = expected.to_xdr(&ctx.env, &ctx.client.address);
    let events = ctx.env.events().all().filter_by_contract(&ctx.client.address);

    assert!(events.events().iter().any(|event| event == &expected_xdr));
}

#[test]
fn approve_task_rejects_non_creator() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let other = Address::generate(&ctx.env);

    let task_id = submit_sample_proof(&ctx, &creator, &worker, 100);

    let result = ctx.client.try_approve_task(&other, &task_id);
    assert_eq!(result, Err(Ok(Error::NotCreator)));
}

#[test]
fn approve_task_rejects_when_not_proof_submitted() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let reward = 100_i128;

    mint(&ctx, &creator, reward);
    let task_id = ctx.client.create_task(&creator, &reward);

    let result = ctx.client.try_approve_task(&creator, &task_id);
    assert_eq!(result, Err(Ok(Error::InvalidTaskStatus)));
}

#[test]
fn approve_task_rejects_duplicate_review() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);

    let task_id = submit_sample_proof(&ctx, &creator, &worker, 100);
    ctx.client.approve_task(&creator, &task_id);

    let result = ctx.client.try_approve_task(&creator, &task_id);
    assert_eq!(result, Err(Ok(Error::InvalidTaskStatus)));
}

#[test]
fn reject_task_returns_to_open_state() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let reward = 100_i128;

    let task_id = submit_sample_proof(&ctx, &creator, &worker, reward);

    ctx.client.reject_task(&creator, &task_id);

    let task = ctx.client.get_task(&task_id);
    assert_eq!(task.status, TaskStatus::Open);
    assert_eq!(task.proof_hash, BytesN::from_array(&ctx.env, &[0u8; 32]));
    assert_eq!(task.worker, None);
    assert_eq!(token_balance(&ctx, &contract_address(&ctx)), reward);
}

#[test]
fn reject_task_emits_event() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);

    let task_id = submit_sample_proof(&ctx, &creator, &worker, 100);
    ctx.client.reject_task(&creator, &task_id);

    let expected = TaskRejectedEvent {
        task_id,
        creator: creator.clone(),
        worker: worker.clone(),
    };
    let expected_xdr = expected.to_xdr(&ctx.env, &ctx.client.address);
    let events = ctx.env.events().all().filter_by_contract(&ctx.client.address);

    assert!(events.events().iter().any(|event| event == &expected_xdr));
}

#[test]
fn reject_task_allows_resubmission() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);
    let new_hash = BytesN::from_array(&ctx.env, &[3u8; 32]);

    let task_id = submit_sample_proof(&ctx, &creator, &worker, 100);
    ctx.client.reject_task(&creator, &task_id);

    ctx.client.submit_proof(&worker, &task_id, &new_hash);

    let task = ctx.client.get_task(&task_id);
    assert_eq!(task.status, TaskStatus::ProofSubmitted);
    assert_eq!(task.proof_hash, new_hash);
    assert_ne!(task.proof_hash, proof_hash);
}

#[test]
fn reject_task_rejects_non_creator() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let other = Address::generate(&ctx.env);

    let task_id = submit_sample_proof(&ctx, &creator, &worker, 100);

    let result = ctx.client.try_reject_task(&other, &task_id);
    assert_eq!(result, Err(Ok(Error::NotCreator)));
}

#[test]
fn reject_task_rejects_when_not_proof_submitted() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let reward = 100_i128;

    mint(&ctx, &creator, reward);
    let task_id = ctx.client.create_task(&creator, &reward);

    let result = ctx.client.try_reject_task(&creator, &task_id);
    assert_eq!(result, Err(Ok(Error::InvalidTaskStatus)));
}
