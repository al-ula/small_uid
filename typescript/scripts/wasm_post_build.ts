import { exists } from "@std/fs";

console.log("running at: " + Deno.cwd());
console.log("target path: " + Deno.args);

// check if the target directory is appended by / or not
const targetDir = Deno.args[0].endsWith("/")
  ? Deno.args[0]
  : Deno.args[0] + "/";

console.info("checking if web.js and web.d.ts exists");
try {
  await exists(targetDir + "web.js");
  await exists(targetDir + "web.d.ts");
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

console.info("deleting web_bg.wasm and web_bg.wasm.d.ts");
const wasmExists = await exists(targetDir + "web_bg.wasm");
if (!wasmExists) {
  console.info("web_bg.wasm not exists, skipping...");
} else {
  try {
    await Deno.remove(targetDir + "web_bg.wasm");
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}
const wasmDtsExists = await exists(targetDir + "web_bg.wasm.d.ts");
if (!wasmDtsExists) {
  console.info("web_bg.wasm.d.ts not exists, skipping...");
} else {
  try {
    await Deno.remove(targetDir + "web_bg.wasm.d.ts");
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}

console.info("reading web.js");
const webJs = await Deno.readTextFile(targetDir + "web.js");

console.info("checking if web.js contains web_bg.wasm");
if (webJs.includes("web_bg.wasm")) {
  console.info("replacing web_bg.wasm with rng_bg.wasm");
  try {
    await Deno.writeTextFile(
      targetDir + "web.js",
      webJs.replace("web_bg.wasm", "rng_bg.wasm"),
    );
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
} else {
  console.info("web.js does not contain web_bg.wasm, skipping...");
}
