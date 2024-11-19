import { build } from "tsup";

function buildFull() {
  return build({
    entry: ["mod.ts"],
    splitting: false,
    clean: true,
    target: "es2022",
    format: ["cjs", "esm"],
    platform: "neutral",
    dts: true,
  });
}

function buildMin() {
  return build({
    entry: {
      "small-uid": "mod.ts",
    },
    clean: false,
    target: "es2022",
    format: ["cjs", "esm"],
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
  });
}

await buildFull();
await buildMin();
