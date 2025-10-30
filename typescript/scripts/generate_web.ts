import { exists } from "@std/fs";

console.log("running at: " + Deno.cwd());
console.log("target file: " + Deno.args);

console.info("checking if the file exists");
try {
  await exists(Deno.args[0]);
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

console.info("reading the file");
const targetFile = await Deno.readTextFile(Deno.args[0]);

const excerpt = await Deno.readTextFile("./scripts/web.excerpt.ts");

console.info("checking if the file contain wasmGenerator.ts");
if (targetFile.includes("wasmGenerator.ts")) {
  console.info("replacing wasmGenerator.ts with wasmGeneratorWeb.ts");

  console.info("writing web.ts");
  try {
    await Deno.writeTextFile(
      "web.ts",
      targetFile.replace(
        `import { generateWasmSecure } from "./src/wasmGenerator.ts";`,
        `import { generateWasmSecure } from "./src/wasmGeneratorWeb.ts";\n${excerpt}`,
      ),
    );
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}
