import test from 'node:test';
import assert from 'node:assert';

import { escapeUrl, SmallUid } from "small-uid";

test("new", () => {
  const uid = new SmallUid();
  assert.strictEqual(uid.value, 0n);
});