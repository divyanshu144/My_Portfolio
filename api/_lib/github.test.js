import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRepoUrl, fetchRepoMeta, mergeProjects, createProjectsFetcher } from './github.js';

const repoJson = (over = {}) => ({
  stargazers_count: 7, language: 'Python', topics: ['rag'], homepage: 'https://demo.example',
  pushed_at: '2026-08-01T10:00:00Z', html_url: 'https://github.com/o/r', ...over,
});
const okFetch = (json) => async () => ({ ok: true, json: async () => json });

test('parseRepoUrl accepts common GitHub URL shapes and rejects others', () => {
  assert.deepEqual(parseRepoUrl('https://github.com/divyanshu144/DocChat'), { owner: 'divyanshu144', repo: 'DocChat' });
  assert.deepEqual(parseRepoUrl('https://github.com/o/r/'), { owner: 'o', repo: 'r' });
  assert.deepEqual(parseRepoUrl('https://github.com/o/r.git'), { owner: 'o', repo: 'r' });
  assert.deepEqual(parseRepoUrl('https://www.github.com/o/r?tab=readme'), { owner: 'o', repo: 'r' });
  assert.equal(parseRepoUrl('https://example.com/o/r'), null);
  assert.equal(parseRepoUrl('https://github.com/only-owner'), null);
  assert.equal(parseRepoUrl(''), null);
  assert.equal(parseRepoUrl(undefined), null);
});

test('fetchRepoMeta maps the GitHub payload', async () => {
  const meta = await fetchRepoMeta('https://github.com/o/r', { fetchImpl: okFetch(repoJson()) });
  assert.deepEqual(meta, {
    stars: 7, language: 'Python', topics: ['rag'], homepage: 'https://demo.example',
    pushedAt: '2026-08-01T10:00:00Z', htmlUrl: 'https://github.com/o/r',
  });
});

test('fetchRepoMeta returns null for 404, 403, thrown fetch and invalid urls', async () => {
  const status = (s) => async () => ({ ok: false, status: s });
  assert.equal(await fetchRepoMeta('https://github.com/o/r', { fetchImpl: status(404) }), null);
  assert.equal(await fetchRepoMeta('https://github.com/o/r', { fetchImpl: status(403) }), null);
  assert.equal(await fetchRepoMeta('https://github.com/o/r', { fetchImpl: async () => { throw new Error('net'); } }), null);
  let called = false;
  assert.equal(await fetchRepoMeta('not a url', { fetchImpl: async () => { called = true; } }), null);
  assert.equal(called, false);
});

test('fetchRepoMeta sends the bearer token only when provided, and normalises empty homepage', async () => {
  const seen = [];
  const spy = async (url, opts) => { seen.push({ url, headers: opts.headers }); return { ok: true, json: async () => repoJson({ homepage: '' }) }; };
  const meta = await fetchRepoMeta('https://github.com/o/r', { token: 'tok', fetchImpl: spy });
  await fetchRepoMeta('https://github.com/o/r', { fetchImpl: spy });
  assert.equal(seen[0].url, 'https://api.github.com/repos/o/r');
  assert.equal(seen[0].headers.Authorization, 'Bearer tok');
  assert.equal('Authorization' in seen[1].headers, false);
  assert.equal(meta.homepage, null);
});

test('mergeProjects keeps static fields and falls back to github: null', () => {
  const projects = [{ name: 'A', repo: 'ra', summary: 's' }, { name: 'B', repo: 'rb' }, { name: 'C', repo: 'rc' }];
  const merged = mergeProjects(projects, [{ stars: 1 }, null]); // shorter than projects
  assert.deepEqual(merged[0], { name: 'A', repo: 'ra', summary: 's', github: { stars: 1 } });
  assert.equal(merged[1].github, null);
  assert.equal(merged[2].github, null);
  assert.equal(merged[1].name, 'B');
});

test('one repo failing (404/403) leaves that project static while others are enriched', async () => {
  const projects = [
    { name: 'Good', repo: 'https://github.com/o/good', summary: 'g' },
    { name: 'Renamed', repo: 'https://github.com/o/gone', summary: 'r' },
    { name: 'Limited', repo: 'https://github.com/o/limited', summary: 'l' },
  ];
  const fetchImpl = async (url) => {
    if (url.endsWith('/o/good')) return { ok: true, json: async () => repoJson() };
    if (url.endsWith('/o/gone')) return { ok: false, status: 404 };
    return { ok: false, status: 403 };
  };
  const get = createProjectsFetcher({ getProjectList: () => projects, fetchImpl });
  const out = await get();
  assert.equal(out.length, 3);
  assert.equal(out[0].github.stars, 7);
  assert.equal(out[1].github, null);
  assert.equal(out[2].github, null);
  assert.equal(out[1].summary, 'r');
});

test('createProjectsFetcher fetches each repo once and then serves from cache', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: true, json: async () => repoJson() }; };
  const projects = [{ repo: 'https://github.com/o/a' }, { repo: 'https://github.com/o/b' }];
  const get = createProjectsFetcher({ getProjectList: () => projects, fetchImpl });
  await get();
  await get();
  assert.equal(calls, 2);
});
