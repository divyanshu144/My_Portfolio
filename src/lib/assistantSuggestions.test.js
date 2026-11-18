import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { suggestionsFor } from './assistantSuggestions.js'

const data = JSON.parse(await readFile(new URL('../../data/portfolioData.json', import.meta.url)))

const a = { suggestions: { about: ['a1', 'a2', 'a3', 'a4'], portfolio: ['p1'], resume: ['r1'], blog: [], contact: ['c1'], caseStudies: { superops: ['s1', 's2'] } } }

test('case-study questions win on Projects when one is in view', () => assert.deepEqual(suggestionsFor(a, { tab: 'portfolio', caseStudyId: 'superops' }), ['s1', 's2']))
test('falls back to the tab, then to overview', () => {
  assert.deepEqual(suggestionsFor(a, { tab: 'portfolio', caseStudyId: 'jobfit' }), ['p1'])
  assert.deepEqual(suggestionsFor(a, { tab: 'blog' }), ['a1', 'a2', 'a3'])
})
test('never more than three', () => assert.equal(suggestionsFor(a, { tab: 'about' }).length, 3))
test('ignores _todo and unknown tabs, and tolerates missing data', () => {
  const withTodo = { _todo: 'x', suggestions: { ...a.suggestions, _todo: 'y' } }
  assert.deepEqual(suggestionsFor(withTodo, { tab: '_todo' }), ['a1', 'a2', 'a3'])
  assert.deepEqual(suggestionsFor(withTodo, { tab: 'nope' }), ['a1', 'a2', 'a3'])
  assert.deepEqual(suggestionsFor(undefined, { tab: 'about' }), [])
  assert.deepEqual(suggestionsFor({}, { tab: 'about' }), [])
})
test('real data: every tab and case study has 1–3 questions and askAbout covers its ids', () => {
  const { suggestions, askAbout } = data.assistant
  for (const list of [...['about', 'portfolio', 'resume', 'blog', 'contact'].map((k) => suggestions[k]), ...['jobfit', 'docchat', 'superops'].map((k) => suggestions.caseStudies[k])])
    assert.ok(list.length >= 1 && list.length <= 3)
  for (const id of ['jobfit', 'docchat', 'superops', 'mphasis-senior', 'mphasis-engineer', 'hermitcrabs-intern']) assert.equal(typeof askAbout[id], 'string')
})
test('real data: about covers visa and availability, and the draft is flagged', () => {
  const about = data.assistant.suggestions.about.join(' ').toLowerCase()
  assert.match(about, /visa|sponsor/)
  assert.match(about, /available|availab|start/)
  assert.equal(data.assistant._todo, 'Draft questions; owner to review')
})
