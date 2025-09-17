import { build } from "tsup";
import { wasmLoader } from "esbuild-plugin-wasm";

const entries = ["mod.ts", "pure.ts"]
for (const entry in entries) {
  await buildFull(entry);
  await buildMin(entry);
}
await copyFiles([
  // ["./rng/small_uid_rng_bg.wasm", "./dist/small_uid_rng_bg.wasm"],
  // ["./rng/small_uid_rng_bg.wasm.d.ts", "./dist/small_uid_rng_bg.wasm.d.ts"],
  ["../LICENSE-APACHE", "./LICENSE-APACHE"],
  ["../LICENSE-MIT", "./LICENSE-MIT"],
]);

function buildFull(entry: string) {
  return build({
    entry: [entry],
    splitting: false,
    clean: true,
    target: "es2022",
    format: ["esm"],
    platform: "neutral",
    dts: true,
    esbuildPlugins: [
      wasmLoader({
        mode: "embedded",
      }),
    ],
  });
}

function buildMin(entry: string) {

  const name = entry === "mod.ts" ? "small-uid" : "small-uid-pure"

  return build({
    entry: {
      [name]: entry,
    },
    clean: false,
    target: "es2022",
    format: ["esm"],
    platform: "neutral",
    dts: false,
    minify: true,
    outExtension({ format }) {
      if (format === "cjs") {
        return {
          js: `.min.cjs`,
        };
      } else {
        return {
          js: `.min.js`,
        };
      }
    },
    esbuildPlugins: [
      wasmLoader({
        mode: "embedded",
      }),
    ],
  });
}

async function copyFiles(list: [string, string][]) {
  for (const [file, dest] of list) {
    console.log(`Copying ${file} to ${dest}`);
    await Deno.copyFile(file, dest).catch((err) => {
      console.error(`Failed to copy ${file} to ${dest}:`, err);
    });
    console.log(`Copying successful`);
  }
}
