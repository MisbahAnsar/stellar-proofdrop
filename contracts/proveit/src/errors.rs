use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    TaskNotFound = 4,
    InsufficientBalance = 5,
    InvalidProofHash = 6,
    InvalidTaskStatus = 7,
    NotCreator = 8,
    WorkerNotSet = 9,
}
