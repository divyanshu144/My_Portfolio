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
