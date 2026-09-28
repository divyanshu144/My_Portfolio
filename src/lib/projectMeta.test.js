import test from 'node:test';
import assert from 'node:assert/strict';
import { projectMeta, liveDemoUrl, extraTopics } from './projectMeta.js';

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

test('liveDemoUrl accepts http and https homepages', () => {
  assert.equal(liveDemoUrl({ github: { homepage: 'https://demo.example/x' } }), 'https://demo.example/x');
  assert.equal(liveDemoUrl({ github: { homepage: 'http://demo.example' } }), 'http://demo.example');
});

test('liveDemoUrl rejects other schemes, empty, null and missing github', () => {
  assert.equal(liveDemoUrl({ github: { homepage: 'javascript:alert(1)' } }), null);
  assert.equal(liveDemoUrl({ github: { homepage: 'ftp://x.example' } }), null);
  assert.equal(liveDemoUrl({ github: { homepage: '' } }), null);
  assert.equal(liveDemoUrl({ github: { homepage: null } }), null);
  assert.equal(liveDemoUrl({ github: null }), null);
  assert.equal(liveDemoUrl({}), null);
  assert.equal(liveDemoUrl(undefined), null);
});

test('extraTopics dedupes case-insensitively against tech and drops duplicates', () => {
  const p = { tech: ['Python', 'RAG'], github: { topics: ['python', 'rag', 'llm', 'LLM', 'faiss'] } };
  assert.deepEqual(extraTopics(p), ['llm', 'faiss']);
});

test('extraTopics limits to 3', () => {
  const p = { tech: [], github: { topics: ['a', 'b', 'c', 'd', 'e'] } };
  assert.deepEqual(extraTopics(p), ['a', 'b', 'c']);
});

test('extraTopics is empty with no topics, no github or no tech list', () => {
  assert.deepEqual(extraTopics({ tech: ['x'], github: { topics: [] } }), []);
  assert.deepEqual(extraTopics({ tech: ['x'], github: null }), []);
  assert.deepEqual(extraTopics({ github: { topics: ['a'] } }), ['a']);
});
