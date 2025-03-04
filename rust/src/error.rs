use base64_url::base64::DecodeSliceError;
use std::time::SystemTimeError;

/// Errors that can occur when creating a SmallUid.
#[derive(Debug)]
pub enum SmallUidError {
    SystemTime(SystemTimeError),
    TimestampLimit,
    RandomSizeLimit,
    NotABase64Url,
    DecodeSlice(DecodeSliceError),
    VecToArray,
    InvalidChar,
    MonotonicCounterLimit,
}

impl From<SystemTimeError> for SmallUidError {
    fn from(err: SystemTimeError) -> Self {
        SmallUidError::SystemTime(err)
    }
}

impl From<DecodeSliceError> for SmallUidError {
    fn from(err: DecodeSliceError) -> Self {
        SmallUidError::DecodeSlice(err)
    }
}

impl std::error::Error for SmallUidError {}

impl std::fmt::Display for SmallUidError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SmallUidError::SystemTime(err) => err.fmt(f),
            SmallUidError::TimestampLimit => {
                f.write_str("TimestampLimit: Timestamp too large. Is it year 2528?")
            }
            SmallUidError::RandomSizeLimit => {
                f.write_str("RandomSizeLimit: Random number too large. How?")
            }
            SmallUidError::NotABase64Url => f.write_str("NotABase64Url: Not a base64url string"),
            SmallUidError::DecodeSlice(err) => err.fmt(f),
            SmallUidError::VecToArray => f.write_str("VecToArray: Failed to convert"),
            SmallUidError::InvalidChar => f.write_str("InvalidChar: Invalid character"),
            SmallUidError::MonotonicCounterLimit => {
                f.write_str("MonotonicCounterLimit: Monotonic counter limit reached")
            }
        }
    }
}
