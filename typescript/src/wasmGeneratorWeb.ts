import { generate } from "../rng/web.js";

let randPool: bigint[] = [];
export function generateWasmSecure(): bigint {
  if (randPool.length === 0) {
    // Assuming generateWasm returns an array of numbers or strings
    randPool = Array.from(
      generate(20),
      (v: unknown) => BigInt(v as string | number),
    );
  }

  const randomValue = randPool.pop();
  if (randomValue === undefined) {
    throw new Error("No more random values available in pool");
  }
  return randomValue;
}
