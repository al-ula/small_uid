# Small UID

[![GitHub License](https://img.shields.io/github/license/al-ula/small_uid-ts)](https://github.com/al-ula/small_uid-ts/blob/master/LICENSE-APACHE)
[![GitHub License](https://img.shields.io/badge/license-MIT-limegreen)](https://github.com/al-ula/small_uid-ts/blob/master/LICENSE-MIT)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/al-ula/small_uid-ts/deno.yml?branch=master)
[![JSR](https://jsr.io/badges/@al-ula/small-uid)](https://jsr.io/@al-ula/small-uid)
[![Coverage Status](https://coveralls.io/repos/github/al-ula/small_uid-ts/badge.svg?branch=master)](https://coveralls.io/github/al-ula/small_uid-ts?branch=master)

This project is a TypeScript implementation of
[Small UID](https://github.com/al-ula/small_uid). A small, url-safe,
user-friendly unique, lexicographically sortable id generator.

UUIDs are frequently used as database _Primary Key_ in software development.
However, they aren't the best choice mainly due to their random sorting and the
resulting fragmentation in databases indexes.

Using [ULIDs](https://github.com/ulid/spec) is generally a very good
alternative, solving most of UUID flaws. But, ULID's u128 bit length is too long
for many databases if you want to use its sortable feature.

Twitter's Snowflake is another option if you want to generate roughly sortable
uid. But, Snowflake is not using random numbers instead it used machine id to
generate the uid. It's a good choice if you integrate it into a distributed
systems and doesn't really need randomness.

**Small UIDs** are also an ideal alternative **when you do not need as much
uniqueness** and want **shorter " user-friendly" encoded strings**.

## Introduction

Small UIDs are short unique identifiers especially designed to be used as
efficient database _Primary Key_:

- Half smaller than UUID / ULID (64-bit)
- Lexicographically sortable
- Encoded as a short user-friendly and URL-safe base-64 string (`a-zA-Z0-9_-`)
- User-friendly strings are generated in a way to be always very different (no
  shared prefix due to similar timestamps)

|                           |      Small UID      |         ULID          |  UUID v4  |
| ------------------------- | :-----------------: | :-------------------: | :-------: |
| Size                      |       64 bits       |       128 bits        | 128 bits  |
| Monotonic sort order      | Yes &ast;&ast;&ast; |          Yes          |    No     |
| Random bits               |         20          |          80           |    122    |
| Collision odds &ast;&ast; |  1,024 _/ ms&ast;_  | 1.099e+12 _/ ms&ast;_ | 2.305e+18 |

&ast; _theoretical number of generated uids before the first expected
collision._\
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

## Examples of usage

### Generating Small UIDs

```typescript
import { SmallUid } from "@al-ula/small-uid";

const uid = new SmallUid();
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying integer value
```

### Generating Small UIDs from a 64-bit integer

```typescript
const smallUidValue: bigint = 0x123456789abcdefn;
const uid = new SmallUid(smallUidValue);
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying numeric value
```

### Generating Small UIDs from a string

```typescript
const smallUidString = "XxXxXxXxXxX";
const uid = new SmallUid(smallUidString);
console.log(uid.string); // prints the base64url encoded string
console.log(uid.value); // prints the underlying numeric value
```
