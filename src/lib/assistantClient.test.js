import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readResponse, FALLBACK_ERROR } from './assistantClient.js'

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

test('a 200 JSON body gives ok and the data', async () => {
  const data = { mode: 'ask', text: 'Yes.', sources: ['profile'], actions: ['cv'] }
  assert.deepEqual(await readResponse(json(data, 200)), { ok: true, data })
})

test('a non-2xx JSON error body gives that error', async () => {
  assert.deepEqual(await readResponse(json({ error: 'Too long' }, 413)), { ok: false, error: 'Too long' })
})

test('a 502 HTML page gives the fallback message', async () => {
  const res = new Response('<html><body>Bad gateway</body></html>', { status: 502, headers: { 'Content-Type': 'text/html' } })
  assert.deepEqual(await readResponse(res), { ok: false, error: FALLBACK_ERROR })
})

test('an empty 500 body gives the fallback message', async () => {
  assert.deepEqual(await readResponse(new Response('', { status: 500 })), { ok: false, error: FALLBACK_ERROR })
})

test('the fallback message is the agreed copy', () => {
  assert.equal(FALLBACK_ERROR, 'The assistant is unavailable right now. Please try again shortly.')
})
