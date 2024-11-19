import { build } from "tsup";

function buildFull() {
  return build({
    entry: ["mod.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    target: "es2022",
    format: ["cjs", "esm"],
    platform: "neutral",
    dts: true,
  });
}

function buildMin() {
  return build({
    entry: ["mod.ts"],
    splitting: false,
    sourcemap: false,
    clean: false,
    target: "es2022",
    format: ["cjs", "esm"],
    platform: "neutral",
    dts: false,
    minify: true,
    outExtension({ format }) {
      return {
        js: `.${format}.min.js`,
      };
    },
  });
}

await buildFull();
await buildMin();
