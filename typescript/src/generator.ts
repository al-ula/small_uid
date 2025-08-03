import { generate as generateWasm } from "../rng/small_uid_rng.js";

// const initialized = await init();

/**
 * Generates a random 64-bit bigint value using cryptographic randomness.
 * @returns A random 64-bit bigint.
 */
export function generateSecure(): bigint {
  const array = new BigUint64Array(1);
  crypto.getRandomValues(array);
  return BigInt(array[0]);
}

export function generate(): bigint {
  return BigInt(Math.floor(Math.random() * (1 << 20)));
}

let randPool: bigint[] = [];
export function generateWasmSecure(): bigint {
  if (randPool.length === 0) {
    randPool = randPool = Array.from(generateWasm(20), (v) => BigInt(v));
  }

  const randomValue = randPool.pop();
  if (randomValue === undefined) {
    throw new Error("No more random values available in pool");
  }
  return randomValue;
}
