import { escapeUrl, SmallUid } from "./mod.ts";
import { generate } from "./src/generator.ts";

const random = generate();
const timestamp = BigInt(Date.now());
const string = SmallUid.genClassic().string;
const invalidString = string + "=";

Deno.bench({
  name: "generate",
  fn() {
    SmallUid.genClassic();
  },
});

Deno.bench({
  name: "generate secure",
  fn() {
    SmallUid.genClassic("secure");
  },
});

Deno.bench({
  name: "generate secure with WASM",
  fn() {
    SmallUid.gen();
  },
});

Deno.bench({
  name: "from timestamp",
  fn() {
    SmallUid.fromTimestamp(timestamp);
  },
});

Deno.bench({
  name: "from random",
  fn() {
    SmallUid.fromRandom(random);
  },
});

Deno.bench({
  name: "from parts",
  fn() {
    SmallUid.fromParts(timestamp, random);
  },
});

Deno.bench({
  name: "from string",
  fn() {
    new SmallUid(string);
  },
});

Deno.bench({
  name: "Escape url",
  fn() {
    escapeUrl(invalidString);
  },
});
