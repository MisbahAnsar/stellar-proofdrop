use soroban_sdk::{testutils::Address as _, token, Address, BytesN, Env};

use crate::{ProveItContract, ProveItContractClient};

pub struct TestContext<'a> {
    pub env: Env,
    pub client: ProveItContractClient<'a>,
    pub token: Address,
}

pub fn setup() -> TestContext<'static> {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token = sac.address();

    let contract_id = env.register(ProveItContract, ());
    let client = ProveItContractClient::new(&env, &contract_id);

    client.initialize(&token);

    TestContext {
        env,
        client,
        token,
    }
}

pub fn mint(ctx: &TestContext, to: &Address, amount: i128) {
    let stellar = token::StellarAssetClient::new(&ctx.env, &ctx.token);
    stellar.mint(to, &amount);
}

pub fn token_balance(ctx: &TestContext, address: &Address) -> i128 {
    token::Client::new(&ctx.env, &ctx.token).balance(address)
}

pub fn contract_address(ctx: &TestContext) -> Address {
    ctx.client.address.clone()
}

pub fn sample_proof_hash(env: &soroban_sdk::Env) -> BytesN<32> {
    BytesN::from_array(env, &[7u8; 32])
}

pub fn create_open_task(ctx: &TestContext, creator: &Address, reward: i128) -> u64 {
    mint(ctx, creator, reward);
    ctx.client.create_task(creator, &reward)
}
