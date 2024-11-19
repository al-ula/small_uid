import { decode, encode } from "./src/utils.ts";
import { generate } from "./src/generator.ts";

/**
 * The `SmallUid` class generates small, url-safe, lexicographically sortable, unique ids.
 *
 * The generated ids are 64-bit bigint, which are base64url encoded.
 * The first 44 bits contain the timestamp with millisecond precision.
 * The remaining 20 bits are filled with a random value.
 *
 * The `SmallUid` class is immutable and its instances are safe to be used
 * as keys in objects or as identifiers in any other context.
 *
 * If you have a SmallUid encoded in Base64 use escapeUrl to convert it to Base64url
 *
 * @example
 * import { SmallUid } from 'jsr:@al-ula/small-uid'
 * const uid = SmallUid.gen(); // 'XxXxXxXxXxX'
 * console.log(uid.string); // 12345678n
 * console.log(uid.value);
 * const alienUid = SmallUid.escapeUrl("PDw/Pz8+Pg=="); // 'PDw_Pz8-Pg'
 */
export class SmallUid {
  static #MAX: bigint = 0xFFFFFFFF_FFFFFFFFn;
  static #RIGHT20: bigint = 0xFFFFFn;
  readonly #value: bigint = 0n;

  /**
   * Creates a new `SmallUid` instance.
   * If no value is provided, the new instance will be initialized as 0n.
   * If a bigint or number is provided, the new instance will be initialized
   * with the provided value.
   * If a string is provided, the new instance will be initialized with the
   * value decoded from the provided string.
   *
   * @param {bigint | string} input - The value to initialize the instance with.
   */
  constructor(input?: bigint | string) {
    if (input === undefined || input === null) {
      return this;
    } else if (typeof input === "bigint") {
      this.#value = input & SmallUid.#MAX;
    } else {
      this.#value = this.#stringToValue(input);
    }
  }

  /**
   * @return bigint - The underlying numeric value of the small-uid.
   */
  get value(): bigint {
    return this.#value;
  }

  /**
   * @returns string - The base64url encoded string representation of the small-uid.
   */
  get string(): string {
    return this.#genString(this.#value);
  }

  /**
   * Generates a new `SmallUid` with a random value and the current timestamp.
   * @returns SmallUid - The new instance of `SmallUid`.
   */
  static gen(): SmallUid {
    const random = generate();
    const timestamp = BigInt(Date.now());
    const value: bigint = this.#assemble(timestamp, random);
    return new SmallUid(value);
  }

  /**
   * Creates a new `SmallUid` using a specified timestamp.
   *
   * The ID will contain the specified timestamp and a random value.
   * @param timestamp - The timestamp to use for the ID creation.
   * @returns SmallUid - The new instance of `SmallUid`.
   */
  static fromTimestamp(timestamp: bigint): SmallUid {
    if (timestamp.toString(2).length > 64n) {
      throw new Error("Timestamp must be less than 64 bit");
    }
    const random = generate();
    const value: bigint = this.#assemble(timestamp, random);
    return new SmallUid(value);
  }

  /**
   * Generates a new `SmallUid` using a specified random value and the current timestamp.
   *
   * @param random - The random value to use for the ID generation.
   * @returns SmallUid - The new instance of `SmallUid`.
   */
  static fromRandom(random: bigint): SmallUid {
    const timestamp: bigint = BigInt(Date.now());
    const value: bigint = this.#assemble(timestamp, random);
    return new SmallUid(value);
  }

  /**
   * Creates a new `SmallUid` using a specified timestamp and random value.
   *
   * @param timestamp - The timestamp to use for the ID creation.
   * @param random - The random value to use for the ID creation.
   * @returns SmallUid - The new instance of `SmallUid`.
   */
  static fromParts(timestamp: bigint, random: bigint): SmallUid {
    const value = this.#assemble(timestamp, random);
    return new SmallUid(value);
  }

  /**
   * Generates a base64url encoded string from a given `SmallUid` value.
   *
   * The returned string is the base64url encoded representation of the
   * `SmallUid` value.
   *
   * @param value - The `SmallUid` value to generate the string from.
   * @returns string - The base64url encoded string representation of the `SmallUid`.
   */
  #genString(value: bigint): string {
    return encode(value);
  }

  /**
   * Converts a base64url encoded string to its corresponding `SmallUid` value.
   *
   * The given string must be a valid base64url encoded string.
   *
   * @param string - The base64url encoded string to convert.
   * @returns bigint - The `SmallUid` value corresponding to the given base64url encoded string.
   * @throws Error if the given string is not a valid base64url encoded string.
   */
  #stringToValue(string: string): bigint {
    let encoded: string;
    if (string.length < 11) {
      throw new Error(`Invalid length: ${string} - ${string.length}`);
    } else if (string.length > 11) {
      encoded = string.slice(0, 11);
    } else {
      encoded = string;
    }
    const base64urlRegex = /^[A-Za-z0-9\-_]+$/;
    if (!base64urlRegex.test(encoded)) {
      throw new Error(`Invalid base64url encoded string: ${string}`);
    }
    return decode(encoded);
  }

  /**
   * Assembles a `SmallUid` value from the given timestamp and random parts.
   *
   * The returned value is a `SmallUid` value that is composed of the given
   * timestamp and random parts.
   *
   * @param timestamp - The timestamp to use for the ID creation.
   * @param random - The random value to use for the ID creation.
   * @returns bigint - The bigint value composed of the given timestamp and random parts.
   */
  static #assemble(timestamp: bigint, random: bigint): bigint {
    if (timestamp < 0n || random < 0n) {
      throw new Error(
        `timestamp and random must be positive, but got ${timestamp} and ${random}`,
      );
    }
    const time: bigint = timestamp << 20n;

    const randBitStr = random.toString(2);
    const randBitLength = randBitStr.length;
    if (randBitLength > 20) {
      if (randBitLength > 64) {
        random = (random & SmallUid.#MAX) >> 44n;
      } else {
        random = random >> 44n;
      }
    }
    return time | random;
  }

  /**
   * @returns bigint - Returns the timestamp of the `SmallUid` as a positive `bigint`.
   *
   * The returned `bigint` is the timestamp, which is a positive value
   * representing the number of milliseconds since the Unix epoch.
   * It is a 44-bit value that is embedded in the `SmallUid` value.
   */
  get timestamp(): bigint {
    return this.#value >> 20n;
  }

  /**
   * @returns bigint - Returns the value for the random value of the `SmallUid` as a positive `bigint`.
   *
   * The returned `bigint` is the random value of the `SmallUid`, which is
   * a 20-bit positive value that is embedded in the `SmallUid` value.
   */
  get random(): bigint {
    return this.#value & SmallUid.#RIGHT20;
  }

  /**
   * Disassembles a given `SmallUid` value into its timestamp and random parts.
   *
   * The returned array contains two elements:
   *   - The first element is the timestamp, which is a positive `bigint`
   *     representing the number of milliseconds since the Unix epoch.
   *   - The second element is the random value, which is a positive `bigint`
   *     with at most 20 bits.
   *
   * @returns [] - An array with two elements: the timestamp and the random value.
   */
  get disassembled(): [bigint, bigint] {
    const timestamp = this.#value >> 20n;
    const random = this.#value & SmallUid.#RIGHT20;
    return [timestamp, random];
  }
}

/**
 * Safely converts a base64 string to a base64url string.
 *
 * This function escapes a base64 string by replacing:
 *   - `+` with `-`
 *   - `/` with `_`
 *   - `=` with `` (emptiness)
 *
 * @param string - The base64 string to escape
 * @returns string - The escaped base64url string
 */
export function escapeUrl(string: string): string {
  return string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
