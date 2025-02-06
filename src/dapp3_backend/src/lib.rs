use std::collections::HashMap;
use std::cell::RefCell;
use candid::Principal;
// use ic_ledger_types::{AccountIdentifier, Memo, Subaccount, Tokens, TransferArgs, TransferError};
use candid::{CandidType,Deserialize};
use serde::Serialize;
use ic_cdk::trap;
use ic_cdk::caller;
use rand::Rng;  // This imports the Rng trait which includes gen_range
use rand::rngs::StdRng;
use rand::SeedableRng;
use ic_cdk::api::time;
use sha2::{Sha256, Digest}; 


#[derive(Debug,Serialize, Deserialize, Clone)]
pub struct Commit {
    pub commitment: String,
    pub revealed: bool,
    pub number: Option<u128>,
}

#[derive(Clone, Debug, CandidType)]
pub struct LotteryPublicInfo {
    pub commit_phase: bool,
    pub purpose: LotteryPurpose, 
}

#[derive(CandidType,Clone, Debug)]
pub enum LotteryPurpose {
    Entertainment,
    Fundraiser,
    DAOTreasury,
    Custom(String), 
}

#[derive(CandidType,Clone, Debug)]
pub struct Lottery {
    pub commit_phase: bool,
    pub winning_number: Option<u64>,
    pub rng_seed: u64,
    pub generated_numbers: Vec<u64>,
    pub purpose: LotteryPurpose, 
    pub ticket_price: u64,
    pub prize_pool:u64,
}


thread_local! {
    static LEDGER_ID: RefCell<Option<Principal>> = RefCell::new(None);
    static PARTICIPANTS: RefCell<Vec<(String, Vec<(String, u64)>)>> = RefCell::new(Vec::new());
    static COMMITMENT_PHASE: RefCell<HashMap<String, bool>> = RefCell::new(HashMap::new());
    static COMMITMENTS: RefCell<HashMap<String, String>> = RefCell::new(HashMap::new()); 
    static LOTTERIES: RefCell<HashMap<String, Lottery>> = RefCell::new(HashMap::new()); 
    static MODERATORS: RefCell<HashMap<String, Option<String>>> = RefCell::new(HashMap::new());
    static WINNERS: RefCell<HashMap<String, String>> = RefCell::new(HashMap::new());
    static VERIFICATION_HASHES: RefCell<HashMap<String, String>> = RefCell::new(HashMap::new());

}

#[ic_cdk::init]
fn init(ledger_id: Principal) {
    LEDGER_ID.with(|id| {
        *id.borrow_mut() = Some(ledger_id);
    });
}




#[ic_cdk::update]
fn create_new_lottery(purpose: String,ticket_price:u64) {
   
    let caller_principal = caller().to_string();

   
    let lottery_purpose = match purpose.as_str() {
        "Entertainment" => LotteryPurpose::Entertainment,
        "Fundraiser" => LotteryPurpose::Fundraiser,
        "DAOTreasury" => LotteryPurpose::DAOTreasury,
        _ => LotteryPurpose::Custom(purpose), 
    };
    
    let system_time = time(); // Current system time in milliseconds since epoch

    // Combine both sources (could be hashed or simply concatenated)
    let initial_seed = (system_time as u64) ^ caller_principal.len() as u64;
    
    let lottery = Lottery {
        commit_phase: false,
        winning_number: None,
        rng_seed: initial_seed, 
        generated_numbers: Vec::new(),
        purpose: lottery_purpose,
        ticket_price,
        prize_pool:0,
    };

    
    let lottery_id = format!("lottery_{}_{}", caller_principal, ic_cdk::api::time());

   
    LOTTERIES.with(|lotteries| {
        let mut lotteries_ref = lotteries.borrow_mut();
        lotteries_ref.insert(lottery_id.clone(), lottery);
    });
   
    MODERATORS.with(|moderators| {
        let mut moderators_ref = moderators.borrow_mut();
        moderators_ref.insert(lottery_id, Some(caller_principal));
    });
}


#[ic_cdk::query]
fn get_all_lotteries() -> Vec<(String, LotteryPublicInfo)> {
    LOTTERIES.with(|lotteries| {
        lotteries.borrow().iter().map(|(lottery_id, lottery)| {
          
            (
                lottery_id.clone(),
                LotteryPublicInfo {
                    commit_phase: lottery.commit_phase,
                    purpose: lottery.purpose.clone(),
                },
            )
        }).collect()
    })
}




#[ic_cdk::update]
fn participant_joins(lottery_id: String) {
    
    let caller_principal = caller().to_string();

   
    PARTICIPANTS.with(|participants| {
        let mut participants_ref = participants.borrow_mut();

       
        if let Some(participant) = participants_ref.iter_mut().find(|(principal, _)| *principal == caller_principal) {
           
            if !participant.1.iter().any(|(id, _)| *id == lottery_id) {
                
                participant.1.push((lottery_id, 0));
            }
        } else {
           
            participants_ref.push((caller_principal.clone(), vec![(lottery_id, 0)]));
        }
    });
}




#[ic_cdk::update]
fn buy_tickets(lottery_id: String, num_tickets: u64) {
    
    let caller_principal = caller().to_string();

   
    if num_tickets == 0 {
        trap("You must buy at least one ticket.");
    }

   
    PARTICIPANTS.with(|participants| {
        let mut participants_ref = participants.borrow_mut();

        
        if let Some(participant) = participants_ref.iter_mut().find(|(principal, _)| *principal == caller_principal) {
           
            if let Some(lottery) = participant.1.iter_mut().find(|(id, _)| *id == lottery_id) {
               
                lottery.1 += num_tickets;
            } else {
                trap("You are not participating in this lottery.");
            }
        } else {
            trap("Participant not found.");
        }
    });
}




#[ic_cdk::query]
fn get_participant_lotteries() -> Vec<(String, u64)> {
   
    let caller_principal = caller().to_string(); 

    
    PARTICIPANTS.with(|participants| {
        let participants_ref = participants.borrow();

        
        if let Some(participant) = participants_ref.iter().find(|(principal, _)| *principal == caller_principal) {
           
            participant.1.iter().map(|(lottery_id, num_tickets)| (lottery_id.clone(), *num_tickets)).collect()
        } else {
            
            Vec::new()
        }
    })
}








#[ic_cdk::update]
fn start_commitment_phase(lottery_id: String) {
    let caller_principal = caller().to_string();

   
    MODERATORS.with(|moderators| {
        let moderators_ref = moderators.borrow();
        
        match moderators_ref.get(&lottery_id) {
            Some(Some(moderator)) if moderator == &caller_principal => {
               
            }
            _ => trap("Only the moderator of this lottery can start the commitment phase."),
        }
    });

  
    COMMITMENT_PHASE.with(|phase| {
        let mut phase_ref = phase.borrow_mut();
        if let Some(true) = phase_ref.get(&lottery_id) {
            trap("The commitment phase has already started.");
        } else {
            phase_ref.insert(lottery_id, true);
        }
    });
}



#[ic_cdk::query]
fn get_commitment_phase(lottery_id: String) -> bool {
    COMMITMENT_PHASE.with(|phase| {
        let phase_ref = phase.borrow();
        *phase_ref.get(&lottery_id).unwrap_or(&false) 
    })
}


#[ic_cdk::query]
fn get_all_lottery_moderators() -> Vec<(String, Option<String>)> {
    MODERATORS.with(|moderators| {
        moderators
            .borrow()
            .iter()
            .map(|(lottery_id, moderator)| (lottery_id.clone(), moderator.clone()))
            .collect()
    })
}

#[ic_cdk::query]
fn get_lottery_moderator(lottery_id: String) -> Option<String> {
    MODERATORS.with(|moderators| {
        moderators
            .borrow()
            .get(&lottery_id)
            .cloned() 
            .unwrap_or(None) 
    })
}



#[ic_cdk::update]
fn create_commitment(lottery_id: String, commitment: String) {
    let caller_principal = caller().to_string();

    
    COMMITMENT_PHASE.with(|phase| {
        let phase_ref = phase.borrow();
        if !phase_ref.get(&lottery_id).copied().unwrap_or(false) {
            trap("The commitment phase is not active for this lottery.");
        }
    });

    
    PARTICIPANTS.with(|participants| {
        let participants_ref = participants.borrow();
        
     
        let lottery_participants = participants_ref.iter().find(|(id, _)| id == &lottery_id);
        
    
        if let Some((_, participant_list)) = lottery_participants {
            let is_participant = participant_list.iter().any(|(participant_id, _)| participant_id == &caller_principal);
            
            if !is_participant {
                trap("Only participants of this lottery can create commitments.");
            }
        } else {
            trap("The lottery ID is invalid or does not have any participants.");
        }
    });
    
    
    COMMITMENTS.with(|commitments| {
        let mut commitments_ref = commitments.borrow_mut();
        let key = format!("{}_{}", lottery_id, caller_principal); 

        if commitments_ref.contains_key(&key) {
            trap("You have already submitted your commitment for this lottery.");
        } else {
            commitments_ref.insert(key, commitment);
        }
    });
}







#[ic_cdk::update]
fn end_commitment_phase(lottery_id: String) {
    let caller_principal = caller().to_string();

    
    MODERATORS.with(|moderators| {
        let moderators_ref = moderators.borrow();
        match moderators_ref.get(&lottery_id) {
            Some(Some(moderator)) if moderator == &caller_principal => {
              
            }
            _ => trap("Only the moderator of this lottery can end the commitment phase."),
        }
    });

    
    COMMITMENT_PHASE.with(|phase| {
        let mut phase_ref = phase.borrow_mut();
        match phase_ref.get_mut(&lottery_id) {
            Some(active) if *active => {
                *active = false;
                ic_cdk::println!("Commitment phase for lottery {} has ended.", lottery_id);
            }
            _ => trap("The commitment phase is not currently active for this lottery."),
        }
    });
}


fn generate_random_numbers_for_participants(num_participants: usize, rng_seed: u64) -> Vec<u64> {
   
    let mut rng = StdRng::seed_from_u64(rng_seed);

   
    let mut random_numbers: Vec<u64> = Vec::with_capacity(num_participants);

    for _ in 0..num_participants {
       
        let random_number = rng.gen_range(0..u64::MAX);
        random_numbers.push(random_number);
    }

   
    random_numbers
}


#[ic_cdk::update]
fn generate_and_set_winner(lottery_id: String) -> u64 {
   
    LOTTERIES.with(|lotteries| {
        let mut lotteries_ref = lotteries.borrow_mut();
        let lottery = lotteries_ref.get_mut(&lottery_id).expect("Lottery not found");

       
        let valid_participants = PARTICIPANTS.with(|participants| {
            participants.borrow()
                .iter()
                .find(|(id, _)| id == &lottery_id)  
                .map(|(_, participant_list)| {
                    participant_list.iter()
                        .filter(|(_, tickets)| *tickets > 0)  
                        .map(|(id, tickets)| (id.clone(), *tickets)) 
                        .collect::<Vec<(String, u64)>>()  
                })
                .unwrap_or_default() 
        });

        if valid_participants.is_empty() {
            ic_cdk::trap("No participants with valid tickets.");
        }

        let num_participants = valid_participants.len();

        
        let random_numbers = generate_random_numbers_for_participants(num_participants, lottery.rng_seed);

        
        lottery.generated_numbers.extend(random_numbers.iter().cloned());

        let last_random_number = *random_numbers.last().expect("Failed to get last random number.");

      
        lottery.rng_seed = last_random_number;

        
        let keys: Vec<String> = valid_participants.iter().map(|(id, _)| id.clone()).collect();

        
        let winner_index = (last_random_number as usize) % num_participants;

        
        let winner_key = keys.get(winner_index).expect("Invalid random index.");

        let verification_string = format!("{}-{}-{}", lottery_id, winner_key, winner_index);
        let mut hasher = Sha256::new();
        hasher.update(verification_string.as_bytes());
        let verification_hash = format!("{:x}", hasher.finalize());

        let winner_commitment = valid_participants
            .iter()
            .find(|(id, _)| id == winner_key) 
            .expect("Failed to get the winner's commitment.");

      
        ic_cdk::println!("Winner: {}, Commitment: {:?}", winner_key, winner_commitment);

        
        lottery.winning_number = Some(winner_index as u64);
        WINNERS.with(|winners| {
            winners.borrow_mut().insert(lottery_id.clone(), winner_key.clone());
        });

        VERIFICATION_HASHES.with(|hashes| {
            hashes.borrow_mut().insert(lottery_id.clone(), verification_hash.clone());
        });


        
        winner_index as u64
    })
}

#[ic_cdk::query]
fn get_winner(lottery_id: String) -> Option<String> {
    
    WINNERS.with(|winners| {
        let winners_ref = winners.borrow();
       
        winners_ref.get(&lottery_id).cloned()
    })
}

#[ic_cdk::query]
fn get_verification_hash(lottery_id: String) -> Option<String> {
    VERIFICATION_HASHES.with(|hashes| {
        let hashes_ref = hashes.borrow();
        hashes_ref.get(&lottery_id).cloned()
    })
}


#[ic_cdk::update]
fn clear_state() {
    LEDGER_ID.with(|ledger_id| *ledger_id.borrow_mut() = None);
    PARTICIPANTS.with(|participants| participants.borrow_mut().clear());
    COMMITMENT_PHASE.with(|phase| phase.borrow_mut().clear());
    COMMITMENTS.with(|commitments| commitments.borrow_mut().clear());
    LOTTERIES.with(|lotteries| lotteries.borrow_mut().clear());
    MODERATORS.with(|moderators| moderators.borrow_mut().clear());

    ic_cdk::println!("All state data has been cleared.");
}


ic_cdk::export_candid!();


