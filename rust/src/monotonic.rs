use std::{thread::sleep, time::Duration};

use rand::Rng;

use crate::{generation::{assemble, timestamp_gen}, Error, SmallUid};

pub fn random_gen() -> u16 {
    rand::rng().random_range(0..(1 << 10)) // Generate a 10-bit random number
}

/// Monotonic SmallUID Generator
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct MonotonicGenerator {
    pub(crate) last_ms: u64,
    pub(crate) lower_bits: u16, // 10-bit random part
    pub(crate) upper_counter: u16, // 10-bit counter part
}

impl MonotonicGenerator {

    pub fn generate(&mut self) -> SmallUid {
        generate(self).unwrap()
    }

    pub fn generate_batch(&mut self, count: usize) -> Vec<SmallUid> {
        let mut smalluids = Vec::new();
        for _ in 0..count {
            smalluids.push(self.generate());
        }
        smalluids
    }

    /// Generate all possible monotonic SmallUids for a given timestamp (10-bit increment: 1024 UIDs)
    /// 
    /// Most modern machine should be able to run in the µs range even in debug mode, though your mileage may varies
    pub fn generate_full(&mut self, timestamp: u64) -> [SmallUid; 1024] {
        std::array::from_fn(|i| {
            let random = random_gen() & 0x3FF;
            // For each i in 0..1024, use i as the 10-bit increment
            let random = (i as u32) << 10 | random as u32;
            assemble(timestamp, random as u64)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::timestamp_gen;

    #[test]
    fn test_generate_single_uid() {
        let mut generator = MonotonicGenerator::default();
        let uid1 = generator.generate();
        let uid2 = generator.generate();
        assert_ne!(uid1, uid2, "Consecutive generated UIDs should be unique");
    }

    #[test]
    fn test_generate_batch_count_and_uniqueness() {
        let mut generator = MonotonicGenerator::default();
        let batch_size = 100;
        let uids = generator.generate_batch(batch_size);
        assert_eq!(uids.len(), batch_size, "Batch size should match requested count");

        let mut seen = std::collections::HashSet::new();
        for uid in uids.iter() {
            assert!(seen.insert(uid), "Duplicate UID found in batch");
        }
    }

    #[test]
    fn test_generate_batch_monotonicity() {
        let mut generator = MonotonicGenerator::default();
        let batch_size = 50;
        let uids = generator.generate_batch(batch_size);
        for i in 1..uids.len() {
            assert!(uids[i] > uids[i - 1], "UIDs are not monotonic at index {}", i);
        }
    }

    #[test]
    fn test_generate_full_monotonicity() {
        let mut generator = MonotonicGenerator::default();
        let timestamp = timestamp_gen().unwrap();
        let start = std::time::Instant::now();
        let uids = generator.generate_full(timestamp);
        let duration = start.elapsed();
        println!("Generate full take: {:?}", duration);

        // Check that all UIDs are unique
        let mut seen = std::collections::HashSet::new();
        for uid in uids.iter() {
            assert!(seen.insert(uid), "Duplicate UID found in generate_full");
        }

        // Check that UIDs are strictly increasing (monotonic)
        for i in 1..uids.len() {
            assert!(uids[i] > uids[i - 1], "UIDs are not monotonic at index {}", i);
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
