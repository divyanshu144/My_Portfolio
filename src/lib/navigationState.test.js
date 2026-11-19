import test from 'node:test'
import assert from 'node:assert/strict'
import { readActiveTab, storeActiveTab } from './navigationState.js'

const tabs = ['about', 'portfolio', 'resume', 'blog', 'contact']

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('restores a previously selected workspace tab after reload', () => {
  const storage = memoryStorage()
  storeActiveTab('resume', storage)
  assert.equal(readActiveTab(tabs, 'about', storage), 'resume')
})

test('uses the overview for missing or unknown saved tabs', () => {
  assert.equal(readActiveTab(tabs, 'about', memoryStorage()), 'about')
  assert.equal(readActiveTab(tabs, 'about', memoryStorage({ 'portfolio.activeTab': 'invalid' })), 'about')
})

test('storage failures do not prevent navigation', () => {
  const unavailable = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  assert.equal(readActiveTab(tabs, 'about', unavailable), 'about')
  assert.doesNotThrow(() => storeActiveTab('resume', unavailable))
})
