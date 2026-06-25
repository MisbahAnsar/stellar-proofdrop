use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Initialized,
    Token,
    TaskCount,
    Task(u64),
}
