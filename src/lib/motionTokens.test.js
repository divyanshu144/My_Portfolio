import test from 'node:test'
import assert from 'node:assert/strict'
import { EASE, DURATION, STAGGER, transition } from './motionTokens.js'

test('shared rhythm matches the spec', () => {
  assert.deepEqual(EASE, [0.2, 0.7, 0.2, 1])
  assert.deepEqual(DURATION, { quick: 0.15, normal: 0.25, slow: 0.4 })
  assert.equal(STAGGER, 0.05)
})

test('transition(name) builds a Motion transition', () => {
  assert.deepEqual(transition('normal'), { duration: 0.25, ease: [0.2, 0.7, 0.2, 1] })
  assert.throws(() => transition('glacial'))
})
