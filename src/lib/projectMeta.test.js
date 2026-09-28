import test from 'node:test';
import assert from 'node:assert/strict';
import { projectMeta } from './projectMeta.js';

test('joins language, stars and last-push month', () => {
  assert.equal(
    projectMeta({ github: { language: 'Python', stars: 7, pushedAt: '2026-08-01T10:00:00Z' } }),
    'Python · ★ 7 · Aug 2026',
  );
});

test('omits missing parts and shows 0 stars', () => {
  assert.equal(projectMeta({ github: { language: null, stars: 0, pushedAt: null } }), '★ 0');
});

test('is empty when there is no GitHub data or the date is invalid', () => {
  assert.equal(projectMeta({ github: null }), '');
  assert.equal(projectMeta({}), '');
  assert.equal(projectMeta({ github: { language: 'Go', stars: 1, pushedAt: 'garbage' } }), 'Go · ★ 1');
});
