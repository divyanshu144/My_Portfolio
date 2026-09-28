import test from 'node:test';
import assert from 'node:assert/strict';
import { isContactValid } from './validateContact.js';

const ok = { name: 'Ada', email: 'ada@example.com', message: 'Hello' };

test('accepts a complete, well-formed message', () => {
  assert.equal(isContactValid(ok), true);
  assert.equal(isContactValid({ ...ok, email: '  ada@example.com  ' }), true);
});

test('rejects whitespace-only name or message', () => {
  assert.equal(isContactValid({ ...ok, name: '   ' }), false);
  assert.equal(isContactValid({ ...ok, message: '\n \t' }), false);
  assert.equal(isContactValid({ ...ok, name: '' }), false);
});

test('rejects malformed emails', () => {
  for (const email of ['', 'ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
    assert.equal(isContactValid({ ...ok, email }), false, email);
  }
});
