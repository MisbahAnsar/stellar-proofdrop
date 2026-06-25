use soroban_sdk::{testutils::Address as _, testutils::Events, Address, BytesN, Event};

use crate::errors::ContractError as Error;
use crate::events::ProofSubmittedEvent;
use crate::types::TaskStatus;

use super::common::{mint, setup};

fn sample_proof_hash(env: &soroban_sdk::Env) -> BytesN<32> {
    BytesN::from_array(env, &[7u8; 32])
}

fn create_open_task(
    ctx: &super::common::TestContext,
    creator: &Address,
    reward: i128,
) -> u64 {
    mint(ctx, creator, reward);
    ctx.client.create_task(creator, &reward)
}

#[test]
fn submit_proof_stores_hash_and_updates_status() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);

    let task_id = create_open_task(&ctx, &creator, 100);

    ctx.client.submit_proof(&worker, &task_id, &proof_hash);

    let task = ctx.client.get_task(&task_id);
    assert_eq!(task.proof_hash, proof_hash);
    assert_eq!(task.status, TaskStatus::ProofSubmitted);
}

#[test]
fn submit_proof_emits_event() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);

    let task_id = create_open_task(&ctx, &creator, 100);
    ctx.client.submit_proof(&worker, &task_id, &proof_hash);

    let expected = ProofSubmittedEvent {
        task_id,
        worker: worker.clone(),
        proof_hash: proof_hash.clone(),
    };
    let expected_xdr = expected.to_xdr(&ctx.env, &ctx.client.address);
    let events = ctx.env.events().all().filter_by_contract(&ctx.client.address);

    assert!(events.events().iter().any(|event| event == &expected_xdr));
}

#[test]
fn submit_proof_rejects_empty_hash() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let empty_hash = BytesN::from_array(&ctx.env, &[0u8; 32]);

    let task_id = create_open_task(&ctx, &creator, 100);

    let result = ctx.client.try_submit_proof(&worker, &task_id, &empty_hash);
    assert_eq!(result, Err(Ok(Error::InvalidProofHash)));
}

#[test]
fn submit_proof_rejects_missing_task() {
    let ctx = setup();
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);

    let result = ctx.client.try_submit_proof(&worker, &99, &proof_hash);
    assert_eq!(result, Err(Ok(Error::TaskNotFound)));
}

#[test]
fn submit_proof_rejects_duplicate_submission() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);
    let other_hash = BytesN::from_array(&ctx.env, &[9u8; 32]);

    let task_id = create_open_task(&ctx, &creator, 100);
    ctx.client.submit_proof(&worker, &task_id, &proof_hash);

    let result = ctx.client.try_submit_proof(&worker, &task_id, &other_hash);
    assert_eq!(result, Err(Ok(Error::InvalidTaskStatus)));
}

#[test]
fn submit_proof_requires_open_status() {
    let ctx = setup();
    let creator = Address::generate(&ctx.env);
    let worker = Address::generate(&ctx.env);
    let proof_hash = sample_proof_hash(&ctx.env);

    let task_id = create_open_task(&ctx, &creator, 100);
    ctx.client.submit_proof(&worker, &task_id, &proof_hash);

    let task = ctx.client.get_task(&task_id);
    assert_eq!(task.status, TaskStatus::ProofSubmitted);
}
