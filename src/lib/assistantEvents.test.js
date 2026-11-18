import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ASK_EVENT, PLAY_EVENT, askAssistant, playDemo, onEvent } from './assistantEvents.js'

test('askAssistant delivers the question to an ASK_EVENT handler', () => {
  const t = new EventTarget()
  const got = []
  onEvent(ASK_EVENT, (detail) => got.push(detail), t)
  askAssistant('q', t)
  assert.deepEqual(got, ['q'])
})

test('playDemo delivers the case study id to a PLAY_EVENT handler', () => {
  const t = new EventTarget()
  const got = []
  onEvent(PLAY_EVENT, (detail) => got.push(detail), t)
  playDemo('docchat', t)
  assert.deepEqual(got, ['docchat'])
})

test('events are routed by name', () => {
  const t = new EventTarget()
  const got = []
  onEvent(ASK_EVENT, (detail) => got.push(detail), t)
  playDemo('docchat', t)
  assert.deepEqual(got, [])
})

test('the unsubscribe function stops delivery', () => {
  const t = new EventTarget()
  const got = []
  const off = onEvent(ASK_EVENT, (detail) => got.push(detail), t)
  askAssistant('one', t)
  off()
  askAssistant('two', t)
  assert.deepEqual(got, ['one'])
})
