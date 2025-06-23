//!
#![doc = include_str!("../README.md")]
//!
/// Checking timestamp and random number
pub mod checking;
mod error;
/// Generating timestamp and random number
mod generation;

pub use generation::timestamp_gen;

mod monotonic;

pub use monotonic::MonotonicGenerator;

#[cfg(test)]
mod test;

pub use error::SmallUidError;
use generation::assemble;
use std::fmt::Display;
type Error = SmallUidError;

#[cfg(all(not(target_arch = "wasm32"), feature = "serde"))]
use serde::{Deserialize, Serialize};

#[doc = r#"# Examples

## Generate a single SmallUid
```rust
use small_uid::SmallUid;

let id = SmallUid::new();
println!("Generated SmallUid: {}", id);
```

## Generate a batch of SmallUids
```rust
use small_uid::SmallUid;

let ids = SmallUid::batch_new(5);
for id in ids {
    println!("Batch SmallUid: {}", id);
}
```

## Generate SmallUids using monotonic generator
```rust
let mut generator = SmallUid::init_monotonic();
let id = generator.generate();
println!("Monotonic SmallUid: {}", id);

let ids = generator.generate_batch(3);
for id in ids {
    println!("Monotonic Batch SmallUid: {}", id);
}

let timestamp = timestamp_gen().unwrap();
let full_id: [SmallUid; 1024] = generator.generate_full(timestamp);
```"#]

#[cfg_attr(
    all(not(target_arch = "wasm32"), feature = "serde"),
    derive(Serialize, Deserialize)
)]
#[derive(Hash, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct SmallUid(pub u64);  

impl SmallUid {
    /// Creates a new small unique identifier.
    pub fn new() -> SmallUid {
        generation::generate().unwrap()
    }

    /// Creates a batch of small unique identifiers.
    pub fn batch_new(count: usize) -> Vec<SmallUid> {
        let mut smalluids = Vec::new();
        for _ in 0..count {
            smalluids.push(generation::generate().unwrap());
        }
        smalluids
    }

    /// Initializes a monotonic generator.
    ///
    /// Monotonic SmallUid replaces the first 10 bits of randomness with an increment,
    /// giving 1024 UIDs per millisecond.
    pub fn init_monotonic() -> MonotonicGenerator {
        MonotonicGenerator {
            last_ms: 0,
            lower_bits: 0,
            upper_counter: 0,
        }
    }

    /// Creates a SmallUid from the provided timestamp and random number.
    pub fn from_parts(timestamp: u64, random: u64) -> SmallUid {
        assemble(timestamp, random)
    }

    /// Creates a SmallUid from the provided timestamp.
    pub fn from_timestamp(timestamp: u64) -> SmallUid {
        let random = generation::random_gen();
        assemble(timestamp, random)
    }

    /// Creates a SmallUid from the provided random number.
    pub fn from_random(random: u64) -> SmallUid {
        let timestamp = generation::timestamp_gen().unwrap();
        assemble(timestamp, random)
    }

    /// Take and normalze timestamp from SmallUid.
    pub fn get_timestamp(&self) -> u64 {
        self.0 >> 20
    }

    pub fn get_random(&self) -> u64 {
        self.0 & 0xFFFFF
    }

    pub fn to_u64(&self) -> u64 {
        self.0
    }
}

impl From<u64> for SmallUid {
    fn from(value: u64) -> Self {
        SmallUid(value)
    }
}

impl From<SmallUid> for u64 {
    fn from(value: SmallUid) -> Self {
        value.0
    }
}

impl TryFrom<String> for SmallUid {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        let value = value.replace("+", "-").replace("/", "_").replace("=", "");
        if !value
            .chars()
            .all(|c| matches!(c, 'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_'))
        {
            return Err(SmallUidError::InvalidChar);
        }
        let value = match value.len().cmp(&11) {
            std::cmp::Ordering::Greater => value[0..11].to_string(),
            std::cmp::Ordering::Less => return Err(SmallUidError::NotABase64Url),
            std::cmp::Ordering::Equal => value,
        };
        let smalluidstr = &value;
        let mut smalluidvec = Vec::new();
        base64_url::decode_to_vec(smalluidstr, &mut smalluidvec)?;
        let smalluidarr: [u8; 8] = smalluidvec
            .try_into()
            .map_err(|_| SmallUidError::VecToArray)?;
        let smalluidu64 = u64::from_be_bytes(smalluidarr);
        Ok(SmallUid(smalluidu64))
    }
}

impl From<SmallUid> for String {
    fn from(value: SmallUid) -> Self {
        value.to_string()
    }
}

impl Display for SmallUid {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let smalluid = base64_url::encode(&self.0.to_be_bytes());
        write!(f, "{}", smalluid)
    }
}