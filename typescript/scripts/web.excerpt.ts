import init from "./rng/web.js";

/**
 * Initializes the wasm module for SmallUid generation.
 *
 * This function must be called before SmallUid generation can be used.
 */
export async function initWasm() {
  await init();
}
