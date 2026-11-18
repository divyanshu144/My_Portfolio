# Portfolio Assistant Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gold "Ask AI" popup with a bottom workspace console (Ask and Fit check tabs) that gives short, sourced answers with buttons that navigate the site.

**Architecture:** One catalog module, built from `portfolioData.json`, defines every allowed source and action id. The server includes these ids in the prompt and drops any id that isn't in the catalog. The client maps ids to labels and behaviour. A single serverless endpoint `/api/assistant` handles `mode: 'ask' | 'fit'`, and the dev server mounts the same handler. The console is a non-modal React component driven by a `useAssistant` hook. Navigation, "Ask about this" and "play demo" travel as small window events.

**Tech Stack:** React 18.3, Vite 5, Vercel serverless functions (Node 24), OpenAI-compatible client (Groq in production), `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-18-portfolio-assistant-console-design.md`

## Global Constraints

- Production is Vercel only. Delete `railway.toml`. `server/index.js` is dev-only and must mount the same `api/` handlers.
- Do not edit `src/vcard.css`. New styles go in `src/workspace.css`.
- Answers are 2–3 sentences. Each answer has 1–3 actions and 1–3 sources, chosen only from catalog ids. Unknown ids are dropped, and an answer with no valid ids still renders.
- The AI must never state a fact, link, project, metric or skill that isn't in the portfolio context. In a fit check, anything not evidenced is `not_shown`.
- Right to work: UK Graduate visa, full right to work until 2028, no sponsorship. In a fit check, UK right to work is `strong`. Sponsorship beyond 2028 or permanent residency is `partial`, with 2028 stated. Availability: "Available immediately." (already in `portfolioData.json` as `availability`).
- Limits: question ≤ 500 chars, job description ≤ 8000 chars, history = last 6 messages, each ≤ 1500 chars, roles `user`/`assistant` only.
- No gold and no page blur in the assistant. Near-black surfaces, cyan `#83e3db` accents, `var(--mono)` labels.
- The console is non-modal (no focus trap). Ctrl+` toggles it, Escape closes it, and focus returns to the opener. With `prefers-reduced-motion`, use fades only.
- Fit-check note text, exact: "Your description is sent to the AI to compare against this portfolio. It isn't stored."
- Empty Ask tab line, exact: "Ask about my projects, experience or fit for a role".
- Keep `src/components/avatar/*` files and their tests intact (unrendered).

## Review Focus

1. **The model returns prose, code fences or broken JSON instead of the agreed shape.** Expected: the answer text still shows (stripped, capped), with no buttons, and nothing crashes. Test in Task 3 (`parseAsk` fallback).
2. **The model invents ids or URLs** (`open:linkedin`, `repo:docchat-v2`, a raw `https://…`). Expected: they're silently dropped. Tests in Task 1 (`pickAllowed`) and Task 3 (`parseAsk`/`parseFit`).
3. **A pasted job description is huge, empty, or not a job description at all.** Expected: an over-limit description gets a 413 with a friendly message that tells the user the limit. An empty one gets a 400. Unreadable output gets a 502 "Couldn't read that as a job description". Tests in Task 3.
4. **The client sends a crafted `history`** (a `system` role, a 50 KB message, 40 turns). Expected: it's stripped down to the allowed shape. Test in Task 3 (`sanitizeHistory`).
5. **The API is down, the key is missing, or the response isn't JSON** (Vercel error page). Expected: an inline error appears in the console, the typed text is kept, and the console still works. Test in Task 5 (`readResponse`).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/assistantCatalog.js` (+ `.test.js`) | Build allowed targets/actions from data; filter ids; `mailto:` links; prompt listing. Shared by server and client. |
| `src/lib/assistantSuggestions.js` (+ `.test.js`) | Pick suggested questions for the current tab / case study. |
| `src/lib/assistantEvents.js` (+ `.test.js`) | Window events: ask the assistant, play a demo. |
| `src/lib/assistantClient.js` (+ `.test.js`) | Read API responses safely (non-JSON, errors). |
| `api/_lib/assistant.js` (+ `.test.js`) | Limits, history sanitising, prompts, parsing model output, handler factory. |
| `api/assistant.js` | Vercel function: handler wired to the real model. |
| `api/_lib/context.js` | Add case studies and ids to the AI context. |
| `server/index.js` | Mount `api/chat.js` and `api/assistant.js` handlers. |
| `data/portfolioData.json` | Ids for projects/experience; `assistant.suggestions`, `assistant.askAbout`. |
| `src/components/assistant/useAssistant.js` | Console state and requests. |
| `src/components/assistant/AssistantConsole.jsx` | Console frame: tabs, resize, keyboard, Ask tab, Fit tab, action/source buttons. |
| `src/components/AIAssistant.jsx` | Launcher + console; listens for ask events. |
| `src/App.jsx` | `goTo(tab, anchorId)`; passes `active` and `goTo` to `AIAssistant`. |
| `src/sections/Portfolio.jsx`, `src/sections/Resume.jsx` | DOM ids; "Ask about this" buttons. |
| `src/components/explorer/DemoPlayer.jsx` | Start playback on a `demo:play` event. |
| `src/workspace.css`, `src/index.css` | Console styles; remove the old popup styles. |

---

### Task 1: Ids in the data and the shared catalog

**Files:**
- Modify: `data/portfolioData.json`
- Create: `src/lib/assistantCatalog.js`, `src/lib/assistantCatalog.test.js`

**Interfaces:**
- Produces:
  - `buildCatalog(data) → { targets: Target[], actions: Action[], byId: Map<string, Target|Action> }`
    - `Target = { id, label, tab: 'about'|'portfolio'|'resume'|'blog'|'contact', anchor: string|null }`
    - `Action = { id, label, kind: 'navigate'|'play'|'link'|'email', target?: string, href?: string, download?: boolean }`
  - `pickAllowed(ids: unknown, catalog, kind: 'targets'|'actions', max = 3) → string[]` (keeps order, de-duplicates, drops anything not a string id of that kind)
  - `catalogForPrompt(catalog) → string` (one line per id: `id — label`, targets section then actions section)
  - `emailHref(to: string, { subject, body }) → string`

- [ ] **Step 1: Add ids to the data.** Give every project an `id`: `jobfit`, `jarvis`, `docchat`, `promptops`, `superops`, `epc-south-west`, `fooder`. Featured ids must equal their `caseStudy.id`. Give every experience entry an `id`: `mphasis-senior`, `mphasis-engineer`, `hermitcrabs-intern`.
- [ ] **Step 2: Write the failing tests** in `src/lib/assistantCatalog.test.js` (load the real JSON as the other tests do):

```js
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
  for (const x of [...c.targets, ...c.actions]) assert.equal(text.split(`\n${x.id} — `).length - 1 + (text.startsWith(`${x.id} — `) ? 1 : 0) >= 1, true)
})
```

- [ ] **Step 3: Run** `node --test src/lib/assistantCatalog.test.js`. Expected: FAIL (module not found).
- [ ] **Step 4: Implement `src/lib/assistantCatalog.js`.** Labels:
  - Experience: `${title} · ${company}`. Projects: `name`. Profile: "Profile". Education: "Education". Notes: "Notes".
  - Actions: `open:<id>` "Open <label>", `play:<id>` "▶ Play the example run", `cv` "Download CV ↓" (`href: data.cv`, `download: true`), `repo:<id>` "<name> repository ↗", `email` "Email Divyanshu ↗" (`href` built from `data.contact.email`).
- [ ] **Step 5: Run** `node --test src/lib/assistantCatalog.test.js`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(assistant): add ids and the shared assistant catalog`

### Task 2: Suggested questions and "Ask about this" data

**Files:**
- Modify: `data/portfolioData.json` (add `assistant`)
- Create: `src/lib/assistantSuggestions.js`, `src/lib/assistantSuggestions.test.js`

**Interfaces:**
- Consumes: ids from Task 1.
- Produces: `suggestionsFor(assistantData, { tab, caseStudyId = null }) → string[]` (at most 3); data shape `assistant: { suggestions: { about, portfolio, resume, blog, contact: string[], caseStudies: { jobfit, docchat, superops: string[] } }, askAbout: { [targetId]: string } }`.

- [ ] **Step 1: Draft the data.** Write 3 suggestions per tab and per case study, plus one `askAbout` question for each of `jobfit`, `docchat`, `superops`, `mphasis-senior`, `mphasis-engineer` and `hermitcrabs-intern`. Every question must be answerable from `portfolioData.json`, and the `about` suggestions must include visa and availability. Mark the block with `"_todo": "Draft questions; owner to review"` (`_todo` fields are never rendered or sent to the AI).
- [ ] **Step 2: Write failing tests:**

```js
const a = { suggestions: { about: ['a1','a2','a3','a4'], portfolio: ['p1'], resume: ['r1'], blog: [], contact: ['c1'], caseStudies: { superops: ['s1','s2'] } } }
test('case-study questions win on Projects when one is in view', () => assert.deepEqual(suggestionsFor(a, { tab: 'portfolio', caseStudyId: 'superops' }), ['s1','s2']))
test('falls back to the tab, then to overview', () => {
  assert.deepEqual(suggestionsFor(a, { tab: 'portfolio', caseStudyId: 'jobfit' }), ['p1'])
  assert.deepEqual(suggestionsFor(a, { tab: 'blog' }), ['a1','a2','a3'])
})
test('never more than three', () => assert.equal(suggestionsFor(a, { tab: 'about' }).length, 3))
test('real data: every tab and case study has 1–3 questions and askAbout covers its ids', () => { /* load data; assert lengths 1..3 for 5 tabs and 3 case studies; askAbout has the 6 ids above */ })
```

- [ ] **Step 3: Run** `node --test src/lib/assistantSuggestions.test.js`. Expected: FAIL.
- [ ] **Step 4: Implement** `suggestionsFor`.
- [ ] **Step 5: Run** the same command. Expected: PASS.
- [ ] **Step 6: Commit** `feat(assistant): page-aware suggested questions`

### Task 3: The `/api/assistant` endpoint

**Files:**
- Create: `api/_lib/assistant.js`, `api/_lib/assistant.test.js`, `api/assistant.js`
- Modify: `api/_lib/context.js` (context), `server/index.js` (mount handlers), delete `railway.toml`

**Interfaces:**
- Consumes: `buildCatalog`, `pickAllowed`, `catalogForPrompt` (Task 1); `ai`, `model`, `baseSystem`, `portfolioContext` from `api/_lib/context.js`.
- Produces (HTTP, `POST /api/assistant`):
  - Request `{ mode: 'ask', message, history?, page?: { tab, caseStudyId } }` returns `200 { mode: 'ask', text, sources: string[], actions: string[] }`.
  - Request `{ mode: 'fit', jobDescription }` returns `200 { mode: 'fit', role: string|null, items: { requirement, level: 'strong'|'partial'|'not_shown', reason, sources: string[] }[], actions: string[] }`.
  - Errors are `{ error }` with 400 (missing/empty/bad mode), 413 (over limit; the message names the limit), 405 (not POST), 502 (unreadable fit output), or 500 (provider failure; 401 from the provider gives "AI API key is invalid or missing.").
- Produces (module): `LIMITS`, `sanitizeHistory(history) → {role, content}[]`, `extractJson(raw) → object|null`, `parseAsk(raw, catalog) → { text, sources, actions }`, `parseFit(raw, catalog) → { role, items, actions } | null`, `askMessages(input, catalog) → messages[]`, `fitMessages(jobDescription, catalog) → messages[]`, `makeAssistantHandler(complete: (messages) => Promise<string>) → (req, res) => Promise<void>`.

- [ ] **Step 1: Write failing tests** in `api/_lib/assistant.test.js`. Use the `makeRes` helper pattern from `api/_lib/routes.test.js` and a fake `complete`:

```js
test('sanitizeHistory keeps only the last 6 user/assistant messages, trimmed to 1500 chars', () => {
  const h = [{ role: 'system', content: 'evil' }, ...Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(2000) })), { role: 'tool', content: 'y' }, 'junk']
  const out = sanitizeHistory(h)
  assert.equal(out.length, 6); assert.ok(out.every((m) => ['user','assistant'].includes(m.role) && m.content.length === 1500))
})
test('extractJson reads fenced or surrounded JSON and rejects junk', () => {
  assert.deepEqual(extractJson('Sure!\n```json\n{"text":"hi"}\n```'), { text: 'hi' })
  assert.equal(extractJson('no json here'), null)
})
test('parseAsk keeps allowed ids and falls back to plain text', () => {
  const c = buildCatalog(data)
  assert.deepEqual(parseAsk('{"text":"Yes.","sources":["docchat","made-up"],"actions":["play:docchat","https://evil"]}', c),
    { text: 'Yes.', sources: ['docchat'], actions: ['play:docchat'] })
  const fb = parseAsk('**Just** prose ' + 'a'.repeat(800), c)
  assert.deepEqual([fb.sources, fb.actions], [[], []]); assert.ok(fb.text.length <= 600 && !fb.text.includes('**'))
})
test('parseFit validates levels, caps items at 10 and always offers cv and email', () => {
  const raw = JSON.stringify({ role: 'ML Engineer', items: [
    { requirement: 'RAG', level: 'strong', reason: 'DocChat', sources: ['docchat', 'nope'] },
    { requirement: 'K8s', level: 'expert', reason: 'x', sources: [] },
    ...Array.from({ length: 12 }, (_, i) => ({ requirement: `r${i}`, level: 'not_shown', reason: '', sources: [] })) ],
    actions: ['open:docchat', 'open:fake'] })
  const out = parseFit(raw, buildCatalog(data))
  assert.equal(out.role, 'ML Engineer'); assert.equal(out.items.length, 10)
  assert.deepEqual(out.items[0].sources, ['docchat']); assert.ok(!out.items.some((i) => i.level === 'expert'))
  assert.deepEqual(out.actions, ['cv', 'email', 'open:docchat'])
  assert.equal(parseFit('not json', buildCatalog(data)), null)
})
test('handler: ask happy path sends sanitised history and returns parsed reply', async () => { /* complete returns '{"text":"Hi.","sources":["profile"],"actions":["cv"]}'; expect 200 { mode:'ask', text:'Hi.', sources:['profile'], actions:['cv'] } and the messages passed to complete contain no 'system' from history */ })
test('handler: limits and validation', async () => {
  // message of 501 chars -> 413 with /500/ in error; jobDescription of 8001 chars -> 413 with /8,000|8000/; empty message -> 400; mode 'other' -> 400; GET -> 405
})
test('handler: fit output that cannot be parsed gives 502', async () => { /* complete returns 'sorry' -> 502 */ })
test('handler: provider 401 gives the key message', async () => { /* complete throws { status: 401 } -> 500 'AI API key is invalid or missing.' */ })
```

- [ ] **Step 2: Run** `node --test api/_lib/assistant.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement `api/_lib/assistant.js`.**
  - Prompts tell the model to reply with only JSON in the documented shape.
  - Ask prompt: 2–3 sentences in plain text (no markdown); use only facts from the portfolio context; pick sources and actions only from the listed ids; include the current page as a hint.
  - Fit prompt: list up to 10 key requirements. Mark a requirement `strong` only with direct evidence and `partial` with related evidence, and use `not_shown` otherwise. Never stretch evidence. Apply the right-to-work rule from Global Constraints.
  - `parseAsk` fallback: strip markdown symbols and cap at 600 chars on a sentence boundary when possible.
  - `parseFit` always returns `actions` = `['cv','email']` plus at most one valid `open:`/`play:` action from the model.
- [ ] **Step 4: Update the context.** In `api/_lib/context.js`, add each project's `id` and, for case studies, `problem`, `contribution`, `decision`, `outcome`, `limitation` and `workflow`, plus each experience entry's `id`. Export nothing new.
- [ ] **Step 5: Create `api/assistant.js`.** `export default makeAssistantHandler((messages) => ai.chat.completions.create({ model, messages }).then((r) => r.choices[0].message.content ?? ''))`. The system message is `${baseSystem}\n\n${portfolioContext}` plus the catalog listing, built inside `askMessages`/`fitMessages`.
- [ ] **Step 6: Dev server.** In `server/index.js`, replace the inline `app.post('/api/chat', …)` with `app.post('/api/chat', chatHandler)` (default export of `api/chat.js`) and add `app.post('/api/assistant', assistantHandler)`, following the existing `blogHandler` mount. Delete `railway.toml`.
- [ ] **Step 7: Run** `npm test`. Expected: all pass, including the existing `routes.test.js`.
- [ ] **Step 8: Smoke test.** Run `npm run server`, then `curl -s -X POST localhost:8787/api/assistant -H 'Content-Type: application/json' -d '{"mode":"ask","message":"Does he need sponsorship?"}'`. Expected: JSON with a 2–3 sentence `text` that mentions 2028, `sources` containing `profile`, and an `actions` array.
- [ ] **Step 9: Commit** `feat(assistant): /api/assistant endpoint with ask and fit modes`

### Task 4: Navigation plumbing (ids on the page, goTo, play event)

**Files:**
- Create: `src/lib/assistantEvents.js`, `src/lib/assistantEvents.test.js`
- Modify: `src/App.jsx`, `src/sections/Resume.jsx`, `src/sections/Portfolio.jsx`, `src/components/explorer/DemoPlayer.jsx`

**Interfaces:**
- Consumes: Target `{ tab, anchor }` (Task 1).
- Produces:
  - `ASK_EVENT = 'assistant:ask'`, `PLAY_EVENT = 'demo:play'`.
  - `askAssistant(question: string, target = window)`, `playDemo(caseStudyId: string, target = window)`, `onEvent(name, handler, target = window) → unsubscribe` (the handler receives `event.detail`).
  - In `App.jsx`: `goTo(tab: string, anchorId: string|null)` selects the tab, then on the next frame scrolls `#anchorId` into view (`block: 'start'`, smooth unless reduced motion) and adds class `is-targeted` for 1600 ms. It's passed as `<AIAssistant active={active} goTo={goTo} />`.
  - `DemoPlayer` (deep variant): on `PLAY_EVENT` with `detail === project`, reset to the first beat, clear `finished`, and play.

- [ ] **Step 1: Write failing tests** with an `EventTarget` as the target: `askAssistant('q', t)` delivers `'q'` to an `onEvent(ASK_EVENT, …, t)` handler; `playDemo('docchat', t)` delivers `'docchat'`; calling the unsubscribe stops delivery.
- [ ] **Step 2: Run** `node --test src/lib/assistantEvents.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `src/lib/assistantEvents.js` with `CustomEvent`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Page ids.** In `Resume.jsx`, render `id={x.id}` on each experience `<li>` and give the Education `<section>` `id="education"` (add an `id` prop to `Timeline`). In `Portfolio.jsx`, render `id={project.id}` on each "More projects" `<li>`. Case studies already render `id={study.id}`. Add `goTo` to `App.jsx`, the `PLAY_EVENT` listener to `DemoPlayer`, and `.is-targeted` (a 1.6s cyan outline fade) to `workspace.css`.
- [ ] **Step 6: Verify** with `npm run lint && npm test && npm run build`. Expected: all pass.
- [ ] **Step 7: Commit** `feat(assistant): page anchors, goTo navigation and demo play event`

### Task 5: The console with the Ask tab

**Files:**
- Create: `src/lib/assistantClient.js`, `src/lib/assistantClient.test.js`, `src/components/assistant/useAssistant.js`, `src/components/assistant/AssistantConsole.jsx`
- Modify: `src/components/AIAssistant.jsx`, `src/workspace.css`, `src/index.css` (remove `.wa-backdrop`, `.wa-popup`, `.ai-*` popup rules no longer used; leave `.wa-flag`, the avatar rules and anything still referenced)

**Interfaces:**
- Consumes: `buildCatalog`, `emailHref` (Task 1), `suggestionsFor` (Task 2), `POST /api/assistant` (Task 3), `goTo`, `playDemo`, `onEvent`, `ASK_EVENT` (Task 4).
- Produces:
  - `readResponse(res: Response) → Promise<{ ok: true, data } | { ok: false, error: string }>`. Non-JSON or non-2xx gives `ok: false`, using `data.error` when present, else "The assistant is unavailable right now. Please try again shortly."
  - `useAssistant() → { messages, ask(question, page), loading, fit, runFit(jobDescription), fitLoading }`. `messages` is `{ role: 'user'|'assistant', text, sources?, actions?, error? }[]`. `fit` is `{ result: FitResult|null, error: string|null }`.
  - `<AssistantConsole open onClose tab onTab active goTo />` renders the frame and both tabs. The Fit tab body comes in Task 6.
  - `AIAssistant({ active, goTo })` owns `open` and the active console tab, opens on `ASK_EVENT` and asks the question.

- [ ] **Step 1: Write failing tests** for `readResponse` with `new Response(...)`: a 200 JSON body gives `ok: true` and the data; a 413 `{error:'Too long'}` gives that error; a 502 HTML page gives the fallback message; an empty 500 body gives the fallback message.
- [ ] **Step 2: Run** `node --test src/lib/assistantClient.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `readResponse`, `useAssistant` (on error, add an assistant message with `error` set and keep the user's text in the input) and `AssistantConsole` with the Ask tab:
  - Header: tabs `ASK` and `FIT CHECK`, a hint `CTRL+\` · ESC`, and a close button.
  - Ask body: the empty-state line (exact copy in Global Constraints), the suggestion chips from `suggestionsFor(data.assistant, { tab: active, caseStudyId })`, the messages, and a "Based on:" row of source links (each calls `goTo(target.tab, target.anchor)`).
  - Action buttons: `navigate` calls `goTo`. `play` calls `goTo('portfolio', id)` then `playDemo(id)`. `link` is an `<a>` (with `download` for the CV, `target="_blank" rel="noreferrer"` for repos). `email` is `<a href={emailHref(...)}>`. The first action is styled as primary.
  - The input is a textarea (Enter sends, Shift+Enter adds a new line) with a `maxLength` of 500.
  - Detect `caseStudyId` with an IntersectionObserver on `.case-study` elements while `active === 'portfolio'`.
- [ ] **Step 4: Rewrite `AIAssistant.jsx`.** Restyle the launcher (cyan, no gold). Ctrl+` toggles the console from anywhere, and Escape closes it when focus is inside. On open, focus the console input. On close, return focus to the element that opened it. Remove the `ChatPopup` import.
- [ ] **Step 5: Styles in `workspace.css`.**
  - The console is fixed at the bottom with a `12px` inset and a default height of `320px`.
  - On desktop it spans the main content width, with a maximum width of `1180px`, centred.
  - Use the System explorer surfaces, cyan focus rings, no backdrop and a `demo-in` style entrance.
  - With reduced motion, use fades only.
  - At `max-width: 580px`, it's full width with no inset and a height of `60dvh`.
- [ ] **Step 6: Verify** with `npm run lint && npm test && npm run build`, then in a browser (both servers running):
  - The console opens and closes by button, Ctrl+` and Escape.
  - The chips change between tabs and between case studies.
  - "Does he need sponsorship?" returns 2–3 sentences, a "Based on: Profile" tag, and working CV and email buttons.
  - A SuperOps question offers "▶ Play the example run", which navigates and starts the demo.
  - Stopping the backend shows an inline error, and the typed text is kept.
- [ ] **Step 7: Commit** `feat(assistant): bottom console with short sourced answers and actions`

### Task 6: Fit check tab and resizing

**Files:**
- Modify: `src/components/assistant/AssistantConsole.jsx`, `src/workspace.css`
- Create: `src/lib/consoleSize.js`, `src/lib/consoleSize.test.js`

**Interfaces:**
- Consumes: `runFit`, `fit` (Task 5), catalog (Task 1).
- Produces: `clampHeight(px: number, viewportHeight: number) → number` (minimum `220`, maximum `0.8 × viewport`); `fitHeight(viewportHeight) → number` (`0.55 × viewport`, clamped).

- [ ] **Step 1: Write failing tests:** `clampHeight(100, 1000) === 220`, `clampHeight(900, 1000) === 800`, `clampHeight(500, 1000) === 500`, `fitHeight(1000) === 550`, and `fitHeight(300) === 240`.
- [ ] **Step 2: Run** `node --test src/lib/consoleSize.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `consoleSize.js` and the Fit tab:
  - A textarea (`maxLength` 8000) with a live count, the exact note text and a "Check fit" button.
  - The result shows the role title if one was found, then one row per item: a level badge (`STRONG` green `#8fe3a8`, `PARTIAL` amber `#f4c97a`, `NOT SHOWN` red `#ff9d9d`), the requirement, the reason and source links.
  - Below the rows, the actions. The email action's subject is `Role: <role> (from your portfolio)` when a role was found, otherwise `From your portfolio`.
  - The console grows to `fitHeight` when the Fit tab has text or a result.
  - Dragging the top edge (pointer events on a 6px handle, plus ↑/↓ keys when the handle is focused) resizes it via `clampHeight`.
  - On mobile the Fit tab uses `92dvh`.
- [ ] **Step 4: Run** `node --test src/lib/consoleSize.test.js`. Expected: PASS.
- [ ] **Step 5: Verify in the browser** with three job descriptions:
  - An ML/RAG role: expect Strong items linked to DocChat or Experience.
  - A role needing Kubernetes and Java: expect those as Not shown, not stretched to fit.
  - A role requiring "UK right to work": expect Strong.
  - Also check that pasting 9,000 characters is cut off at 8,000, and that resizing works with mouse and keyboard.
- [ ] **Step 6: Commit** `feat(assistant): fit check tab with honest per-requirement results`

### Task 7: "Ask about this" buttons

**Files:**
- Modify: `src/sections/Portfolio.jsx`, `src/sections/Resume.jsx`, `src/workspace.css`

**Interfaces:**
- Consumes: `askAssistant` (Task 4); `data.assistant.askAbout[id]` (Task 2).

- [ ] **Step 1: Add the buttons.** Put a small button labelled "Ask about this ↗" in each case study heading and each experience entry, but only when `askAbout[id]` exists. Clicking it calls `askAssistant(askAbout[id])`. Give it the accessible name `Ask the assistant about <label>`.
- [ ] **Step 2: Verify in the browser.** Clicking the button on SuperOps opens the console on the Ask tab, the question appears and gets an answer, and focus moves into the console. Repeat for "Senior Software Engineer · Mphasis".
- [ ] **Step 3: Commit** `feat(assistant): ask-about-this buttons on case studies and experience`

### Task 8: Final checks and docs

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md.** Describe `/api/assistant` (modes, limits, catalog ids), `src/components/assistant/`, the shared `src/lib/assistant*.js` modules and the `assistant` data block. Note that `/api/chat` remains but the UI uses `/api/assistant`, that Railway was removed, and that `server/index.js` mounts the `api/` handlers.
- [ ] **Step 2: Run the full checks:** `npm run lint && npm test && npm run build`. Expected: all pass, with 69 existing tests plus the new ones.
- [ ] **Step 3: Check the whole site in a browser** at desktop and 390px width:
  - Every item in the spec's "Verification expected" section.
  - No horizontal overflow, and the System explorer and case study demos still work.
- [ ] **Step 4: Commit** `docs: describe the assistant console`
