use crate::{Error, SmallUid};
use rand::Rng;

#[cfg(target_arch = "wasm32")]
use web_time::{SystemTime, UNIX_EPOCH};

#[cfg(not(target_arch = "wasm32"))]
use std::time::{SystemTime, UNIX_EPOCH};

/// Generates a timestamp as u64
pub fn timestamp_gen() -> Result<u64, Error> {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH)?;
    let timestamp = since_the_epoch.as_millis() as u64;
    Ok(timestamp)
}

/// Generates a random number as u64
pub fn random_gen() -> u64 {
    rand::rng().random_range(0..(1 << 20))
}

/// Generates SmallUid using timestamp_gen() and random_gen()
pub fn generate() -> Result<SmallUid, Error> {
    let timestamp = timestamp_gen()?;
    let random = random_gen();
    Ok(assemble(timestamp, random))
}

pub fn assemble(timestamp: u64, random: u64) -> SmallUid {
    let timestamp = timestamp << 20;

    // CHANGE: Using a bitmask to ensure that we only use the lower 20 bits
    // of the random number, which matches the logic in `get_random`.
    let random = random & 0xFFFFF;

    SmallUid(timestamp | random)
}
