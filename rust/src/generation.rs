use crate::{Error, SmallUid};
use rand::Rng;
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
    rand::thread_rng().gen_range(0..(1 << 20))
}

/// Generates SmallUid using timestamp_gen() and random_gen()
pub fn gen() -> Result<SmallUid, Error> {
    let timestamp = timestamp_gen()?;
    let random = random_gen();
    Ok(assemble(timestamp, random))
}

/// Assembler for SmallUid
pub fn assemble(timestamp: u64, random: u64) -> SmallUid {
    let timestamp = timestamp << 20;
    let random_bits = 64 - random.leading_zeros();
    let random = if random_bits > 44 {
        random >> 44
    } else {
        random
    };
    SmallUid(timestamp | random)
}
