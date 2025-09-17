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
