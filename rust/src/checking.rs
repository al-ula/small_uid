use crate::{Error, SmallUidError};

/// Checks if the timestamp is within the 44-bit range.
pub fn timestamp_check(timestamp: u64) -> Result<u64, Error> {
    if timestamp < (1 << 44) - 1 {
        Ok(timestamp)
    } else {
        Err(SmallUidError::TimestampLimit)
    }
}

/// Checks if the random number is within the 20-bit range.
pub fn rng_size_check(rn: u64) -> Result<u64, Error> {
    if rn < (1 << 20) {
        Ok(rn)
    } else {
        Err(SmallUidError::RandomSizeLimit)
    }
}
