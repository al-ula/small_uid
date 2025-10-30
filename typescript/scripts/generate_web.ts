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

console.info("checking if the file contain wasmGenerator.ts");
if (targetFile.includes("wasmGenerator.ts")) {
  console.info("replacing wasmGenerator.ts with wasmGeneratorWeb.ts");
  targetFile.replace("wasmGenerator.ts", "wasmGeneratorWeb.ts");

  console.info("writing web.ts");
  try {
    await Deno.writeTextFile("web.ts", targetFile);
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}
