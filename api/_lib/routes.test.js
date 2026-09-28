import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBlogHandler } from '../blog.js';
import { makeProjectsHandler } from '../projects.js';

const makeRes = () => ({
  headers: {}, statusCode: 200, body: undefined, ended: false,
  setHeader(k, v) { this.headers[k] = v; },
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
  end() { this.ended = true; return this; },
});

for (const [name, make, key] of [
  ['blog', makeBlogHandler, 'posts'],
  ['projects', makeProjectsHandler, 'projects'],
]) {
  test(`${name}: GET returns data with cache headers`, async () => {
    const res = makeRes();
    await make(async () => [{ id: 1 }])({ method: 'GET' }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { [key]: [{ id: 1 }] });
    assert.match(res.headers['Cache-Control'], /s-maxage=1800/);
  });

  test(`${name}: upstream failure gives 502 with a JSON error`, async () => {
    const res = makeRes();
    await make(async () => { throw new Error('down'); })({ method: 'GET' }, res);
    assert.equal(res.statusCode, 502);
    assert.equal(typeof res.body.error, 'string');
  });

  test(`${name}: non-GET is rejected with 405`, async () => {
    const res = makeRes();
    await make(async () => [])({ method: 'POST' }, res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.ended, true);
  });
}
