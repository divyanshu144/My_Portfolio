// The ids the assistant may point at. Shared by the browser and the serverless
// function, so it stays plain JavaScript and takes the data as an argument.

export function emailHref(to, { subject, body } = {}) {
  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`
}

export function buildCatalog(data) {
  const experience = data.experience || []
  const projects = data.projects || []

  const targets = [
    { id: 'profile', label: 'Profile', tab: 'about', anchor: null },
    ...experience.map((e) => ({ id: e.id, label: `${e.title} · ${e.company}`, tab: 'resume', anchor: e.id })),
    { id: 'education', label: 'Education', tab: 'resume', anchor: 'education' },
    ...projects.map((p) => ({ id: p.id, label: p.name, tab: 'portfolio', anchor: p.id })),
    { id: 'notes', label: 'Notes', tab: 'blog', anchor: null },
  ]

  const actions = [
    ...targets.map((t) => ({ id: `open:${t.id}`, label: `Open ${t.label}`, kind: 'navigate', target: t.id })),
    ...projects
      .filter((p) => p.caseStudy)
      .map((p) => ({ id: `play:${p.id}`, label: '▶ Play the example run', kind: 'play', target: p.id })),
    ...projects
      .filter((p) => p.repo)
      .map((p) => ({ id: `repo:${p.id}`, label: `${p.name} repository ↗`, kind: 'link', href: p.repo })),
  ]
  if (data.cv) actions.push({ id: 'cv', label: 'Download CV ↓', kind: 'link', href: data.cv, download: true })
  if (data.contact?.email) {
    actions.push({
      id: 'email',
      label: 'Email Divyanshu ↗',
      kind: 'email',
      href: emailHref(data.contact.email, { subject: 'From your portfolio', body: '' }),
    })
  }

  const byId = new Map()
  for (const x of [...targets, ...actions]) byId.set(x.id, x)
  return { targets, actions, byId }
}

// Keeps the model's order, drops duplicates and anything that is not an id of
// the requested kind, and caps the count.
export function pickAllowed(ids, catalog, kind, max = 3) {
  if (!Array.isArray(ids)) return []
  const allowed = new Set(catalog[kind].map((x) => x.id))
  const out = []
  for (const id of ids) {
    if (typeof id === 'string' && allowed.has(id) && !out.includes(id)) out.push(id)
    if (out.length >= max) break
  }
  return out
}

export function catalogForPrompt(catalog) {
  const line = (x) => `${x.id} — ${x.label}`
  return ['Targets:', ...catalog.targets.map(line), '', 'Actions:', ...catalog.actions.map(line)].join('\n')
}
