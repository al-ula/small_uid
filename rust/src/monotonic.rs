use std::{thread::sleep, time::Duration};

use rand::Rng;

use crate::{generation::{assemble, timestamp_gen}, Error, SmallUid};

pub fn random_gen() -> u16 {
    rand::rng().random_range(0..(1 << 10)) // Generate a 10-bit random number
}

/// Monotonic SmallUID Generator
pub struct MonotonicGenerator {
    last_ms: u64,
    lower_bits: u16, // 10-bit random part
    upper_counter: u16, // 10-bit counter part
}

impl MonotonicGenerator {
    /// Creates a new MonotonicGenerator.
    pub fn new() -> Self {
        MonotonicGenerator {
            last_ms: 0,
            lower_bits: 0,
            upper_counter: 0,
        }
    }
}

/// Generates a monotonic random value within 20-bit space
pub fn monotonic_random_gen(generator: &mut MonotonicGenerator, timestamp: u64) -> Result<u32, Error> {
    if timestamp > generator.last_ms {
        generator.last_ms = timestamp;
        generator.lower_bits = random_gen() & 0x3FF; // Get new 10-bit randomness
        generator.upper_counter = 0; // Reset the counter
    } else {
        if generator.upper_counter >= 0x3FF {
            return Err(Error::MonotonicCounterLimit);
        }
        generator.upper_counter += 1;
    }

    // Combine upper 10-bit counter with lower 10-bit random
    Ok(((generator.upper_counter as u32) << 10) | generator.lower_bits as u32)
}

/// Generates a monotonic SmallUid
pub fn generate(generator: &mut MonotonicGenerator) -> Result<SmallUid, Error> {
    loop {
        let timestamp = timestamp_gen()?;
        match monotonic_random_gen(generator, timestamp) {
            Ok(random) => return Ok(assemble(timestamp, random as u64)),
            Err(_) => {
                // Delay until the next millisecond
                sleep(Duration::from_millis(1));
            }
        }
    }
}
