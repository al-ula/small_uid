import {generate as generateWasm} from "../rng/small_uid_rng.js";

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