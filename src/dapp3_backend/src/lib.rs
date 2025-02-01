use std::collections::HashMap;
use std::cell::RefCell;
use candid::Principal;
// use ic_ledger_types::{AccountIdentifier, Memo, Subaccount, Tokens, TransferArgs, TransferError};
use candid::{Deserialize};
use serde::Serialize;
use ic_cdk::trap;
use ic_cdk::caller;
use rand::Rng;  // This imports the Rng trait which includes gen_range
use rand::rngs::StdRng;
use rand::SeedableRng;


#[derive(Debug,Serialize, Deserialize, Clone)]
pub struct Commit {
    pub commitment: String,
    pub revealed: bool,
    pub number: Option<u128>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Lottery {
    pub commit_phase: bool,
    pub participants: HashMap<Principal, Commit>,
    pub winning_number: Option<u64>,
    pub rng_seed: u64, // Store the seed for RNG
    pub generated_numbers: Vec<u64>, // Store generated numbers for auditing

}

thread_local! {
    static LEDGER_ID: RefCell<Option<Principal>> = RefCell::new(None);
    static PARTICIPANTS: RefCell<Vec<String>> = RefCell::new(Vec::new());
    static COMMITMENT_PHASE: RefCell<bool> = RefCell::new(false);
    static COMMITMENTS: RefCell<HashMap<String, String>> = RefCell::new(HashMap::new()); // Map for commitments
    static LOTTERY_STATE: RefCell<Lottery> = RefCell::new(Lottery {
        commit_phase: false,
        participants: HashMap::new(),
        winning_number: None,
        rng_seed: 123456789, // Example initial seed
        generated_numbers: Vec::new(),
    });
    static MODERATOR: RefCell<Option<String>> = RefCell::new(None); 
}

#[ic_cdk::init]
fn init(ledger_id: Principal) {
    LEDGER_ID.with(|id| {
        *id.borrow_mut() = Some(ledger_id);
    });
}


#[ic_cdk::update]
fn participant_joins() {
    // Get the caller's principal as a unique identifier
    let caller_principal = caller().to_string(); // Convert the principal to a string

    // Add the caller's principal to the participants list
    PARTICIPANTS.with(|participants| {
        let mut participants_ref = participants.borrow_mut();
        
        // Check if the caller has already joined (optional validation)
        if participants_ref.contains(&caller_principal) {
            trap("This participant has already joined.");
        } else {
            // Add the new participant's principal
            participants_ref.push(caller_principal);
        }
    });
}

#[ic_cdk::query]
fn get_participants() -> Vec<String> {
    // Return the list of participants
    PARTICIPANTS.with(|participants| participants.borrow().clone())
}

#[ic_cdk::update]
fn clear_participants() {
    // Clear all participants (useful for testing or resetting)
    PARTICIPANTS.with(|participants| participants.borrow_mut().clear());
}

#[ic_cdk::update]
fn make_moderator() {
    
    let caller_principal = caller().to_string();

    
    MODERATOR.with(|moderator| {
        let mut moderator_ref = moderator.borrow_mut();
      
            *moderator_ref = Some(caller_principal.clone());

            // Optionally, ensure the moderator is also in the participant list
            PARTICIPANTS.with(|participants| {
                let mut participants_ref = participants.borrow_mut();
                if !participants_ref.contains(&caller_principal) {
                    participants_ref.push(caller_principal);
                }
            });
        
    });
}

#[ic_cdk::update]
fn start_commitment_phase() {
    let caller_principal = caller().to_string();

    // Ensure the caller is the moderator
    MODERATOR.with(|moderator| {
        let moderator_ref = moderator.borrow();
        if moderator_ref.as_ref() != Some(&caller_principal) {
            trap("Only the moderator can start the commitment phase.");
        }
    });

    // Start the commitment phase
    COMMITMENT_PHASE.with(|phase| {
        let mut phase_ref = phase.borrow_mut();
        if *phase_ref {
            trap("The commitment phase has already started.");
        } else {
            *phase_ref = true;
        }
    });
}


#[ic_cdk::query]
fn get_commitment_phase_status() -> bool {
    // Return the status of the commitment phase
    COMMITMENT_PHASE.with(|phase| *phase.borrow())
}

#[ic_cdk::query]
fn get_moderator() -> Option<String> {
    // Return the moderator's principal
    MODERATOR.with(|moderator| moderator.borrow().clone())
}



#[ic_cdk::update]
fn create_commitment(commitment: String) {
    let caller_principal = caller().to_string();

    // Ensure the commitment phase is active
    COMMITMENT_PHASE.with(|phase| {
        if !*phase.borrow() {
            trap("The commitment phase is not active.");
        }
    });

    // Ensure the caller is a participant
    PARTICIPANTS.with(|participants| {
        if !participants.borrow().contains(&caller_principal) {
            trap("Only participants can create commitments.");
        }
    });

    // Add the commitment to the map
    COMMITMENTS.with(|commitments| {
        let mut commitments_ref = commitments.borrow_mut();
        if commitments_ref.contains_key(&caller_principal) {
            trap("You have already submitted your commitment.");
        } else {
            commitments_ref.insert(caller_principal, commitment);
        }
    });
}








#[ic_cdk::update]
fn end_commitment_phase() {
    let caller_principal = caller().to_string();

    // Ensure the caller is the moderator
    MODERATOR.with(|moderator| {
        let moderator_ref = moderator.borrow();
        if moderator_ref.as_ref() != Some(&caller_principal) {
            trap("Only the moderator can end the commitment phase.");
        }
    });

    // End the commitment phase
    COMMITMENT_PHASE.with(|phase| {
        let mut phase_ref = phase.borrow_mut();
        if !*phase_ref {
            trap("The commitment phase is not currently active.");
        } else {
            *phase_ref = false;
        }
    });

    // Optional: Log or handle the end of the phase
    ic_cdk::println!("Commitment phase has ended.");
}


// Function to get all generated random numbers for auditing
#[ic_cdk::query]
fn get_generated_numbers() -> Vec<u64> {
    LOTTERY_STATE.with(|state| state.borrow().generated_numbers.clone())
}

// Function to get the current RNG seed (for auditing purposes)
#[ic_cdk::query]
fn get_rng_seed() -> u64 {
    LOTTERY_STATE.with(|state| state.borrow().rng_seed)
}



fn generate_random_number(num_participants: usize, rng_seed: u64) -> u64 {
    // Seed the RNG
    let mut rng = StdRng::seed_from_u64(rng_seed);

    // Generate a random number and directly cast it to u64
    let random_number: u64 = rng.gen_range(0..num_participants) as u64;

    // Return the random number
    random_number
}

#[ic_cdk::update]
fn generate_and_set_winner() -> u64 {
    LOTTERY_STATE.with(|state| {
        let mut state_ref = state.borrow_mut();

        // Get the total number of participants
        let num_participants = state_ref.participants.len();

        if num_participants == 0 {
            ic_cdk::trap("No participants in the lottery.");
        }

        // Generate a random index
        let random_index = generate_random_number(num_participants, state_ref.rng_seed) as usize;

        // Store the random number for auditing purposes
        state_ref.generated_numbers.push(random_index as u64);

        // Update the RNG seed for future use
        state_ref.rng_seed = random_index as u64;

        // Convert HashMap keys to a Vec for indexed access
        let keys: Vec<Principal> = state_ref.participants.keys().cloned().collect();

        // Retrieve the winner's key
        let winner_key = keys.get(random_index).expect("Invalid random index.");

        // Retrieve the winner's commitment
        let winner_commitment = state_ref
            .participants
            .get(winner_key)
            .expect("Failed to get the winner's commitment.");

        // Log the winner's commitment for auditing
        ic_cdk::println!("Winner Principal: {}, Commitment: {:?}", winner_key, winner_commitment);

        // Set the winning number
        state_ref.winning_number = Some(random_index as u64);

        // Return the random number (index)
        random_index as u64
    })
}






#[ic_cdk::update]
fn clear_state() {
    // Clear all participants, reset the moderator, and stop the commitment phase
    PARTICIPANTS.with(|participants| participants.borrow_mut().clear());
    MODERATOR.with(|moderator| *moderator.borrow_mut() = None);
    COMMITMENT_PHASE.with(|phase| *phase.borrow_mut() = false);
    COMMITMENTS.with(|commitments| commitments.borrow_mut().clear());
}


ic_cdk::export_candid!();