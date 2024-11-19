import * as assert from "@std/assert";
import { escapeUrl, SmallUid } from "./mod.ts";
import { expect } from "jsr:@std/expect";

const assertNotEquals = assert.assertNotEquals;
const assertEquals = assert.assertEquals;

Deno.test("new", () => {
  const uid = new SmallUid();
  // console.log(uid.value);
  assertEquals(uid.value, 0n);
});

Deno.test("generate", () => {
  const uid = SmallUid.gen();
  console.log(uid.string);
  console.log(uid.value);
  assertNotEquals(uid.string, "");
  assertNotEquals(uid.value, 0n);
});

Deno.test("from timestamp", () => {
  const uid = SmallUid.gen();
  const uidTimestamp = uid.timestamp;
  const uid2 = SmallUid.fromTimestamp(uidTimestamp);
  const uid2Timestamp = uid2.timestamp;
  assertEquals(uidTimestamp, uid2Timestamp);
});

Deno.test("from random", () => {
  const uid = SmallUid.gen();
  const uidRandom = uid.random;
  const uid2 = SmallUid.fromRandom(uidRandom);
  const uid2Random = uid2.random;
  console.log("random 1:", uidRandom);
  console.log("random 2:", uid2Random);
  console.log("value2:", uid2.value);
  assertEquals(uidRandom, uid2Random);
});

Deno.test("from parts", () => {
  const uid = SmallUid.gen();
  const [uidTimestamp, uidRandom] = uid.disassembled;
  const uid2 = SmallUid.fromParts(uidTimestamp, uidRandom);
  const [uid2Timestamp, uid2Random] = uid2.disassembled;
  assertEquals(uidTimestamp, uid2Timestamp);
  assertEquals(uidRandom, uid2Random);
});

Deno.test("get timestamp", () => {
  const uid = SmallUid.gen();
  const timestamp = uid.timestamp;
  assertEquals(typeof timestamp, "bigint");
  assertEquals(timestamp >= 0n, true);
});

Deno.test("get random", () => {
  const random: bigint = SmallUid.gen().random;
  const uid = SmallUid.fromRandom(random);
  const uidRandom: bigint = uid.random;
  console.log("random 1:", random.toString(2));
  console.log("random 2:", uidRandom.toString(2));
  assertEquals(uidRandom, random);
});

Deno.test("Disassemble", () => {
  const uid = SmallUid.gen();
  const [timestamp, random] = uid.disassembled;
  console.log(timestamp);
  console.log(random);
  assertEquals(typeof timestamp, "bigint");
  assertEquals(typeof random, "bigint");
});

Deno.test("Convert Base64", () => {
  const base64 = "PDw/Pz8+Pg==";
  const base64url = "PDw_Pz8-Pg";
  assertEquals(escapeUrl(base64), base64url);
});

Deno.test("Create from String", () => {
  const uid1 = SmallUid.gen();
  const string = uid1.string;
  console.log("string is: ", string);
  const uid2 = new SmallUid(string);
  console.log("value is: ", uid1.value);
  console.log("value is: ", uid2.value);
  assertEquals(uid1.value, uid2.value);
  assertEquals(uid1.string, uid2.string);
});

Deno.test("Create from negative timestamp", () => {
  const uid = SmallUid.gen();
  const timestamp: bigint = -uid.timestamp;
  expect(() => SmallUid.fromTimestamp(timestamp)).toThrow();
});

Deno.test("Create from negative random", () => {
  const uid = SmallUid.gen();
  const random = -uid.random;
  expect(() => SmallUid.fromRandom(random)).toThrow();
});

Deno.test("Create from short string", () => {
  const uid = SmallUid.gen();
  const string = uid.string.slice(0, 5);
  expect(() => new SmallUid(string)).toThrow();
});

Deno.test("Create from long string", () => {
  const uid = SmallUid.gen();
  const string = uid.string + "a";
  const uid2 = new SmallUid(string);
  assertEquals(uid.value, uid2.value);
});

Deno.test("Create from invalid Base64 string", () => {
  const string = "GTQFg4x-VYo";
  const uid = new SmallUid(string);
  assertEquals(string, uid.string);
});

Deno.test("Create from invalid Base64url string", () => {
  const string = "GTQFg4x+VYo";
  expect(() => new SmallUid(string)).toThrow();
});

Deno.test("Create from giant random", () => {
  const random = 0xFFFFFFFF_FFFFFFFF_FFFFn;
  const uid = SmallUid.fromRandom(random);
  assertEquals(uid.string.length, 11);
});

Deno.test("Create from giant timestamp", () => {
  const timestamp = 0xFFFFFFFF_FFFFFFFF_FFFFn;
  expect(() => SmallUid.fromTimestamp(timestamp)).toThrow();
});
