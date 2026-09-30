import test from 'node:test';
import assert from 'node:assert/strict';
import { createFactPicker } from './facts.js';

const seeded = (values) => { let i = 0; return () => values[i++ % values.length]; };
const FACTS = ['a', 'b', 'c', 'd'];

test('returns every fact exactly once per cycle', () => {
  const pick = createFactPicker(FACTS, seeded([0.1, 0.7, 0.3, 0.9, 0.5]));
  const cycle = [pick.next(), pick.next(), pick.next(), pick.next()];
  assert.deepEqual([...cycle].sort(), FACTS);
});

test('never repeats the same fact back to back, even across cycles', () => {
  const pick = createFactPicker(FACTS, seeded([0, 0, 0, 0, 0.99, 0.5, 0.2]));
  let prev = pick.next();
  for (let i = 0; i < 40; i++) {
    const cur = pick.next();
    assert.notEqual(cur, prev);
    prev = cur;
  }
});

test('a single fact repeats (nothing else to show)', () => {
  const pick = createFactPicker(['only']);
  assert.equal(pick.next(), 'only');
  assert.equal(pick.next(), 'only');
});

test('empty, missing and blank facts give null', () => {
  assert.equal(createFactPicker([]).next(), null);
  assert.equal(createFactPicker(undefined).next(), null);
  assert.equal(createFactPicker(['', '  ', 5]).next(), null);
});
