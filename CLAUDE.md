# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Frontend (Vite + React):**
```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build
npm run lint      # ESLint
```

**Backend (Express dev server, dev only):**
```bash
npm run server    # start Express server (http://localhost:8787)
```

For full local development, both processes must run concurrently: `npm run dev` and `npm run server`.

The backend requires an `.env` file at the project root with one provider key (`XAI_API_KEY`, `GROQ_API_KEY` or `OPENAI_API_KEY`; see `.env.example`); `MODEL` optionally overrides the model.

## Architecture

This is a single-page portfolio site. Production is Vercel only (static build plus the `api/` serverless functions); the Express server is for local development.

### Frontend (`src/`)
- **`App.jsx`**: root; the "workspace" shell: a top header (brand, numbered tab nav, GitHub link), a path bar, five tabs (Overview, Projects, Experience, Notes, Contact; internal ids `about`, `portfolio`, `resume`, `blog`, `contact`) and a footer with LinkedIn, email and CV links. Switching tabs moves focus to the page's `h1`. Each page receives `onNavigate(id)` to switch tabs.
- **`sections/`**: the tab pages (About, Portfolio, Resume, Blog, Contact). `Sidebar.jsx` is no longer rendered (kept for reference).
- **`components/explorer/`**: the self-playing project demos. `DemoPlayer.jsx` renders one: what a user of the project sees (left), the four `caseStudy.workflow` stages (right), a progress bar and the stage's `workflowDetails`; the `deep` variant adds a trace panel. A run is a list of beats (each tied to a stage, and may revisit one, e.g. a retry); `playback.js` holds the pure logic (advance, jumps, `stageView`). Clicking a project or stage jumps there; hover, keyboard focus or the pause button stop it; with reduced motion it still plays, using fades only. All demo values are made-up and labelled "EXAMPLE DATA", but stage, agent, tool and field names must match the real repos (DocChat, Job_Agent, supermarket-ops-agent).
  - `demoScripts.js`: short runs for the Overview's `SystemMap.jsx` ("System explorer"), which cycles DocChat, JobFit, SuperOps.
  - `deepScripts.js`: longer runs shown in each Projects case study (they replace the old static workflow list), each including one real failure and its recovery. These wait for the visitor to press "Play example run", stop at the end with a "Replay" button, and pause if scrolled off screen.
- **`components/AIAssistant.jsx`**: owns the assistant console's open state and the "Ask AI" launcher button (hidden while the console is open). The console is non-modal (no focus trap): Ctrl+` toggles it from anywhere, Escape closes it, and focus returns to whatever opened it. It also listens for the `assistant:ask` event (see below), and conversation and fit-check state (`useAssistant`) live here so they survive closing and reopening.
- **`components/assistant/`**: `AssistantConsole.jsx` is the bottom console, a resizable panel (drag handle, or ArrowUp/ArrowDown on it) with two tabs. **Ask**: suggested question chips that follow the current tab and the case study in view (`useCaseStudyInView`), then short answers, each with source tags and action buttons; its empty line is "Ask about my projects, experience or fit for a role". **Fit check**: paste a job description (up to 8000 chars) and get Strong / Partial / Not shown items with links; the console grows to fit, and the note "Your description is sent to the AI to compare against this portfolio. It isn't stored." is shown. `useAssistant.js` holds the chat and fit state and the `useCaseStudyInView` hook. The page keeps its end clear of a taller console through the `--console-reserve` CSS variable. Styles are in `workspace.css`: near-black surfaces, cyan accent, no gold or page blur; under `prefers-reduced-motion` the console uses fades only.
- **"Ask about this"**: buttons on each case study (`sections/Portfolio.jsx`) and experience entry (`sections/Resume.jsx`) send the question from `assistant.askAbout[id]` through the `assistant:ask` event. The console opens on Ask, focuses its input and asks it. A case study's "Play example run" button is separate: the assistant's `play:` action fires the `demo:play` event to start that case study's demo.
- **`lib/assistant*.js`** and **`lib/consoleSize.js`**: plain JavaScript shared by the browser and the API, each with a `*.test.js`. `assistantCatalog.js` builds the catalog of ids the assistant may point at from `portfolioData.json`: targets (`profile`, each experience id, `education`, each project id, `notes`) and actions (`open:<target>`, `play:<project>` for projects with a `caseStudy`, `repo:<project>` for projects with a `repo`, `cv` when the data has a `cv`, and `email`, a mailto with subject "From your portfolio"); `pickAllowed` drops unknown ids, so an answer with no valid ids still renders. `assistantSuggestions.js` (`suggestionsFor`) returns up to three questions for a tab or case study, reading only the five tab keys and `caseStudies` (never `_todo`). `assistantEvents.js` is the small event bus (`assistant:ask`, `demo:play`). `assistantClient.js` posts to `/api/assistant` and always resolves to `{ ok, data | error }`, even for a network failure or an HTML proxy error page. `consoleSize.js` holds the height rules (minimum 220px, at most 80% of the viewport, 55% for a fit check).
- **`components/avatar/`**: the earlier walking-avatar assistant. All of it, including `ChatPopup.jsx` (`useChat` + popup), is kept intact and still unit-tested, but none of it is rendered any more (`ChatPopup.jsx` is no longer used by `AIAssistant.jsx`). The old chat-popup styles were removed, so `ChatPopup.jsx` would render unstyled if re-enabled.
- **`constants/index.js`**: `SUBSTACK_URL` and `skillGroups`
- **`vcard.css`**, **`index.css`** and **`workspace.css`**: styling (see Styling below)

### Backend
- `server/index.js`: dev-only Express server. It mounts the same `api/` handlers that Vercel runs (`blog`, `chat`, `assistant`) and serves `health`, `explain` and `refresh` inline; it is not used in production (Railway was removed, there is no `railway.toml`).
- `api/*.js`: Vercel serverless functions used in production: `chat`, `explain`, `health`, `assistant`, plus:
  - `GET /api/blog`: Substack posts (RSS parsed in `api/_lib/substack.js`, `SUBSTACK_URL`, default `https://div1761180.substack.com`). Cached in memory for ~30 min, and serves stale data if Substack is down.
- `api/_lib/portfolioContext.js`: side-effect-free module that builds the system prompt (`baseSystem`) and the portfolio context from `data/portfolioData.json` (including `availability`, and `[id: ...]` tags on experience and projects). `api/_lib/context.js` re-exports it and owns the OpenAI-compatible client (`ai`, `model`); importing `context.js` creates the client, so code that only needs the prompt text (and tests) import `portfolioContext.js`.

**`POST /api/assistant`** (`api/assistant.js` is a thin wrapper; the logic is `makeAssistantHandler` in `api/_lib/assistant.js`, which takes the completion function so tests can fake the model). The UI uses this route.
- Body `{ mode: 'ask', message, history?, page? }`: `message` is required and at most 500 chars, `history` is the last 6 messages (roles `user`/`assistant` only, each cut to 1500 chars), `page` is `{ tab, caseStudyId }` and is only a hint about what the visitor is looking at. Returns `{ mode: 'ask', text, sources, actions }`: 2-3 plain-text sentences (markdown is stripped, cut at 600 chars), 1-3 `sources` (target ids) and 1-3 `actions` (action ids).
- Body `{ mode: 'fit', jobDescription }`: at most 8000 chars. Returns `{ mode: 'fit', role, items, actions }` with up to 10 items `{ requirement, level: 'strong' | 'partial' | 'not_shown', reason, sources }`. Anything not evidenced in the portfolio is `not_shown`; UK right to work is `strong`; sponsorship beyond 2028 or permanent residency is `partial`, stating 2028. `actions` always offers `cv` and `email` (`cv` is dropped when the data has no CV) plus at most one `open:`/`play:` id from the model.
- Errors: 405 for non-POST, 400 for a missing or unknown `mode` or an empty field, 413 over a limit, 502 when a fit reply is not parseable, 500 for model failures. Ids are chosen only from the catalog (`src/lib/assistantCatalog.js`, imported by the api code), and the model's reply must be JSON that the handler re-validates; nothing the model says is trusted as a link.

`POST /api/chat` and `POST /api/explain` are still served but the UI no longer uses them. All AI routes go through an OpenAI-compatible client. The provider is picked by whichever key is set (`XAI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`); `MODEL` overrides the model (Groq default: `openai/gpt-oss-120b`). `data/portfolioData.json` is injected as system context. Vite proxies all `/api/*` requests to `http://localhost:8787` during dev.

### Key data files
- `data/portfolioData.json`: single source of truth for bio (`summary`), skills, education, experience and the project list. Also injected into the AI context. Project cards render only what is in this file, in this order. `repo` (card link) and `demo` (Live demo link) are optional per project; a project without `repo` is not clickable. `_todo` fields are notes for the owner and are never rendered or sent to the AI. Experience entries and projects have an `id`, which the assistant catalog and "Ask about this" use.
  - `availability`: one line ("Available immediately."), shown to the AI and used for fit checks.
  - `assistant`: `suggestions` (questions for each tab key `about`/`portfolio`/`resume`/`blog`/`contact`, and per case study under `caseStudies`, 1-3 each) and `askAbout` (the question each "Ask about this" button sends, keyed by case-study or experience id). It carries a `_todo` marker (ignored by the suggestion code): the questions are drafts for the owner to review and rewrite.
  - `cv`: path of the downloadable CV (`public/assets/Divyanshu-Charak-CV.pdf`), used by the Overview and footer. Regenerate it from the JSON with `python3 scripts/generate-cv.py` (needs `reportlab`).
  - Featured projects carry a `caseStudy` (problem, contribution, tradeoff, outcome, limitations, `workflow` stages with matching `workflowDetails`, and `evidence` source links). These render as expandable case studies on Projects and feed the System explorer. Other projects stay compact; optional `image` and `evidenceUrl` fields add a screenshot and a "Benchmark method" link.
  - Metrics must be backed by evidence; the sanitized write-up lives in `public/evidence/project-notes.html`. Do not publish raw evaluation data.
- `src/constants/index.js`: only `SUBSTACK_URL` and `skillGroups` (display names for skill groups).

### Styling
- `src/vcard.css` is a verbatim copy of the vCard template's stylesheet; do not edit it. The original template lives in `vcard-personal-portfolio/` for reference (local only, gitignored).
- `src/index.css` holds additions on top of vCard (About, case studies and workflow, chips, portfolio cards, blog/contact, and the unrendered walking-avatar art).
- `src/workspace.css` is imported last and defines the current look: a restrained sci-fi workspace (near-black surfaces, cool accents, larger type, top nav, System explorer, Ask AI launcher and assistant console). Motion respects `prefers-reduced-motion`.

### Contact form
Uses EmailJS (`@emailjs/browser`) with IDs hardcoded in `src/sections/Contact.jsx`; validation in `src/lib/validateContact.js`.

### Tests
`npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`, including `assistant.test.js` for the `/api/assistant` parsing, limits and handler), `src/lib/*.test.js` (the contact-form validator and the assistant modules: catalog, suggestions, events, client, console size), the avatar logic (`src/components/avatar/*.test.js`) and the explorer playback (`src/components/explorer/*.test.js`, which also checks each demo script matches its case study's step count).
