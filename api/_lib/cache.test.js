import test from 'node:test';
import assert from 'node:assert/strict';
import { withCache } from './cache.js';

const clock = (start = 0) => {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
};

test('returns the cached value within the ttl', async () => {
  const now = clock();
  let calls = 0;
  const get = withCache(1000, async () => ++calls, now);
  assert.equal(await get(), 1);
  now.advance(999);
  assert.equal(await get(), 1);
  assert.equal(calls, 1);
});

test('refetches after the ttl expires', async () => {
  const now = clock();
  let calls = 0;
  const get = withCache(1000, async () => ++calls, now);
  await get();
  now.advance(1000);
  assert.equal(await get(), 2);
});

test('concurrent calls share one in-flight fetch', async () => {
  let calls = 0;
  const get = withCache(1000, async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return 'x'; });
  const results = await Promise.all([get(), get(), get()]);
  assert.deepEqual(results, ['x', 'x', 'x']);
  assert.equal(calls, 1);
});

test('serves stale data when a refresh fails, without retrying until the ttl passes', async () => {
  const now = clock();
  let calls = 0;
  let fail = false;
  const get = withCache(1000, async () => {
    calls++;
    if (fail) throw new Error('upstream down');
    return 'fresh';
  }, now);
  assert.equal(await get(), 'fresh');
  fail = true;
  now.advance(1000);
  assert.equal(await get(), 'fresh');        // stale returned
  assert.equal(calls, 2);
  now.advance(500);
  assert.equal(await get(), 'fresh');        // within restarted ttl: no upstream call
  assert.equal(calls, 2);
});

test('rethrows when there is nothing cached, and retries on the next call', async () => {
  let calls = 0;
  const get = withCache(1000, async () => {
    calls++;
    if (calls === 1) throw new Error('boom');
    return 'ok';
  });
  await assert.rejects(get(), /boom/);
  assert.equal(await get(), 'ok');
});
