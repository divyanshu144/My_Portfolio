import test from 'node:test'
import assert from 'node:assert/strict'
import { clampHeight, fitHeight } from './consoleSize.js'

test('clampHeight keeps the console between 220px and 80% of the viewport', () => {
  assert.equal(clampHeight(100, 1000), 220)
  assert.equal(clampHeight(900, 1000), 800)
  assert.equal(clampHeight(500, 1000), 500)
})

test('clampHeight lets the minimum win on a very short viewport', () => {
  assert.equal(clampHeight(500, 200), 220)
})

test('fitHeight is 55% of the viewport, clamped', () => {
  assert.equal(fitHeight(1000), 550)
  assert.equal(fitHeight(300), 220)
})
