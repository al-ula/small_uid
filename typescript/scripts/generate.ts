import { SmallUid } from "../mod.ts";

const uidStringArray: string[] = [];

for (let i = 0; i < 1000; i++) {
  const uid = SmallUid.gen();
  uidStringArray.push(uid.string);
}
console.log("done generating");

for (let i = 0; i < 1000; i++) {
  const uid = new SmallUid(uidStringArray[i]);
  console.log(uid.string);
}
