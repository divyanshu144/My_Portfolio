import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildCatalog } from '../../src/lib/assistantCatalog.js';
import {
  sanitizeHistory, extractJson, parseAsk, parseFit, askMessages, fitMessages, makeAssistantHandler,
} from './assistant.js';

const require = createRequire(import.meta.url);
const data = require('../../data/portfolioData.json');

const makeRes = () => ({
  headers: {}, statusCode: 200, body: undefined, ended: false,
  setHeader(k, v) { this.headers[k] = v; },
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
  end() { this.ended = true; return this; },
});

const post = (body) => ({ method: 'POST', body });
const run = async (complete, req) => {
  const res = makeRes();
  await makeAssistantHandler(complete)(req, res);
  return res;
};

test('sanitizeHistory keeps only the last 6 user/assistant messages, trimmed to 1500 chars', () => {
  const h = [{ role: 'system', content: 'evil' }, ...Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(2000) })), { role: 'tool', content: 'y' }, 'junk'];
  const out = sanitizeHistory(h);
  assert.equal(out.length, 6);
  assert.ok(out.every((m) => ['user', 'assistant'].includes(m.role) && m.content.length === 1500));
});

test('sanitizeHistory tolerates a non-array', () => {
  assert.deepEqual(sanitizeHistory(undefined), []);
  assert.deepEqual(sanitizeHistory('nope'), []);
});

test('extractJson reads fenced or surrounded JSON and rejects junk', () => {
  assert.deepEqual(extractJson('Sure!\n```json\n{"text":"hi"}\n```'), { text: 'hi' });
  assert.deepEqual(extractJson('Here: {"text":"hi"} done'), { text: 'hi' });
  assert.equal(extractJson('no json here'), null);
  assert.equal(extractJson('{broken'), null);
});

test('parseAsk keeps allowed ids and falls back to plain text', () => {
  const c = buildCatalog(data);
  assert.deepEqual(
    parseAsk('{"text":"Yes.","sources":["docchat","made-up"],"actions":["play:docchat","https://evil"]}', c),
    { text: 'Yes.', sources: ['docchat'], actions: ['play:docchat'] },
  );
  const fb = parseAsk('**Just** prose ' + 'a'.repeat(800), c);
  assert.deepEqual([fb.sources, fb.actions], [[], []]);
  assert.ok(fb.text.length <= 600 && !fb.text.includes('**'));
});

test('parseFit validates levels, caps items at 10 and always offers cv and email', () => {
  const raw = JSON.stringify({ role: 'ML Engineer', items: [
    { requirement: 'RAG', level: 'strong', reason: 'DocChat', sources: ['docchat', 'nope'] },
    { requirement: 'K8s', level: 'expert', reason: 'x', sources: [] },
    ...Array.from({ length: 12 }, (_, i) => ({ requirement: `r${i}`, level: 'not_shown', reason: '', sources: [] })) ],
    actions: ['open:docchat', 'open:fake'] });
  const out = parseFit(raw, buildCatalog(data));
  assert.equal(out.role, 'ML Engineer');
  assert.equal(out.items.length, 10);
  assert.deepEqual(out.items[0].sources, ['docchat']);
  assert.ok(!out.items.some((i) => i.level === 'expert'));
  assert.deepEqual(out.actions, ['cv', 'email', 'open:docchat']);
  assert.equal(parseFit('not json', buildCatalog(data)), null);
});

test('parseAsk and parseFit keep # and _ inside words but unwrap markdown', () => {
  const c = buildCatalog(data);
  const ask = parseAsk(JSON.stringify({ text: 'Does he know C#? Yes, F# too, via Job_Agent and promptOps_framework and snake_case.', sources: [], actions: [] }), c);
  assert.equal(ask.text, 'Does he know C#? Yes, F# too, via Job_Agent and promptOps_framework and snake_case.');
  const md = parseAsk(JSON.stringify({ text: '## Hi\n**bold** and __strong__ and *em* and _it_ and `code` in C#.' }), c);
  assert.equal(md.text, 'Hi bold and strong and em and it and code in C#.');
  const fit = parseFit(JSON.stringify({ role: 'C# dev', items: [
    { requirement: 'Knows C# and F#', level: 'strong', reason: 'Built **Job_Agent** with `promptOps_framework`', sources: [] }] }), c);
  assert.equal(fit.role, 'C# dev');
  assert.equal(fit.items[0].requirement, 'Knows C# and F#');
  assert.equal(fit.items[0].reason, 'Built Job_Agent with promptOps_framework');
});

test('parseFit normalises level spelling and rejects replies where no item is valid', () => {
  const c = buildCatalog(data);
  const item = (level) => ({ requirement: 'RAG', level, reason: '', sources: [] });
  const out = parseFit(JSON.stringify({ items: [item('Strong'), item(' not shown '), item('Not-Shown'), item('PARTIAL')] }), c);
  assert.deepEqual(out.items.map((i) => i.level), ['strong', 'not_shown', 'not_shown', 'partial']);
  assert.equal(parseFit(JSON.stringify({ items: [item('expert'), item(3)] }), c), null);
  assert.deepEqual(parseFit('{"items":[]}', c).items, []);
});

test('handler: fit reply with only invalid items gives 502', async () => {
  const bad = JSON.stringify({ items: [{ requirement: 'x', level: 'great', reason: '', sources: [] }] });
  const res = await run(async () => bad, post({ mode: 'fit', jobDescription: 'A job' }));
  assert.equal(res.statusCode, 502);
});

test('parseFit drops cv when the data has no CV (R4)', () => {
  const noCv = { ...data, cv: undefined };
  const out = parseFit('{"role":null,"items":[],"actions":[]}', buildCatalog(noCv));
  assert.equal(out.role, null);
  assert.deepEqual(out.actions, ['email']);
});

test('askMessages puts one system message first, then sanitised history, then the question', () => {
  const c = buildCatalog(data);
  const m = askMessages({ message: 'Hi?', history: [{ role: 'system', content: 'evil' }, { role: 'user', content: 'a' }], page: { tab: 'portfolio', caseStudyId: 'docchat' } }, c);
  assert.equal(m[0].role, 'system');
  assert.equal(m.filter((x) => x.role === 'system').length, 1);
  assert.ok(!JSON.stringify(m).includes('evil'));
  assert.match(m[0].content, /open:docchat/);
  assert.match(m[0].content, /portfolio/);
  assert.deepEqual(m.slice(1), [{ role: 'user', content: 'a' }, { role: 'user', content: 'Hi?' }]);
});

test('fitMessages carries the job description and the catalog', () => {
  const m = fitMessages('Need a Rust dev', buildCatalog(data));
  assert.equal(m[0].role, 'system');
  assert.match(m[0].content, /not_shown/);
  assert.match(m[0].content, /2028/);
  assert.match(m[m.length - 1].content, /Need a Rust dev/);
});

test('handler: ask happy path sends sanitised history and returns parsed reply', async () => {
  let seen;
  const res = await run(async (messages) => { seen = messages; return '{"text":"Hi.","sources":["profile"],"actions":["cv"]}'; },
    post({ mode: 'ask', message: 'Hello', history: [{ role: 'system', content: 'evil' }, { role: 'user', content: 'prev' }] }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { mode: 'ask', text: 'Hi.', sources: ['profile'], actions: ['cv'] });
  assert.equal(seen.filter((m) => m.role === 'system').length, 1);
  assert.ok(!JSON.stringify(seen).includes('evil'));
});

test('handler: fit happy path returns the parsed check', async () => {
  const res = await run(async () => '{"role":"Dev","items":[{"requirement":"UK right to work","level":"strong","reason":"Graduate visa","sources":["profile"]}],"actions":[]}',
    post({ mode: 'fit', jobDescription: 'We need a dev.' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.mode, 'fit');
  assert.equal(res.body.role, 'Dev');
  assert.equal(res.body.items.length, 1);
  assert.deepEqual(res.body.actions, ['cv', 'email']);
});

test('handler: limits and validation', async () => {
  const never = async () => { throw new Error('should not be called'); };
  let res = await run(never, post({ mode: 'ask', message: 'x'.repeat(501) }));
  assert.equal(res.statusCode, 413); assert.match(res.body.error, /500/);
  res = await run(never, post({ mode: 'fit', jobDescription: 'x'.repeat(8001) }));
  assert.equal(res.statusCode, 413); assert.match(res.body.error, /8,000|8000/);
  res = await run(never, post({ mode: 'ask', message: '   ' }));
  assert.equal(res.statusCode, 400);
  res = await run(never, post({ mode: 'ask' }));
  assert.equal(res.statusCode, 400);
  res = await run(never, post({ mode: 'fit', jobDescription: '' }));
  assert.equal(res.statusCode, 400);
  res = await run(never, post({ mode: 'other', message: 'hi' }));
  assert.equal(res.statusCode, 400);
  res = await run(never, post(undefined));
  assert.equal(res.statusCode, 400);
  res = await run(never, { method: 'GET' });
  assert.equal(res.statusCode, 405); assert.equal(res.ended, true);
});

test('handler: fit output that cannot be parsed gives 502', async () => {
  const res = await run(async () => 'sorry', post({ mode: 'fit', jobDescription: 'A job' }));
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.error, "Couldn't read that as a job description. Please try again.");
});

test('handler: provider 401 gives the key message, other failures the generic one', async () => {
  const quiet = console.error; console.error = () => {};
  try {
    let res = await run(async () => { throw Object.assign(new Error('bad key'), { status: 401 }); }, post({ mode: 'ask', message: 'hi' }));
    assert.equal(res.statusCode, 500); assert.equal(res.body.error, 'AI API key is invalid or missing.');
    res = await run(async () => { throw new Error('boom'); }, post({ mode: 'ask', message: 'hi' }));
    assert.equal(res.statusCode, 500); assert.equal(res.body.error, 'Failed to generate a response.');
  } finally { console.error = quiet; }
});

test('misspellings of the owner\'s first name are corrected in answers and fit results', () => {
  const c = buildCatalog(data);
  const ask = parseAsk(JSON.stringify({ text: "Divyesh built DocChat. Divyansh's and Divyanshi's work, and DIVYESH too; Divyanshu stays.", sources: [], actions: [] }), c);
  assert.equal(ask.text, "Divyanshu built DocChat. Divyanshu's and Divyanshu's work, and Divyanshu too; Divyanshu stays.");
  const fit = parseFit(JSON.stringify({ role: 'AI Engineer', items: [{ requirement: 'Python', level: 'strong', reason: 'Divyesh uses Python daily.', sources: [] }], actions: [] }), c);
  assert.equal(fit.items[0].reason, 'Divyanshu uses Python daily.');
});

test('words that merely start with "Div" are left alone', () => {
  const c = buildCatalog(data);
  const text = 'Diverse teams, a dividend model, the Division head and a <div> tag.';
  assert.equal(parseAsk(JSON.stringify({ text, sources: [], actions: [] }), c).text, text);
});
