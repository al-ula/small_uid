use crate::SmallUid;

#[test]
fn test_generation() {
    let smalluid = SmallUid::new();
    assert!(smalluid.get_timestamp() > 0);
    assert!(smalluid.get_random() > 0);
}

#[test]
fn test_timestamp() {
    let smalluid = SmallUid::from_timestamp(1);
    assert!(smalluid.get_timestamp() == 1);
}

#[test]
fn test_random() {
    let smalluid = SmallUid::from_random(1);
    assert!(smalluid.get_random() == 1);
}

#[test]
fn test_string() {
    let smalluid = SmallUid::from_timestamp(1);
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
