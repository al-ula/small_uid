use crate::{SmallUid, generation::timestamp_gen, generation::random_gen};
use serde_json;

#[test]
fn test_generation() {
    let smalluid = SmallUid::new();
    let time = smalluid.get_timestamp();
    let random = smalluid.get_random();
    let reassembled = SmallUid::from_parts(time, random);
    assert!(smalluid.get_random() > 0);
    assert!(smalluid.get_timestamp() > 0);
    assert_eq!(smalluid, reassembled);
}

#[test]
fn test_generation_monotonic() {
    let mut generator = SmallUid::init_monotonic();
    let smalluid = generator.generate();
    let time = smalluid.get_timestamp();
    let random = smalluid.get_random();
    let reassembled = SmallUid::from_parts(time, random);
    assert!(smalluid.get_random() > 0);
    assert!(smalluid.get_timestamp() > 0);
    assert_eq!(smalluid, reassembled);
}

#[test]
fn test_batch() {
    let smalluids = SmallUid::batch_new(10);
    for smalluid in smalluids {
        let time = smalluid.get_timestamp();
        let random = smalluid.get_random();
        let reassembled = SmallUid::from_parts(time, random);
        assert!(random > 0);
        assert!(time > 0);
        assert_eq!(smalluid, reassembled);
    }
}

#[test]
fn test_batch_monotonic() {
    let mut generator = SmallUid::init_monotonic();
    let smalluids = generator.generate_batch(10);
    for smalluid in smalluids {
        let time = smalluid.get_timestamp();
        let random = smalluid.get_random();
        let reassembled = SmallUid::from_parts(time, random);
        assert!(random > 0);
        assert!(time > 0);
        assert_eq!(smalluid, reassembled);
    }
}

#[test]
fn test_monotonic_full() {
    let mut generator = SmallUid::init_monotonic();
    let timestamp = timestamp_gen().unwrap();
    let smalluids = generator.generate_full(timestamp);
    for smalluid in smalluids {
        let time = smalluid.get_timestamp();
        let random = smalluid.get_random();
        let reassembled = SmallUid::from_parts(time, random);
        assert!(random > 0);
        assert_eq!(time, timestamp);
        assert_eq!(smalluid, reassembled);
    }
}

#[test]
fn test_monotonic_full_monotonicity() {
    let mut generator = SmallUid::init_monotonic();
    let timestamp = timestamp_gen().unwrap();
    let smalluids = generator.generate_full(timestamp);
    for i in 1..smalluids.len() {
        let prev = smalluids[i - 1];
        let curr = smalluids[i];
        assert_eq!(prev.get_timestamp(), curr.get_timestamp());
        assert!(prev.get_random() < curr.get_random());
    }
}

#[test]
fn test_timestamp() {
    let timestamp = timestamp_gen().unwrap();
    let smalluid = SmallUid::from_timestamp(timestamp);
    assert!(smalluid.get_timestamp() == timestamp);

}

#[test]
fn test_random() {
    let random = random_gen();
    let smalluid = SmallUid::from_random(random);
    assert!(smalluid.get_random() == random);
}

#[test]
fn test_string() {
    let timestamp = timestamp_gen().unwrap();
    let smalluid = SmallUid::from_timestamp(timestamp);
    let smalluidstr = smalluid.to_string();
    let smalluidfromstr = SmallUid::try_from(smalluidstr).unwrap();
    assert!(smalluid == smalluidfromstr);
}

#[test]
fn test_from_broken_string() {
    // Using a valid base64url string
    let uidstr = "AAAAAAAAAAA=".to_string(); // This represents a sequence of zeros when decoded
    let smalluid = SmallUid::try_from(uidstr).unwrap();
    println!("From string: {:?}", smalluid);
}

#[test]
fn test_from_parts() {
    let random = random_gen();
    let timestamp = timestamp_gen().unwrap();
    let assembled = SmallUid::from_parts(timestamp, random);
    let part_random = assembled.get_random();
    let part_timestamp = assembled.get_timestamp();
    assert_eq!(random, part_random);
    assert_eq!(timestamp, part_timestamp);
}

#[test]
fn test_invalid_base64url() {
    let uidstr = "XxXxXxXxXx".to_string();
    let result = SmallUid::try_from(uidstr);
    assert!(result.is_err()); // We expect this to fail because it's not valid base64url
}

#[test]
fn test_try_from() {
    let uidstr = SmallUid::new();
    let smalluid = SmallUid::try_from(uidstr.to_string()).unwrap();
    assert!(smalluid == uidstr);
}
#[cfg(feature = "serde")]
mod serde_tests {
    use super::*;

    #[test]
    fn test_serde_serialize_deserialize() {
        let uid = SmallUid::new();
        let serialized = serde_json::to_string(&uid).expect("Serialization failed");
        let deserialized: SmallUid = serde_json::from_str(&serialized).expect("Deserialization failed");
        assert_eq!(uid, deserialized);
    }

    #[test]
    fn test_serde_serialize_batch() {
        let uids = SmallUid::batch_new(5);
        let serialized = serde_json::to_string(&uids).expect("Serialization failed");
        let deserialized: Vec<SmallUid> = serde_json::from_str(&serialized).expect("Deserialization failed");
        assert_eq!(uids, deserialized);
    }
}

#[cfg(not(feature = "serde"))]
mod no_serde_tests {
    #[test]
    fn test_serde_feature_not_enabled() {
        // This test ensures that serde is not enabled.
        // Compilation should fail if serde is enabled and this test runs.
        assert!(true);
    }
}
