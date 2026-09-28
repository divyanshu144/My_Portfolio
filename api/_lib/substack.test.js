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
