# Small UID

[![GitHub License](https://img.shields.io/github/license/al-ula/small_uid)](https://github.com/al-ula/small_uid/typescript/blob/master/LICENSE-APACHE)
[![GitHub License](https://img.shields.io/badge/license-MIT-limegreen)](https://github.com/al-ula/small_uid/typescript/blob/master/LICENSE-MIT)
![GitHub branch check runs](https://img.shields.io/github/check-runs/al-ula/small_uid/master)
[![Crates.io Version](https://img.shields.io/crates/v/small_uid)](https://crates.io/crates/small_uid)
[![JSR](https://jsr.io/badges/@al-ula/small-uid)](https://jsr.io/@al-ula/small-uid)
[![NPM Version](https://img.shields.io/npm/v/small-uid)](https://www.npmjs.com/package/small-uid)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fal-ula%2Fsmall_uid.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fal-ula%2Fsmall_uid?ref=badge_shield&issueType=security)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fal-ula%2Fsmall_uid.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fal-ula%2Fsmall_uid?ref=badge_shield&issueType=license)

_Small UID_ is a small, url-safe, user-friendly unique, lexicographically
sortable id generator.

UUIDs are frequently used as database _Primary Key_ in software development.
However, they aren't the best choice mainly due to their random sorting and the
resulting fragmentation in databases indexes.

UUIDs are frequently used as database _Primary Key_ in software development.
However, they aren't the best choice mainly due to their random sorting and the
resulting fragmentation in databases indexes.

Using [ULIDs](https://github.com/ulid/spec) is generally a very good
alternative, solving most of UUID flaws.

Twitter's Snowflake is another option if you want to generate roughly sortable
uid. But, Snowflake is not using random numbers instead it used machine id to
generate the uid. It's a good choice if you integrate it into a distributed
systems and doesn't really need randomness.

**Small UIDs** are also an ideal alternative **when you do not need as much
uniqueness** and want **shorter "user-friendly" encoded strings**.

## Introduction

Small UIDs are short unique identifiers especially designed to be used as
efficient database _Primary Key_:

- Half smaller than UUID / ULID (64-bit)
- Lexicographically sortable
- Encodable as a short user-friendly and URL-safe base-64 string (`a-zA-Z0-9_-`)
- User-friendly strings are generated in a way to be always very different (no
  shared prefix due to similar timestamps)

|                           |      Small UID      |         ULID          |  UUID v4  |
| ------------------------- | :-----------------: | :-------------------: | :-------: |
| Size                      |       64 bits       |       128 bits        | 128 bits  |
| Monotonic sort order      | Yes &ast;&ast;&ast; |          Yes          |    No     |
| Random bits               |         20          |          80           |    122    |
| Collision odds &ast;&ast; |  1,024 _/ ms&ast;_  | 1.099e+12 _/ ms&ast;_ | 2.305e+18 |

&ast; _theorical number of generated uids before the first expected collision._\
&ast;&ast; _the uid includes a timestamp, so collisions may occur only during
the same millisecond._\
&ast;&ast;&ast; _monotonic sort order, but random order when generated at the
same millisecond._

They are internally stored as _64-bit_ integers (_44-bit_ timestamp followed by
_20 random bits_):

    |-----------------------|  |------------|
            Timestamp            Randomness
             44 bits               20 bits

The random number suffix still guarantees a decent amount of uniqueness when
many ids are created in the same millisecond (up to 1,048,576 different values)
and you may only expect collision if you're generating more than 1024 random ids
during the same millisecond.

### Sorting

Because of the sequential timestamp, _Small UIDs_ are naturally sorted
chronologically. It **improves indexing** when inserting values in databases,
new ids being appended to the end of the table without reshuffling existing data
(read more
[in this article](https://www.codeproject.com/Articles/388157/GUIDs-as-fast-primary-keys-under-multiple-database)).

However, **sort order within the same millisecond is not guaranteed** because of
the random bits suffix.

This project is loose reimplementation of
[Small-UID](https://github.com/Mediagone/small-uid) by
[Mediagone](https://github.com/Mediagone) with the only difference is the string
encoding for this one is base64-url instead of base62 for enabling wider
usecases.

## Example

### Rust

#### Generating Small UIDs

```rust
let smalluid1 = SmallUid::new();
let smalluid2 = SmallUid::try_from("GSntNvOw6n8".to_string()).unwrap();
```

#### Converting Small UIDs

```rust
let smalluid = SmallUid::new();
let uid_string = smalluid.to_string();
```

### Typescript

#### Generating Small UIDs

```typescript
import { SmallUid } from "@al-ula/small-uid";

const uid = SmallUid.gen();
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying integer value
```

#### Generating Small UIDs from a 64-bit integer

```typescript
const smallUidValue: bigint = 0x123456789abcdefn;
const uid = new SmallUid(smallUidValue);
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying numeric value
```

#### Generating Small UIDs from a string

```typescript
const smallUidString = "XxXxXxXxXxX";
const uid = new SmallUid(smallUidString);
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying numeric value
```

## Version 1.0.0 when?
This library is considered API stable and ready for production use. There will be no breaking changes to the API except for critical issues.

But I still want to implement monotonicity. The v1 release will be done when I'm finished implementing monotonicity.