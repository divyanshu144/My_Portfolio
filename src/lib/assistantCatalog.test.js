import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildCatalog, pickAllowed, catalogForPrompt, emailHref } from './assistantCatalog.js'

const data = JSON.parse(await readFile(new URL('../../data/portfolioData.json', import.meta.url)))

test('targets cover profile, every experience entry, education, every project and notes', () => {
  const ids = buildCatalog(data).targets.map((t) => t.id)
  assert.deepEqual(ids, ['profile', 'mphasis-senior', 'mphasis-engineer', 'hermitcrabs-intern', 'education',
    'jobfit', 'jarvis', 'docchat', 'promptops', 'superops', 'epc-south-west', 'fooder', 'notes'])
})
test('targets know where they live', () => {
  const t = buildCatalog(data).byId
  assert.deepEqual(t.get('superops'), { id: 'superops', label: 'SuperOps', tab: 'portfolio', anchor: 'superops' })
  assert.equal(t.get('profile').tab, 'about'); assert.equal(t.get('profile').anchor, null)
  assert.equal(t.get('mphasis-senior').label, 'Senior Software Engineer · Mphasis')
  assert.equal(t.get('education').anchor, 'education')
})
test('play actions exist only for case studies, repo actions only for projects with a repo', () => {
  const ids = buildCatalog(data).actions.map((a) => a.id)
  assert.ok(ids.includes('play:docchat') && !ids.includes('play:jarvis'))
  assert.ok(ids.includes('repo:docchat'))
  assert.ok(ids.includes('cv') && ids.includes('email') && ids.includes('open:superops'))
})
test('no cv action when the data has no cv', () => {
  assert.ok(!buildCatalog({ ...data, cv: undefined }).actions.some((a) => a.id === 'cv'))
})
test('pickAllowed drops invented ids, urls, duplicates and non-strings, and caps the count', () => {
  const c = buildCatalog(data)
  assert.deepEqual(pickAllowed(['open:superops', 'open:linkedin', 'https://x.y', 'open:superops', 7, 'cv', 'email', 'play:jobfit'], c, 'actions'),
    ['open:superops', 'cv', 'email'])
  assert.deepEqual(pickAllowed('docchat', c, 'targets'), [])
  assert.deepEqual(pickAllowed(['docchat', 'cv'], c, 'targets'), ['docchat'])
})
test('emailHref encodes subject and body', () => {
  assert.equal(emailHref('a@b.co', { subject: 'Role: ML Engineer', body: 'Hi & hello' }),
    'mailto:a@b.co?subject=Role%3A%20ML%20Engineer&body=Hi%20%26%20hello')
})
test('catalogForPrompt lists every id once', () => {
  const c = buildCatalog(data); const text = catalogForPrompt(c)
  for (const x of [...c.targets, ...c.actions]) assert.ok(text.includes(`${x.id} — ${x.label}`), x.id)
})

// Rulings beyond the brief
test('emailHref omits an empty body', () => {
  assert.equal(emailHref('a@b.co', { subject: 'From your portfolio', body: '' }),
    'mailto:a@b.co?subject=From%20your%20portfolio')
})
test('action shapes: open and play carry a target, repo and email carry an href', () => {
  const { byId } = buildCatalog(data)
  assert.deepEqual(byId.get('open:superops'), { id: 'open:superops', label: 'Open SuperOps', kind: 'navigate', target: 'superops' })
  assert.deepEqual(byId.get('play:docchat'), { id: 'play:docchat', label: '▶ Play the example run', kind: 'play', target: 'docchat' })
  assert.deepEqual(byId.get('repo:docchat'),
    { id: 'repo:docchat', label: 'DocChat repository ↗', kind: 'link', href: 'https://github.com/divyanshu144/DocChat' })
  assert.deepEqual(byId.get('cv'), { id: 'cv', label: 'Download CV ↓', kind: 'link', href: data.cv, download: true })
  assert.deepEqual(byId.get('email'), { id: 'email', label: 'Email Divyanshu ↗', kind: 'email',
    href: `mailto:${data.contact.email}?subject=From%20your%20portfolio` })
})
test('pickAllowed respects max', () => {
  const c = buildCatalog(data)
  assert.deepEqual(pickAllowed(['jobfit', 'jarvis', 'docchat', 'promptops'], c, 'targets', 2), ['jobfit', 'jarvis'])
})
