use ic_cdk::export::Principal;
use ic_cdk_macros::{query, update};
use ic_cdk::api::call::CallResult;
use ic_cdk::storage;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::vec::Vec;

#[derive(Serialize, Deserialize, Clone)]
pub struct Commit {
    pub commitment: String,
    pub revealed: bool,
    pub number: Option<u128>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Lottery {
    pub commit_phase: bool,
    pub participants: HashMap<Principal, Commit>,
    pub winning_number: Option<u128>,
}

#[update]
fn create_commitment(commitment: String) {
    let caller = ic_cdk::caller();
    let mut lottery: Lottery = storage::get();

    if !lottery.commit_phase {
        ic_cdk::trap("Commit phase has ended");
    }

    // Store the commitment for the player
    lottery.participants.insert(
        caller,
        Commit {
            commitment,
            revealed: false,
            number: None,
        },
    );

    storage::set(lottery);
}

#[update]
fn reveal_number(revealed_number: u128) {
    let caller = ic_cdk::caller();
    let mut lottery: Lottery = storage::get();

    if lottery.commit_phase {
        ic_cdk::trap("Reveal phase hasn't started yet");
    }

    // Find the participant and ensure they reveal the correct number
    if let Some(commit) = lottery.participants.get_mut(&caller) {
        if commit.revealed {
            ic_cdk::trap("Already revealed");
        }

        // For simplicity, assume the user sends the correct number.
        commit.number = Some(revealed_number);
        commit.revealed = true;

        storage::set(lottery);
    } else {
        ic_cdk::trap("Commitment not found");
    }
}

#[update]
fn start_reveal_phase() {
    let mut lottery: Lottery = storage::get();
    lottery.commit_phase = false;
    storage::set(lottery);
}

#[update]
fn end_lottery() -> String {
    let mut lottery: Lottery = storage::get();

    if lottery.commit_phase {
        ic_cdk::trap("Reveal phase hasn't started");
    }

    // Generate a random number for the lottery
    let random_number = generate_random_number();
    lottery.winning_number = Some(random_number);

    // Find the winner based on some logic. For now, we'll just select the first participant.
    let winner = lottery.participants.iter().next().map(|(p, _)| p.to_string());

    storage::set(lottery);

    format!(
        "Winning number: {}, Winner: {:?}",
        random_number, winner
    )
}

fn generate_random_number() -> u128 {
    let block_height = ic_cdk::api::canister_current_time(); // Use time or block height as entropy
    let random = (block_height % 100000) as u128; // Example random number logic
    random
}

#[query]
fn get_lottery_state() -> Lottery {
    storage::get()
}
