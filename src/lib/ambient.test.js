import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldAnimate } from './ambient.js'

test('runs only when on screen and the page is visible', () => {
  assert.equal(shouldAnimate({ inView: true, pageVisible: true }), true)
  assert.equal(shouldAnimate({ inView: false, pageVisible: true }), false)
  assert.equal(shouldAnimate({ inView: true, pageVisible: false }), false)
  assert.equal(shouldAnimate({ inView: false, pageVisible: false }), false)
})
