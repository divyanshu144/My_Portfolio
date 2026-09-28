# vCard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio UI with a port of the vCard template (sidebar + five tabs), fed by real content, a Substack-backed Blog tab and GitHub-enriched project cards, while keeping the AI assistant.

**Architecture:** vCard's CSS is copied verbatim to `src/vcard.css`; a small `src/index.css` adds only what vCard lacks (chips, states, AI widget). React components in `src/sections/` render the content inside a single `App` that holds the active-tab state. Two new read-only API routes (`/api/blog`, `/api/projects`) live in `api/*.js` (Vercel functions) and are mounted unchanged in `server/index.js` for local dev; their logic sits in pure, unit-tested helpers in `api/_lib/`.

**Tech Stack:** React 18, Vite 5, hand-written CSS (no Tailwind), Ionicons web component (CDN), Express (dev), Vercel functions (prod), `fast-xml-parser`, Node's built-in `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-28-vcard-redesign-design.md`

## Global Constraints

- Work on branch `vcard-redesign` (already exists). Never commit to or push `main`. Never push at all unless the user asks.
- Stage files by explicit path only. **Never** `git add -A` / `git add .`: `vcard-personal-portfolio/` is an untracked reference clone and must not be committed.
- Every commit message ends with the trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (pass as a second `-m`).
- Exact vCard look: gold accent `hsl(45, 100%, 72%)`, Poppins, dark palette. Do not edit `src/vcard.css` after copying it; all additions go in `src/index.css`.
- No Tailwind, Three.js, GSAP, `react-responsive`, `leva`, `maath`, `react-globe.gl` in the final tree.
- Tabs: About, Resume, Portfolio, Blog, Contact. No testimonials, clients, map, category filter, or skill progress bars.
- Skills render as chips; "What I'm doing" cards are built from the skill groups in `data/portfolioData.json`.
- `data/portfolioData.json` is the single project/skills/experience source. `AIAssistant.jsx` logic and `/api/chat` are untouched (only class names / CSS change).
- Substack publication: `https://div1761180.substack.com`, env var `SUBSTACK_URL` (defaults to that value). GitHub token env var `GITHUB_TOKEN` is optional.
- Blog: max 9 posts, newest first. Both new API responses are cached ~30 min in memory and sent with `Cache-Control: s-maxage=1800, stale-while-revalidate=3600`.
- Tests use `node:test` + `node:assert/strict`; run with `npm test`.

## Review Focus

Failure modes the spec implies but nobody would think to test, most likely first. Each has a test in the task named in brackets.

1. **Substack feed with exactly one post**: XML parsers return an object, not an array; the Blog must still show that post. [Task 3]
2. **Titles/excerpts containing HTML entities** (`&#8220;`, `&amp;`): must render as real characters, not escaped text. [Task 3]
3. **GitHub returns 403 (rate limit) or 404 (renamed repo) for one repo**: that card keeps its static data, the others are still enriched. [Task 4]
4. **Substack is down after a successful earlier fetch**: serve the stale posts instead of an error, and don't hammer upstream on every request. [Task 2]
5. **Contact form with whitespace-only fields or an invalid email**: Send stays disabled; a second click while sending is ignored. [Task 11]

---

## File Structure

| File | Responsibility |
|---|---|
| `api/_lib/cache.js` (new) | `withCache(ttlMs, fn, now)`: TTL cache with in-flight dedupe and stale-on-error |
| `api/_lib/substack.js` (new) | `decodeEntities`, `parseFeed(xml)`, `createPostsFetcher(opts)` |
| `api/_lib/github.js` (new) | `parseRepoUrl`, `fetchRepoMeta`, `mergeProjects`, `createProjectsFetcher` |
| `api/blog.js` (new) | Vercel handler; exports `makeBlogHandler` for tests |
| `api/projects.js` (new) | Vercel handler; exports `makeProjectsHandler` for tests |
| `api/_lib/*.test.js` (new) | Unit tests for the four modules above |
| `server/index.js` (modify) | Mount the two handlers for local dev |
| `src/vcard.css` (new) | Verbatim copy of vCard's `style.css` |
| `src/index.css` (rewrite) | vCard additions (chips, states, avatar fallback) + restyled AI widget CSS |
| `src/main.jsx` (modify) | Import `vcard.css` then `index.css` |
| `src/App.jsx` (rewrite) | Tab state, `Sidebar`, navbar, page registry, `AIAssistant` |
| `src/sections/Sidebar.jsx`, `About.jsx`, `Resume.jsx`, `Portfolio.jsx`, `Blog.jsx`, `Contact.jsx` | The six vCard sections. Old `Hero/Experience/Projects/Footer/Navbar` deleted |
| `src/lib/validateContact.js`, `src/lib/projectMeta.js` (+ tests) | Pure helpers for the form and project cards |
| `src/constants/index.js` (rewrite last) | Only `SUBSTACK_URL` and `skillGroups` |
| `index.html` (modify) | Poppins font, Ionicons scripts, title |

---

### Task 1: Dependencies, test script, lint globals

**Files:**
- Modify: `package.json`, `eslint.config.js`

**Interfaces:**
- Produces: `npm test` runs every `*.test.js` under `api/_lib/` and `src/lib/`; `fast-xml-parser` is importable.

- [ ] **Step 1: Record the lint baseline** (so later tasks only fix what they introduce)

Run: `npm run lint 2>&1 | tail -15`
Expected: note the summary line (e.g. `N problems`). Existing errors are not ours to fix.

- [ ] **Step 2: Install the XML parser**

Run: `npm install fast-xml-parser`
Expected: added to `dependencies` in `package.json`.

- [ ] **Step 3: Add the test script**

In `package.json` `scripts`, add after `"lint": "eslint .",`:

```json
    "test": "node --test \"api/_lib/*.test.js\" \"src/lib/*.test.js\"",
```

- [ ] **Step 4: Give Node files Node globals in ESLint**

In `eslint.config.js`, add a second config object after the existing one (before the closing `]`):

```js
  {
    files: ['api/**/*.js', 'server/**/*.js', '**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
  },
```

- [ ] **Step 5: Verify the script runs (no tests yet)**

Run: `npm test`
Expected: exits 0 or reports "no test files"; not a crash about the glob syntax. If Node rejects the quoted globs, replace with two explicit directories: `node --test api/_lib src/lib`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json eslint.config.js
git commit -m "chore: add fast-xml-parser, test script, node lint globals" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Cache helper

**Files:**
- Create: `api/_lib/cache.js`
- Test: `api/_lib/cache.test.js`

**Interfaces:**
- Produces: `withCache(ttlMs: number, fn: () => Promise<T>, now?: () => number): () => Promise<T>`.
  - Fresh entry within `ttlMs` → returned without calling `fn`.
  - Concurrent calls share one in-flight `fn` call.
  - If `fn` throws and a stale entry exists → return stale and restart its TTL. No entry → rethrow. A rejected in-flight call must not block later retries.

- [ ] **Step 1: Write the failing tests**

`api/_lib/cache.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find module `./cache.js`.

- [ ] **Step 3: Implement**

`api/_lib/cache.js`:

```js
// Tiny in-memory TTL cache for serverless/Express handlers.
// - one upstream call at a time (in-flight dedupe)
// - if a refresh fails and we still hold an older value, keep serving it
export function withCache(ttlMs, fn, now = Date.now) {
  let entry = null;
  let inflight = null;

  return () => {
    if (entry && now() - entry.at < ttlMs) return Promise.resolve(entry.value);
    if (inflight) return inflight;

    inflight = (async () => {
      try {
        const value = await fn();
        entry = { at: now(), value };
        return value;
      } catch (err) {
        if (entry) {
          entry = { at: now(), value: entry.value };
          return entry.value;
        }
        throw err;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/cache.js api/_lib/cache.test.js
git commit -m "feat(api): add TTL cache with in-flight dedupe and stale-on-error" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Substack feed parser

**Files:**
- Create: `api/_lib/substack.js`
- Test: `api/_lib/substack.test.js`

**Interfaces:**
- Consumes: `withCache` from `./cache.js`.
- Produces:
  - `decodeEntities(s: string): string`
  - `parseFeed(xml: string, opts?: { limit?: number }): Post[]` where `Post = { title: string, url: string, date: string | null /* ISO */, excerpt: string, image: string | null }`, newest first, default `limit` 9. Throws `Error('Not an RSS feed')` if there is no `rss.channel`.
  - `createPostsFetcher({ baseUrl: string, fetchImpl?: typeof fetch, ttlMs?: number, now?: () => number }): () => Promise<Post[]>`. Requests `${baseUrl without trailing slash}/feed`; throws on non-2xx.

- [ ] **Step 1: Write the failing tests**

`api/_lib/substack.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeEntities, parseFeed, createPostsFetcher } from './substack.js';

const item = ({ title, link, date, desc = '', img }) =>
  `<item><title><![CDATA[${title}]]></title><description><![CDATA[${desc}]]></description>` +
  `<link>${link}</link><pubDate>${date}</pubDate>` +
  (img ? `<enclosure url="${img}" length="0" type="image/jpeg"/>` : '') +
  `<content:encoded><![CDATA[<p>body</p>]]></content:encoded></item>`;

const feed = (...items) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel><title>Div</title>${items.join('')}</channel></rss>`;

const A = { title: 'Older', link: 'https://x.substack.com/p/older', date: 'Fri, 19 Jun 2026 00:14:51 GMT', desc: 'old', img: 'https://img/old.png' };
const B = { title: 'Newer', link: 'https://x.substack.com/p/newer', date: 'Wed, 19 Aug 2026 11:20:14 GMT', desc: 'new', img: 'https://img/new.png' };

test('decodeEntities handles numeric, hex and named entities once', () => {
  assert.equal(decodeEntities('&#8220;hi&#8221; &amp; &#x27;x&#x27; &lt;b&gt;'), '“hi” & \'x\' <b>');
  assert.equal(decodeEntities('&amp;lt;'), '&lt;');
});

test('parses posts newest first with all fields', () => {
  const posts = parseFeed(feed(item(A), item(B)));
  assert.equal(posts.length, 2);
  assert.deepEqual(posts[0], {
    title: 'Newer',
    url: 'https://x.substack.com/p/newer',
    date: '2026-08-19T11:20:14.000Z',
    excerpt: 'new',
    image: 'https://img/new.png',
  });
  assert.equal(posts[1].title, 'Older');
});

test('a feed with exactly one item still returns an array', () => {
  const posts = parseFeed(feed(item(A)));
  assert.equal(posts.length, 1);
  assert.equal(posts[0].title, 'Older');
});

test('decodes entities in title and excerpt', () => {
  const [p] = parseFeed(feed(item({ ...B, title: 'Tom &amp; Jerry', desc: '&#8220;thinking&#8221;' })));
  assert.equal(p.title, 'Tom & Jerry');
  assert.equal(p.excerpt, '“thinking”');
});

test('strips tags and truncates long excerpts to 160 chars with an ellipsis', () => {
  const long = '<p>' + 'word '.repeat(80) + '</p>';
  const [p] = parseFeed(feed(item({ ...B, desc: long })));
  assert.ok(p.excerpt.length <= 160);
  assert.ok(p.excerpt.endsWith('…'));
  assert.ok(!p.excerpt.includes('<'));
});

test('skips items without a title or link, and tolerates a missing image/date', () => {
  const xml = feed(
    item({ ...A, title: '' }),
    item({ ...B, link: '' }),
    `<item><title>Bare</title><link>https://x/p/bare</link></item>`,
  );
  const posts = parseFeed(xml);
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0], { title: 'Bare', url: 'https://x/p/bare', date: null, excerpt: '', image: null });
});

test('returns [] for a channel with no items', () => {
  assert.deepEqual(parseFeed(feed()), []);
});

test('caps the result at the limit (default 9)', () => {
  const many = Array.from({ length: 12 }, (_, i) =>
    item({ ...A, title: `P${i}`, link: `https://x/p/${i}`, date: `Wed, 0${(i % 9) + 1} Jul 2026 10:00:00 GMT` }));
  assert.equal(parseFeed(feed(...many)).length, 9);
  assert.equal(parseFeed(feed(...many), { limit: 3 }).length, 3);
});

test('throws when the document is not RSS', () => {
  assert.throws(() => parseFeed('<html><body>nope</body></html>'), /Not an RSS feed/);
});

test('createPostsFetcher requests <base>/feed, trims trailing slashes, and throws on non-2xx', async () => {
  const urls = [];
  const ok = createPostsFetcher({
    baseUrl: 'https://x.substack.com//',
    fetchImpl: async (url) => { urls.push(url); return { ok: true, text: async () => feed(item(A)) }; },
  });
  assert.equal((await ok()).length, 1);
  assert.deepEqual(urls, ['https://x.substack.com/feed']);

  const bad = createPostsFetcher({
    baseUrl: 'https://x.substack.com',
    fetchImpl: async () => ({ ok: false, status: 500, text: async () => '' }),
  });
  await assert.rejects(bad(), /500/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find module `./substack.js`.

- [ ] **Step 3: Implement**

`api/_lib/substack.js`:

```js
import { XMLParser } from 'fast-xml-parser';
import { withCache } from './cache.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,     // keep "2026" as a string
  processEntities: false,   // decodeEntities below is the single decoding pass
  isArray: (name) => name === 'item',
});

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(input = '') {
  return String(input)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
}

const text = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') return text(v['#text']);
  return String(v).trim();
};

const clean = (html) => decodeEntities(String(html).replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

const truncate = (s, max) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const toPost = (item) => {
  const title = clean(text(item.title));
  const url = text(item.link);
  if (!title || !url) return null;
  const parsed = Date.parse(text(item.pubDate));
  return {
    title,
    url,
    date: Number.isNaN(parsed) ? null : new Date(parsed).toISOString(),
    excerpt: truncate(clean(text(item.description)), 160),
    image: item.enclosure?.['@_url'] || null,
  };
};

export function parseFeed(xml, { limit = 9 } = {}) {
  const channel = parser.parse(xml)?.rss?.channel;
  if (!channel) throw new Error('Not an RSS feed');
  const ts = (p) => (p.date ? Date.parse(p.date) : 0);
  return (channel.item ?? [])
    .map(toPost)
    .filter(Boolean)
    .sort((a, b) => ts(b) - ts(a))
    .slice(0, limit);
}

export function createPostsFetcher({ baseUrl, fetchImpl, ttlMs = 30 * 60 * 1000, now } = {}) {
  const feedUrl = `${String(baseUrl).replace(/\/+$/, '')}/feed`;
  return withCache(ttlMs, async () => {
    const doFetch = fetchImpl || globalThis.fetch;
    const res = await doFetch(feedUrl, { headers: { 'User-Agent': 'portfolio-blog-fetch' } });
    if (!res.ok) throw new Error(`Substack feed responded ${res.status}`);
    return parseFeed(await res.text());
  }, now);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: all Task 2 + Task 3 tests pass. If the "one item" test fails, the `isArray` option is not taking effect: check the installed `fast-xml-parser` major version's option name.

- [ ] **Step 5: Sanity-check against the real feed**

Run:
```bash
node -e "import('./api/_lib/substack.js').then(async m=>{const f=m.createPostsFetcher({baseUrl:'https://div1761180.substack.com'});console.log(await f())})"
```
Expected: 2 posts ("A Hundred Rubber Stamps", "From History Hoarders to Digital Librarians") with curly quotes decoded and an image URL each.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/substack.js api/_lib/substack.test.js
git commit -m "feat(api): add Substack RSS parser and cached fetcher" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: GitHub project enrichment

**Files:**
- Create: `api/_lib/github.js`
- Test: `api/_lib/github.test.js`

**Interfaces:**
- Consumes: `withCache` from `./cache.js`.
- Produces:
  - `parseRepoUrl(url): { owner, repo } | null`
  - `fetchRepoMeta(url, { token?, fetchImpl? }): Promise<RepoMeta | null>`, `RepoMeta = { stars: number, language: string|null, topics: string[], homepage: string|null, pushedAt: string|null, htmlUrl: string }`. Returns `null` on invalid URL (without fetching), non-2xx, or a thrown fetch.
  - `mergeProjects(projects, metas): Array<project & { github: RepoMeta | null }>`
  - `createProjectsFetcher({ getProjectList: () => project[], token?, fetchImpl?, ttlMs?, now? }): () => Promise<Array<project & { github }>>`

- [ ] **Step 1: Write the failing tests**

`api/_lib/github.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find module `./github.js`.

- [ ] **Step 3: Implement**

`api/_lib/github.js`:

```js
import { withCache } from './cache.js';

const REPO_URL = /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i;

export function parseRepoUrl(url) {
  const m = REPO_URL.exec(String(url ?? '').trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

export async function fetchRepoMeta(url, { token, fetchImpl } = {}) {
  const parsed = parseRepoUrl(url);
  if (!parsed) return null;
  const doFetch = fetchImpl || globalThis.fetch;
  try {
    const res = await doFetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-projects-fetch',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      stars: d.stargazers_count ?? 0,
      language: d.language ?? null,
      topics: Array.isArray(d.topics) ? d.topics : [],
      homepage: d.homepage || null,
      pushedAt: d.pushed_at ?? null,
      htmlUrl: d.html_url ?? url,
    };
  } catch {
    return null;
  }
}

export const mergeProjects = (projects, metas) =>
  projects.map((p, i) => ({ ...p, github: metas[i] ?? null }));

export function createProjectsFetcher({ getProjectList, token, fetchImpl, ttlMs = 30 * 60 * 1000, now } = {}) {
  return withCache(ttlMs, async () => {
    const projects = getProjectList();
    const metas = await Promise.all(projects.map((p) => fetchRepoMeta(p.repo, { token, fetchImpl })));
    return mergeProjects(projects, metas);
  }, now);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/github.js api/_lib/github.test.js
git commit -m "feat(api): add GitHub repo enrichment for portfolio projects" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `/api/blog` and `/api/projects` routes

**Files:**
- Create: `api/blog.js`, `api/projects.js`
- Test: `api/_lib/routes.test.js` (in `_lib` so Vercel does not deploy it as an endpoint)
- Modify: `server/index.js` (add imports + two `app.get` lines before the `NODE_ENV === 'production'` block), `.env.example`

**Interfaces:**
- Consumes: `createPostsFetcher` (Task 3), `createProjectsFetcher` (Task 4).
- Produces:
  - `makeBlogHandler(getPosts)` and default export handler → `GET /api/blog` → `200 { posts: Post[] }`; failure → `502 { error }`; non-GET → `405`.
  - `makeProjectsHandler(getProjects)` and default export handler → `GET /api/projects` → `200 { projects: Array<project & { github }> }`; failure → `502 { error }`; non-GET → `405`.
  - Both set `Cache-Control: s-maxage=1800, stale-while-revalidate=3600` on success.

- [ ] **Step 1: Write the failing tests**

`api/_lib/routes.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find `../blog.js`.

- [ ] **Step 3: Implement the blog handler**

`api/blog.js`:

```js
import { createPostsFetcher } from './_lib/substack.js';

const DEFAULT_SUBSTACK_URL = 'https://div1761180.substack.com';

export const makeBlogHandler = (getPosts) => async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const posts = await getPosts();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Blog error:', error?.message || error);
    res.status(502).json({ error: 'Could not load blog posts.' });
  }
};

let fetchPosts;
export default makeBlogHandler(() => {
  fetchPosts ??= createPostsFetcher({ baseUrl: process.env.SUBSTACK_URL || DEFAULT_SUBSTACK_URL });
  return fetchPosts();
});
```

- [ ] **Step 4: Implement the projects handler**

`api/projects.js`:

```js
import { createRequire } from 'module';
import { createProjectsFetcher } from './_lib/github.js';

const require = createRequire(import.meta.url);
const portfolioData = require('../data/portfolioData.json');

export const makeProjectsHandler = (getProjects) => async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const projects = await getProjects();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Projects error:', error?.message || error);
    res.status(502).json({ error: 'Could not load projects.' });
  }
};

let fetchProjects;
export default makeProjectsHandler(() => {
  fetchProjects ??= createProjectsFetcher({
    getProjectList: () => portfolioData.projects,
    token: process.env.GITHUB_TOKEN,
  });
  return fetchProjects();
});
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test`
Expected: all tests pass (9 new route tests included).

- [ ] **Step 6: Mount in the local Express server**

In `server/index.js`, add after the existing imports (line 7):

```js
import blogHandler from '../api/blog.js';
import projectsHandler from '../api/projects.js';
```

and immediately after the `/api/health` route (before `app.post('/api/refresh'`):

```js
app.get('/api/blog', blogHandler);
app.get('/api/projects', projectsHandler);
```

- [ ] **Step 7: Document env vars**

Append to `.env.example`:

```
# Blog tab: Substack publication (defaults to https://div1761180.substack.com)
SUBSTACK_URL=https://div1761180.substack.com
# Optional: raises GitHub API limit from 60 to 5000 requests/hour for /api/projects
GITHUB_TOKEN=
```

- [ ] **Step 8: Verify against the running server**

Run (background): `npm run server`, wait for "AI server running", then:
```bash
curl -s localhost:8787/api/blog | head -c 400; echo
curl -s localhost:8787/api/projects | head -c 600; echo
curl -si localhost:8787/api/blog | grep -i cache-control
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:8787/api/blog
```
Expected: `{"posts":[…2 posts…]}`; `{"projects":[…4 projects each with a "github" object…]}`; `Cache-Control: s-maxage=1800…`; `404` for the POST (Express has no POST route; that is fine, the 405 path is covered by the unit test). Stop the server afterwards.

- [ ] **Step 9: Commit**

```bash
git add api/blog.js api/projects.js api/_lib/routes.test.js server/index.js .env.example
git commit -m "feat(api): add /api/blog and /api/projects routes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Frontend foundation: vCard CSS, App shell, Sidebar, About

**Files:**
- Create: `src/vcard.css` (copy), `src/sections/Sidebar.jsx` (replace old file? no: old `Navbar.jsx` etc. stay until Task 12; `Sidebar.jsx` is new), `public/assets/vcard/icon-dev.svg`, `icon-app.svg`, `icon-design.svg`, `icon-photo.svg` (copies)
- Modify: `index.html`, `src/main.jsx`, `src/index.css` (full rewrite), `src/App.jsx` (full rewrite), `src/sections/About.jsx` (full rewrite), `src/constants/index.js` (append two exports)

**Interfaces:**
- Produces:
  - `App` page registry: `pages = [{ id, label, title, Page }]`; every later task adds one entry and its import.
  - Each `Page` component renders only its inner sections; `App` wraps it in `<article className="{id} [active]">` with the `<h2 class="h2 article-title">` header.
  - `constants/index.js` exports `SUBSTACK_URL: string` and `skillGroups: Record<string, { title: string, icon: string }>` (icon = file stem in `/assets/vcard/`).

- [ ] **Step 1: Copy vCard's stylesheet and icons verbatim**

```bash
cp vcard-personal-portfolio/assets/css/style.css src/vcard.css
mkdir -p public/assets/vcard
cp vcard-personal-portfolio/assets/images/icon-{dev,app,design,photo}.svg public/assets/vcard/
```

- [ ] **Step 2: Update `index.html`**

Replace the `<title>` line and add font + icon scripts so the head reads:

```html
    <title>Divyanshu Charak — Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

and add before `</body>`:

```html
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
```

- [ ] **Step 3: Import order in `src/main.jsx`**

Replace `import './index.css'` with:

```js
import './vcard.css'
import './index.css'
```

- [ ] **Step 4: Rewrite `src/index.css`** (additions on top of vCard; the AI widget CSS is added in Task 7)

```css
/* Additions to the vCard stylesheet (src/vcard.css is kept verbatim). */

/* avatar fallback when /assets/div-avatar.jpg is missing */
.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: var(--orange-yellow-crayola);
  font-size: var(--fs-1);
  font-weight: var(--fw-600);
}

/* chips: Resume skills and project tech */
.skill-groups.content-card { padding: 20px; }
.skill-group:not(:last-child) { margin-bottom: 18px; }
.skill-group-title {
  color: var(--white-2);
  font-size: var(--fs-6);
  font-weight: var(--fw-500);
  margin-bottom: 10px;
}
.chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  background: var(--onyx);
  color: var(--light-gray);
  border: 1px solid var(--jet);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: var(--fs-7);
  font-weight: var(--fw-300);
}

/* resume experience bullets (reuse .timeline-text look) */
.timeline-bullets { padding-left: 18px; }
.timeline-bullets li { list-style: disc; margin-bottom: 6px; }

/* portfolio cards */
.project-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 150px;
  height: 100%;
  background: var(--bg-gradient-yellow-2);
  color: var(--orange-yellow-crayola);
  font-size: var(--fs-2);
  font-weight: var(--fw-500);
}
.project-summary {
  margin: 6px 10px 0;
  color: var(--light-gray-70);
  font-size: var(--fs-7);
  font-weight: var(--fw-300);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.project-chips { margin: 10px 10px 4px; }

/* blog + generic states */
.state-note {
  color: var(--light-gray-70);
  font-size: var(--fs-6);
  font-weight: var(--fw-300);
  line-height: 1.6;
}
.state-link { display: inline; color: var(--orange-yellow-crayola); }
.status-ok { color: hsl(140, 60%, 60%); font-size: var(--fs-7); text-align: center; margin-top: 12px; }
.status-err { color: var(--bittersweet-shimmer); font-size: var(--fs-7); text-align: center; margin-top: 12px; }

/* contact location row */
.contact-location {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  font-style: normal;
  color: var(--light-gray);
  font-size: var(--fs-6);
}
```

- [ ] **Step 5: Append shared constants**

Append to `src/constants/index.js` (keep the old exports for now; Task 12 removes them):

```js
export const SUBSTACK_URL = 'https://div1761180.substack.com'

// Display names + vCard icon for each key of data/portfolioData.json `skills`
export const skillGroups = {
  languages: { title: 'Languages', icon: 'icon-dev' },
  ai_ml: { title: 'AI & ML', icon: 'icon-app' },
  backend_apis: { title: 'Backend & APIs', icon: 'icon-dev' },
  data_etl: { title: 'Data & ETL', icon: 'icon-design' },
  devops: { title: 'DevOps', icon: 'icon-app' },
  frontend: { title: 'Frontend', icon: 'icon-design' },
}
```

- [ ] **Step 6: Create `src/sections/Sidebar.jsx`**

```jsx
import { useState } from 'react'
import portfolioData from '../../data/portfolioData.json'

const { name, location, contact, targetRoles } = portfolioData

const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2)

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <aside className={`sidebar${open ? ' active' : ''}`}>
      <div className="sidebar-info">
        <figure className="avatar-box">
          {imgFailed ? (
            <span className="avatar-initials">{initials}</span>
          ) : (
            <img src="/assets/div-avatar.jpg" alt={name} width="80" onError={() => setImgFailed(true)} />
          )}
        </figure>

        <div className="info-content">
          <h1 className="name" title={name}>{name}</h1>
          <p className="title">{targetRoles[0]}</p>
        </div>

        <button className="info_more-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span>Show Contacts</span>
          <ion-icon name="chevron-down"></ion-icon>
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="mail-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href={`mailto:${contact.email}`} className="contact-link">{contact.email}</a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="phone-portrait-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="contact-link">{contact.phone}</a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="location-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>{location}</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a href={contact.github} className="social-link" target="_blank" rel="noreferrer" aria-label="GitHub">
              <ion-icon name="logo-github"></ion-icon>
            </a>
          </li>
          <li className="social-item">
            <a href={contact.linkedin} className="social-link" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <ion-icon name="logo-linkedin"></ion-icon>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
```

- [ ] **Step 7: Rewrite `src/sections/About.jsx`**

```jsx
import portfolioData from '../../data/portfolioData.json'
import { skillGroups } from '../constants'

const About = () => (
  <>
    <section className="about-text">
      <p>{portfolioData.summary}</p>
    </section>

    <section className="service">
      <h3 className="h3 service-title">What I&apos;m doing</h3>

      <ul className="service-list">
        {Object.entries(portfolioData.skills).map(([key, items]) => {
          const group = skillGroups[key] ?? { title: key, icon: 'icon-dev' }
          return (
            <li className="service-item" key={key}>
              <div className="service-icon-box">
                <img src={`/assets/vcard/${group.icon}.svg`} alt="" width="40" />
              </div>
              <div className="service-content-box">
                <h4 className="h4 service-item-title">{group.title}</h4>
                <p className="service-item-text">{items.slice(0, 5).join(', ')}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  </>
)

export default About
```

- [ ] **Step 8: Rewrite `src/App.jsx`** (Resume/Portfolio/Blog/Contact entries are added by their tasks)

```jsx
import { useState } from 'react'
import Sidebar from './sections/Sidebar'
import About from './sections/About'
import AIAssistant from './components/AIAssistant'

const pages = [
  { id: 'about', label: 'About', title: 'About me', Page: About },
]

const App = () => {
  const [active, setActive] = useState('about')

  const select = (id) => {
    setActive(id)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <main>
        <Sidebar />

        <div className="main-content">
          <nav className="navbar">
            <ul className="navbar-list">
              {pages.map(({ id, label }) => (
                <li className="navbar-item" key={id}>
                  <button
                    className={`navbar-link${active === id ? ' active' : ''}`}
                    onClick={() => select(id)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {pages.map(({ id, title, Page }) => (
            <article key={id} className={`${id}${active === id ? ' active' : ''}`}>
              <header>
                <h2 className="h2 article-title">{title}</h2>
              </header>
              <Page />
            </article>
          ))}
        </div>
      </main>

      <AIAssistant />
    </>
  )
}

export default App
```

- [ ] **Step 9: Build and look at it**

Run: `npm run build`
Expected: succeeds. Then `npm run dev`, open `http://localhost:5173`: dark vCard sidebar with "Divyanshu Charak" / "AI / ML Engineer" and initials "DC" (no `div-avatar.jpg` exists yet), contacts + GitHub/LinkedIn icons, one "About" tab showing your summary and six skill-group cards. Resize to phone width: sidebar collapses behind "Show Contacts". The AI widget is unstyled until Task 7. That is expected.

- [ ] **Step 10: Commit**

```bash
git add src/vcard.css src/index.css src/main.jsx src/App.jsx src/sections/Sidebar.jsx src/sections/About.jsx src/constants/index.js index.html public/assets/vcard
git commit -m "feat(ui): vCard shell with sidebar and About tab" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Restyle the AI assistant for vCard

**Files:**
- Modify: `src/index.css` (append AI block), `src/components/AIAssistant.jsx` (class names only)

**Interfaces:**
- Consumes: vCard custom properties from `src/vcard.css`.
- Produces: `.ai-*` styles in the gold/dark palette, plus new helper classes replacing the Tailwind utilities `AIAssistant.jsx` used: `ai-md`, `ai-md-list`, `ai-md-list--ol`, `ai-md-item`, `ai-md-gap`, `ai-md-heading`, `ai-md-p`, `ai-dots`, `ai-dot`, `ai-row`, `ai-user-text`, `ai-output_box--typing`.

vCard's reset sets `li { list-style: none }` and `img, a, button, time, span { display: block }`, and Tailwind's preflight is gone; that is why explicit list/inline rules are needed below.

- [ ] **Step 1: Pull the old AI CSS from `main`, recolour it, append it**

```bash
git show main:src/index.css \
 | awk '/AI Assistant/{p=1} /^\.waving-hand/{p=0} p' \
 | sed -e 's/#0ea5e9/hsl(45, 100%, 72%)/g' \
       -e 's/#38bdf8/hsl(35, 100%, 68%)/g' \
       -e 's/#7dd3fc/hsl(45, 100%, 82%)/g' \
       -e 's/rgba(56,189,248,/hsla(45, 100%, 72%,/g' \
       -e 's/#0f141a/var(--eerie-black-2)/g' \
       -e 's/#1e2a36/var(--jet)/g' \
       -e 's/#1C1C21/var(--eerie-black-1)/g' \
       -e 's/#2a2a30/var(--jet)/g' \
       -e 's/#3A3A49/var(--onyx)/g' \
       -e 's/#62646C/var(--light-gray-70)/g' \
       -e 's/#AFB0B6/var(--light-gray)/g' \
 >> src/index.css
grep -n -iE 'sky|#0ea5e9|#38bdf8|56,189,248' src/index.css || echo "no sky-blue left"
```
Expected: `no sky-blue left`. Inspect `tail -30 src/index.css`; if any non-`.ai-*` rule slipped in at the end, delete it.

- [ ] **Step 2: Append helper classes + dark-on-gold overrides**

Append to `src/index.css`:

```css
/* ── AI assistant: replacements for the Tailwind utilities used in AIAssistant.jsx ── */
.ai-md > * + * { margin-top: 0.25rem; }
.ai-md-list { margin: 0.25rem 0 0.25rem 1.25rem; list-style: disc; }
.ai-md-list--ol { list-style: decimal; }
.ai-md-item { display: list-item; list-style: inherit; color: var(--light-gray); font-size: 0.875rem; margin-bottom: 0.125rem; }
.ai-md-gap { height: 0.375rem; }
.ai-md-heading { font-weight: 600; color: var(--white-2); font-size: 0.875rem; margin: 0.5rem 0 0.125rem; }
.ai-md-p { color: var(--light-gray); font-size: 0.875rem; line-height: 1.6; }
.ai-user-text { font-size: 0.875rem; }
.ai-row { display: flex; align-items: center; gap: 0.75rem; }
.ai-dots { display: flex; align-items: center; gap: 0.25rem; padding: 0.625rem 0.75rem; }
.ai-dot {
  width: 0.375rem; height: 0.375rem; border-radius: 9999px;
  background: var(--light-gray-70);
  animation: ai-bounce 1s infinite;
}
@keyframes ai-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25%); } }
.ai-output_box--typing { display: flex; align-items: flex-start; gap: 0.5rem; margin-top: 1rem; }

/* vCard sets span/img/button to display:block; keep the widget's inline content inline */
.ai-fab span, .ai-modal span { display: inline; }

/* gold backgrounds need dark text */
.ai-fab, .ai-avatar, .ai-tab_active, .ai-bubble--user, .ai-send, .ai-btn { color: var(--smoky-black); }
.ai-modal_title { color: var(--white-2); }
```

- [ ] **Step 3: Replace Tailwind classes in `src/components/AIAssistant.jsx`**

Make exactly these edits:

| Line (approx.) | Old | New |
|---|---|---|
| 29 | `className={listType === 'ol' ? 'list-decimal ml-5 space-y-0.5 my-1' : 'list-disc ml-5 space-y-0.5 my-1'}` | `className={listType === 'ol' ? 'ai-md-list ai-md-list--ol' : 'ai-md-list'}` |
| 31 | `className="text-white-600 text-sm"` | `className="ai-md-item"` |
| 41 | `className="h-1.5"` | `className="ai-md-gap"` |
| 45 | `className="font-semibold text-white text-sm mt-2 mb-0.5"` | `className="ai-md-heading"` |
| 52 | `className="text-white-600 text-sm leading-relaxed"` | `className="ai-md-p"` |
| 55 | `<div className="space-y-1">` | `<div className="ai-md">` |
| 59 | `className="flex items-center gap-1 px-3 py-2.5"` | `className="ai-dots"` |
| 61 | `className="w-1.5 h-1.5 rounded-full bg-white-500 animate-bounce"` | `className="ai-dot"` (keep the `style={{ animationDelay… }}`) |
| 171 | `className="flex items-center gap-3"` | `className="ai-row"` |
| 201 | `className="text-sm text-white"` | `className="ai-user-text"` |
| 244 | `className="mt-4 ai-output_box flex items-start gap-2"` | `className="ai-output_box ai-output_box--typing"` |

Then find anything missed:

```bash
grep -n "className" src/components/AIAssistant.jsx | grep -E '\b(flex|mt-[0-9]|mb-[0-9]|gap-[0-9]|space-[xy]|text-(xs|sm|white)|items-|px-|py-|w-[0-9]|h-[0-9]|rounded|bg-|animate-|font-(semi|bold))'
```
Expected: no output. Fix any remaining hit the same way (add a small `.ai-*` class to `index.css`).

- [ ] **Step 4: Visual check**

Run `npm run dev`. Click the floating button: gold pill with dark text; modal panel dark with gold accent bar; send a message (needs `npm run server`); user bubble gold with dark text, assistant bubble dark; typing dots animate; lists (`- item`, `1. item`) show bullets/numbers. Repeat at ~390px width: modal fits without horizontal scroll.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/AIAssistant.jsx
git commit -m "feat(ui): restyle AI assistant to vCard palette, drop Tailwind classes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Resume tab

**Files:**
- Create: `src/sections/Resume.jsx`
- Modify: `src/App.jsx` (add import + registry entry)

**Interfaces:**
- Consumes: `skillGroups` (Task 6), `portfolioData.education[] { institution, location, degree, dates, grade?, dissertation? }`, `portfolioData.experience[] { company, location, title, dates, highlights[] }`.
- Produces: default-exported `Resume` page component.

- [ ] **Step 1: Create `src/sections/Resume.jsx`**

```jsx
import portfolioData from '../../data/portfolioData.json'
import { skillGroups } from '../constants'

const Timeline = ({ icon, heading, children }) => (
  <section className="timeline">
    <div className="title-wrapper">
      <div className="icon-box"><ion-icon name={icon}></ion-icon></div>
      <h3 className="h3">{heading}</h3>
    </div>
    <ol className="timeline-list">{children}</ol>
  </section>
)

const Resume = () => (
  <>
    <Timeline icon="book-outline" heading="Education">
      {portfolioData.education.map((e) => (
        <li className="timeline-item" key={e.degree + e.institution}>
          <h4 className="h4 timeline-item-title">{e.degree}</h4>
          <span>{[e.institution, e.dates, e.grade].filter(Boolean).join(' · ')}</span>
          {e.dissertation && <p className="timeline-text">{e.dissertation}</p>}
        </li>
      ))}
    </Timeline>

    <Timeline icon="briefcase-outline" heading="Experience">
      {portfolioData.experience.map((x) => (
        <li className="timeline-item" key={x.title + x.company + x.dates}>
          <h4 className="h4 timeline-item-title">{x.title} · {x.company}</h4>
          <span>{[x.dates, x.location].filter(Boolean).join(' · ')}</span>
          <ul className="timeline-text timeline-bullets">
            {x.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </li>
      ))}
    </Timeline>

    <section className="skill">
      <h3 className="h3 skills-title">My skills</h3>
      <div className="skill-groups content-card">
        {Object.entries(portfolioData.skills).map(([key, items]) => (
          <div className="skill-group" key={key}>
            <h5 className="skill-group-title">{skillGroups[key]?.title ?? key}</h5>
            <ul className="chip-list">
              {items.map((s) => <li className="chip" key={s}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </>
)

export default Resume
```

- [ ] **Step 2: Register the tab in `src/App.jsx`**

Add `import Resume from './sections/Resume'` and the registry entry after About:

```jsx
  { id: 'resume', label: 'Resume', title: 'Resume', Page: Resume },
```

- [ ] **Step 3: Verify**

Run `npm run build` (succeeds) and `npm run dev`. Resume tab: 2 education entries (MSc Exeter with the dissertation paragraph, B.E. PES), 3 experience entries each with bullet highlights, and six chip groups. Nothing overflows at 390px width; timeline connector line/dots render as in the vCard demo.

- [ ] **Step 4: Commit**

```bash
git add src/sections/Resume.jsx src/App.jsx
git commit -m "feat(ui): Resume tab with timelines and skill chips" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Portfolio tab

**Files:**
- Create: `src/lib/projectMeta.js`, `src/lib/projectMeta.test.js`, `src/sections/Portfolio.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `GET /api/projects` → `{ projects: Array<{ name, repo, summary, highlights?, tech?, image?, github: RepoMeta|null }> }` (Tasks 4–5).
- Produces: `projectMeta(p): string`, the card subtitle, e.g. `"Python · ★ 7 · Aug 2026"`, `""` when `p.github` is null.

- [ ] **Step 1: Write the failing test**

`src/lib/projectMeta.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find `./projectMeta.js`.

- [ ] **Step 3: Implement**

`src/lib/projectMeta.js`:

```js
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function projectMeta(project) {
  const g = project?.github;
  if (!g) return '';
  const pushed = g.pushedAt ? new Date(g.pushedAt) : null;
  return [
    g.language,
    typeof g.stars === 'number' ? `★ ${g.stars}` : null,
    pushed && !Number.isNaN(pushed.getTime()) ? monthYear.format(pushed) : null,
  ].filter(Boolean).join(' · ');
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: all pass. (If `Aug 2026` renders as `Aug 2026` with a different separator on your ICU build, adjust only the test's expected string.)

- [ ] **Step 5: Create `src/sections/Portfolio.jsx`**

```jsx
import { useEffect, useState } from 'react'
import portfolioData from '../../data/portfolioData.json'
import { projectMeta } from '../lib/projectMeta'

// Static data renders immediately; live GitHub data replaces it when /api/projects answers.
const initial = portfolioData.projects.map((p) => ({ ...p, github: null }))

const Portfolio = () => {
  const [projects, setProjects] = useState(initial)

  useEffect(() => {
    let cancelled = false
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled && Array.isArray(data.projects) && data.projects.length) setProjects(data.projects)
      })
      .catch(() => {}) // keep the static cards
    return () => { cancelled = true }
  }, [])

  return (
    <section className="projects">
      <ul className="project-list">
        {projects.map((p) => {
          const meta = projectMeta(p)
          return (
            <li className="project-item active" key={p.repo}>
              <a href={p.repo} target="_blank" rel="noreferrer">
                <figure className="project-img">
                  <div className="project-item-icon-box"><ion-icon name="logo-github"></ion-icon></div>
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="project-placeholder">{p.github?.language ?? p.tech?.[0] ?? p.name}</div>
                  )}
                </figure>

                <h3 className="project-title">{p.name}</h3>
                {meta && <p className="project-category">{meta}</p>}
                <p className="project-summary">{p.summary}</p>
                {p.tech?.length > 0 && (
                  <ul className="chip-list project-chips">
                    {p.tech.map((t) => <li className="chip" key={t}>{t}</li>)}
                  </ul>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Portfolio
```

- [ ] **Step 6: Register the tab in `src/App.jsx`**

Add `import Portfolio from './sections/Portfolio'` and, after Resume:

```jsx
  { id: 'portfolio', label: 'Portfolio', title: 'Portfolio', Page: Portfolio },
```

- [ ] **Step 7: Verify (live, then degraded)**

Run `npm run server` and `npm run dev`. Portfolio tab: 4 cards (DocChat, promptOps_framework, EPC, Fooder) with gold placeholder showing the language, `Python · ★ N · Mon YYYY`, clamped summary, tech chips; clicking opens the repo.
Then stop the server, hard-reload: cards still render (static data, no meta line), and the browser console shows no uncaught errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/projectMeta.js src/lib/projectMeta.test.js src/sections/Portfolio.jsx src/App.jsx
git commit -m "feat(ui): Portfolio tab with GitHub-enriched project cards" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Blog tab

**Files:**
- Create: `src/sections/Blog.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `GET /api/blog` → `{ posts: Array<{ title, url, date: string|null, excerpt, image: string|null }> }`; `SUBSTACK_URL` from `../constants`.
- Produces: default-exported `Blog` page component with three visible states: loading, posts, fallback ("Read on Substack →").

- [ ] **Step 1: Create `src/sections/Blog.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { SUBSTACK_URL } from '../constants'

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

const Fallback = ({ message }) => (
  <section className="blog-posts">
    <p className="state-note">
      {message}{' '}
      <a className="state-link" href={SUBSTACK_URL} target="_blank" rel="noreferrer">Read on Substack →</a>
    </p>
  </section>
)

const Blog = () => {
  const [state, setState] = useState({ status: 'loading', posts: [] })

  useEffect(() => {
    let cancelled = false
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => { if (!cancelled) setState({ status: 'ready', posts: data.posts ?? [] }) })
      .catch(() => { if (!cancelled) setState({ status: 'error', posts: [] }) })
    return () => { cancelled = true }
  }, [])

  if (state.status === 'loading') return <p className="state-note">Loading posts…</p>
  if (state.status === 'error') return <Fallback message="Couldn't load posts right now." />
  if (state.posts.length === 0) return <Fallback message="No posts yet." />

  return (
    <section className="blog-posts">
      <ul className="blog-posts-list">
        {state.posts.map((post) => (
          <li className="blog-post-item" key={post.url}>
            <a href={post.url} target="_blank" rel="noreferrer">
              {post.image && (
                <figure className="blog-banner-box">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </figure>
              )}
              <div className="blog-content">
                <div className="blog-meta">
                  <p className="blog-category">Substack</p>
                  {post.date && (
                    <>
                      <span className="dot"></span>
                      <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
                    </>
                  )}
                </div>
                <h3 className="h3 blog-item-title">{post.title}</h3>
                {post.excerpt && <p className="blog-text">{post.excerpt}</p>}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Blog
```

- [ ] **Step 2: Register the tab in `src/App.jsx`**

Add `import Blog from './sections/Blog'` and, after Portfolio:

```jsx
  { id: 'blog', label: 'Blog', title: 'Blog', Page: Blog },
```

- [ ] **Step 3: Verify all three states**

With `npm run server` + `npm run dev`: Blog tab shows the two Substack posts with banner, "Substack · 19 Aug 2026", title and excerpt; curly quotes render as quotes (not `&#8220;`). Stop the server and reload: tab shows "Couldn't load posts right now. Read on Substack →" with a working link. In `.env` temporarily set `SUBSTACK_URL=https://example.invalid`, restart the server: the same fallback appears (502). Remove that line afterwards.

- [ ] **Step 4: Commit**

```bash
git add src/sections/Blog.jsx src/App.jsx
git commit -m "feat(ui): Blog tab backed by Substack feed" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Contact tab

**Files:**
- Create: `src/lib/validateContact.js`, `src/lib/validateContact.test.js`, `src/sections/Contact.jsx` (full rewrite of the existing file)
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `isContactValid({ name, email, message }): boolean`. True only when name and message have non-whitespace text and email matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`.

- [ ] **Step 1: Write the failing test**

`src/lib/validateContact.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find `./validateContact.js`.

- [ ] **Step 3: Implement**

`src/lib/validateContact.js`:

```js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isContactValid = ({ name, email, message }) =>
  name.trim().length > 0 && EMAIL_RE.test(email.trim()) && message.trim().length > 0
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Rewrite `src/sections/Contact.jsx`** (EmailJS IDs and behaviour are carried over from the current file)

```jsx
import emailjs from '@emailjs/browser'
import { useState } from 'react'
import portfolioData from '../../data/portfolioData.json'
import { isContactValid } from '../lib/validateContact'

const EMPTY = { name: '', email: '', message: '' }

const Contact = () => {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'

  const canSubmit = isContactValid(form) && !loading

  const handleChange = ({ target: { name, value } }) =>
    setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      await emailjs.send(
        'service_ohzn687',   // Service ID
        'template_qgar6fd',  // Template ID
        {
          from_name: form.name.trim(),
          to_name: portfolioData.name,
          from_email: form.email.trim(),
          to_email: portfolioData.contact.email,
          message: form.message.trim(),
        },
        'HvkIJyo2oMNIiGQTa', // Public Key
      )
      setStatus('success')
      setForm(EMPTY)
    } catch (error) {
      console.error(error)
      setStatus('error')
    } finally {
      setLoading(false)
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <>
      <address className="contact-location">
        <div className="icon-box"><ion-icon name="location-outline"></ion-icon></div>
        <span>{portfolioData.location}</span>
      </address>

      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input type="text" name="name" className="form-input" placeholder="Full name"
              value={form.name} onChange={handleChange} required />
            <input type="email" name="email" className="form-input" placeholder="Email address"
              value={form.email} onChange={handleChange} required />
          </div>

          <textarea name="message" className="form-input" placeholder="Your message"
            value={form.message} onChange={handleChange} required></textarea>

          <button className="form-btn" type="submit" disabled={!canSubmit}>
            <ion-icon name="paper-plane"></ion-icon>
            <span>{loading ? 'Sending…' : 'Send Message'}</span>
          </button>

          {status === 'success' && <p className="status-ok">Message sent. I&apos;ll be in touch soon.</p>}
          {status === 'error' && (
            <p className="status-err">Something went wrong. Please try again or email me directly.</p>
          )}
        </form>
      </section>
    </>
  )
}

export default Contact
```

- [ ] **Step 6: Register the tab in `src/App.jsx`**

Add `import Contact from './sections/Contact'` and, after Blog:

```jsx
  { id: 'contact', label: 'Contact', title: 'Contact', Page: Contact },
```

- [ ] **Step 7: Verify**

`npm run build` succeeds. In the browser: Send is disabled and dimmed initially; still disabled with spaces only in name/message or `a@b` as the email; enabled with valid input; a second click while "Sending…" does nothing. A real send shows the green confirmation and clears the form (uses your real EmailJS quota; do one send to your own address, or skip and rely on validation checks).

- [ ] **Step 8: Commit**

```bash
git add src/lib/validateContact.js src/lib/validateContact.test.js src/sections/Contact.jsx src/App.jsx
git commit -m "feat(ui): Contact tab with vCard form and validation" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Cleanup, docs and final verification

**Files:**
- Delete: `src/sections/{Hero,Experience,Projects,Footer,Navbar}.jsx`; `src/components/{Button,CanvasLoader,Cube,DemoComputer,Developer,HackerRoom,HeroCamera,Loading,ProjectDevice,ReactLogo,Rings,Target}.jsx` (everything in `src/components/` except `AIAssistant.jsx`); `public/models/`, `public/textures/`; `tailwind.config.js`, `postcss.config.js`
- Modify: `package.json` (remove dependencies), `src/constants/index.js` (rewrite), `CLAUDE.md`

**Interfaces:**
- Consumes: everything above. Produces a tree with no references to removed modules.

- [ ] **Step 1: Confirm nothing live still imports the old files**

```bash
grep -rn -E "from '\./(sections|components)/(Hero|Experience|Projects|Footer|Navbar|Button|CanvasLoader|Cube|DemoComputer|Developer|HackerRoom|HeroCamera|Loading|ProjectDevice|ReactLogo|Rings|Target)|react-responsive|gsap|three|leva|maath|react-globe|calculateSizes|myProjects|workExperiences|navLinks" src --include='*.jsx' --include='*.js' | grep -v -E "^src/(sections/(Hero|Experience|Projects|Footer|Navbar)|components/(Button|CanvasLoader|Cube|DemoComputer|Developer|HackerRoom|HeroCamera|Loading|ProjectDevice|ReactLogo|Rings|Target))\.jsx" | grep -v "^src/constants/index.js"
```
Expected: no output. If something shows up, it is a live dependency: stop and resolve it before deleting.

- [ ] **Step 2: Delete old UI, 3D assets and Tailwind config**

```bash
git rm -q src/sections/{Hero,Experience,Projects,Footer,Navbar}.jsx
git rm -q src/components/{Button,CanvasLoader,Cube,DemoComputer,Developer,HackerRoom,HeroCamera,Loading,ProjectDevice,ReactLogo,Rings,Target}.jsx
git rm -rq public/models public/textures
git rm -q tailwind.config.js postcss.config.js
```

- [ ] **Step 3: Reduce `src/constants/index.js` to what is used**

Overwrite the file with:

```js
export const SUBSTACK_URL = 'https://div1761180.substack.com'

// Display names + vCard icon for each key of data/portfolioData.json `skills`
export const skillGroups = {
  languages: { title: 'Languages', icon: 'icon-dev' },
  ai_ml: { title: 'AI & ML', icon: 'icon-app' },
  backend_apis: { title: 'Backend & APIs', icon: 'icon-dev' },
  data_etl: { title: 'Data & ETL', icon: 'icon-design' },
  devops: { title: 'DevOps', icon: 'icon-app' },
  frontend: { title: 'Frontend', icon: 'icon-design' },
}
```

- [ ] **Step 4: Uninstall unused dependencies**

```bash
npm uninstall three @react-three/fiber @react-three/drei gsap @gsap/react leva maath react-globe.gl react-responsive tailwindcss postcss autoprefixer
```

- [ ] **Step 5: Update `CLAUDE.md`**

Replace the "Backend" route list, "Key data files", "3D rendering", "Styling" and "Contact form" sections with:

```markdown
### Backend
- `server/index.js`: Express dev server (AI routes below plus the two read-only routes mounted from `api/`).
- `api/*.js`: Vercel serverless functions used in production: `chat`, `resume`, `explain`, `coach`, `health`, plus:
  - `GET /api/blog`: Substack posts (RSS parsed in `api/_lib/substack.js`, `SUBSTACK_URL`, default `https://div1761180.substack.com`).
  - `GET /api/projects`: `portfolioData.projects` enriched with live GitHub metadata (`api/_lib/github.js`, optional `GITHUB_TOKEN`).
- Both read-only routes cache in memory for ~30 min and serve stale data if upstream fails.

### Key data files
- `data/portfolioData.json`: single source of truth for bio, skills, education, experience and the project list (each project's `repo` URL drives the GitHub enrichment). Also injected into the AI context.
- `src/constants/index.js`: only `SUBSTACK_URL` and `skillGroups` (display names/icons for skill groups).

### Styling
- `src/vcard.css` is a verbatim copy of the vCard template's stylesheet; do not edit it. Additions and the AI assistant styles live in `src/index.css`.
- The UI is the vCard layout: `Sidebar` plus five tabs (About, Resume, Portfolio, Blog, Contact) registered in `src/App.jsx`.

### Contact form
Uses EmailJS (`@emailjs/browser`) with IDs hardcoded in `src/sections/Contact.jsx`; validation in `src/lib/validateContact.js`.

### Tests
`npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`) and pure UI helpers (`src/lib/*.test.js`).
```

Also update the "Frontend (`src/`)" bullets so they no longer mention Navbar/Hero/3D models or the Tailwind palette, and delete the `**3D rendering**` subsection. Leave `vcard-personal-portfolio/` untouched.

- [ ] **Step 6: Full verification**

Run each and read the output:

```bash
npm test          # all unit tests pass
npm run build     # succeeds; dist has no three/gsap chunks
npm run lint      # no new problems vs the Task 1 baseline (expect fewer)
grep -rn -i "tailwind\|@apply" src index.html | head    # no output
```

Then `npm run server` + `npm run dev` and walk through: every tab at desktop width and ~390px; sidebar toggle on mobile; tab switch scrolls to top; AI assistant opens/chats; Blog shows the two posts; Portfolio shows four enriched cards; Contact validation. Compare visually against `vcard-personal-portfolio/website-demo-image/desktop.png` (spacing, gold accent, card borders).

- [ ] **Step 7: Commit**

```bash
git add -u
git add CLAUDE.md
git commit -m "chore: remove old UI, 3D assets and Tailwind; update docs" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected: `git status` shows only `?? vcard-personal-portfolio/`.

- [ ] **Step 8: Hand back to the user**

Report: branch `vcard-redesign` is ready, nothing pushed or merged. Remind them to (a) optionally add `public/assets/div-avatar.jpg` (sidebar and AI widget fall back to initials), (b) optionally set `GITHUB_TOKEN` and `SUBSTACK_URL` in Vercel project env vars, (c) decide whether to delete or gitignore the `vcard-personal-portfolio/` reference clone. Do not merge or deploy without their go-ahead.
