import { SmallUid } from "../mod.ts";

for (let i = 0; i < 1000; i++) {
  const uid = SmallUid.gen();
  console.log(uid.value);
  console.log(uid.string);
  console.log(uid.random);
}