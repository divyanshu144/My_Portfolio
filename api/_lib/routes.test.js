import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBlogHandler } from '../blog.js';

const makeRes = () => ({
  headers: {}, statusCode: 200, body: undefined, ended: false,
  setHeader(k, v) { this.headers[k] = v; },
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
  end() { this.ended = true; return this; },
});

test('blog: GET returns posts with cache headers', async () => {
  const res = makeRes();
  await makeBlogHandler(async () => [{ id: 1 }])({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { posts: [{ id: 1 }] });
  assert.match(res.headers['Cache-Control'], /s-maxage=1800/);
});

test('blog: upstream failure gives 502 with a JSON error', async () => {
  const res = makeRes();
  await makeBlogHandler(async () => { throw new Error('down'); })({ method: 'GET' }, res);
  assert.equal(res.statusCode, 502);
  assert.equal(typeof res.body.error, 'string');
});

test('blog: non-GET is rejected with 405', async () => {
  const res = makeRes();
  await makeBlogHandler(async () => [])({ method: 'POST' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.ended, true);
});
