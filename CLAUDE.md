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

**Backend (Express AI server):**
```bash
npm run server    # start Express server (http://localhost:8787)
```

For full local development, both processes must run concurrently: `npm run dev` and `npm run server`.

The backend requires an `.env` file at the project root:
```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini   # optional, this is the default
```

## Architecture

This is a single-page portfolio site with a separate Express backend for AI features.

### Frontend (`src/`)
- **`App.jsx`**: root; the "workspace" shell: a top header (brand, numbered tab nav, GitHub link), a path bar, five tabs (Overview, Projects, Experience, Notes, Contact; internal ids `about`, `portfolio`, `resume`, `blog`, `contact`) and a footer with LinkedIn, email and CV links. Switching tabs moves focus to the page's `h1`. Each page receives `onNavigate(id)` to switch tabs.
- **`sections/`**: the tab pages (About, Portfolio, Resume, Blog, Contact). `Sidebar.jsx` is no longer rendered (kept for reference).
- **`components/SystemMap.jsx`**: the interactive "System explorer" on the Overview: pick a project that has a `caseStudy`, then a workflow stage, to show that stage's `workflowDetails` text.
- **`components/AIAssistant.jsx`**: a fixed "Ask AI" launcher button that opens `ChatPopup` (chat state comes from `useChat`, so it survives closing and reopening). The popup is a modal dialog that traps Tab focus and closes on Escape.
- **`components/avatar/`**: the earlier walking-avatar assistant. Only `ChatPopup.jsx` (`useChat` + popup) is used now; the rest (`avatarMachine.js`, `motion.js`, `facts.js`, `sound.js`, `useAvatarRoam.js`, `AvatarFigure.jsx`, `WalkingAvatar.jsx`) is kept intact and still unit-tested, but not rendered.
- **`constants/index.js`**: `SUBSTACK_URL` and `skillGroups`
- **`vcard.css`**, **`index.css`** and **`workspace.css`**: styling (see Styling below)

### Backend
- `server/index.js`: Express dev server (AI routes below plus the blog route mounted from `api/`).
- `api/*.js`: Vercel serverless functions used in production: `chat`, `explain`, `health`, plus:
  - `GET /api/blog`: Substack posts (RSS parsed in `api/_lib/substack.js`, `SUBSTACK_URL`, default `https://div1761180.substack.com`). Cached in memory for ~30 min, and serves stale data if Substack is down.

The AI routes are `POST /api/chat` (used by the chat popup) and `POST /api/explain` (still served, but the UI no longer uses it), served through an OpenAI-compatible client. The provider is picked by whichever key is set (`XAI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`); `MODEL` overrides the model (Groq default: `openai/gpt-oss-120b`). The server loads `data/portfolioData.json` at startup and injects it as system context. Vite proxies all `/api/*` requests to `http://localhost:8787` during dev.

### Key data files
- `data/portfolioData.json`: single source of truth for bio (`summary`), skills, education, experience and the project list. Also injected into the AI context. Project cards render only what is in this file, in this order. `repo` (card link) and `demo` (Live demo link) are optional per project; a project without `repo` is not clickable. `_todo` fields are notes for the owner and are never rendered or sent to the AI.
  - `cv`: path of the downloadable CV (`public/assets/Divyanshu-Charak-CV.pdf`), used by the Overview and footer. Regenerate it from the JSON with `python3 scripts/generate-cv.py` (needs `reportlab`).
  - Featured projects carry a `caseStudy` (problem, contribution, tradeoff, outcome, limitations, `workflow` stages with matching `workflowDetails`, and `evidence` source links). These render as expandable case studies on Projects and feed the System explorer. Other projects stay compact; optional `image` and `evidenceUrl` fields add a screenshot and a "Benchmark method" link.
  - Metrics must be backed by evidence; the sanitized write-up lives in `public/evidence/project-notes.html`. Do not publish raw evaluation data.
- `src/constants/index.js`: only `SUBSTACK_URL` and `skillGroups` (display names for skill groups).

### Styling
- `src/vcard.css` is a verbatim copy of the vCard template's stylesheet; do not edit it. The original template lives in `vcard-personal-portfolio/` for reference (local only, gitignored).
- `src/index.css` holds additions on top of vCard (case studies, chat popup, etc.).
- `src/workspace.css` is imported last and defines the current look: a restrained sci-fi workspace (near-black surfaces, cool accents, larger type, top nav, System explorer, Ask AI launcher). Motion respects `prefers-reduced-motion`.

### Contact form
Uses EmailJS (`@emailjs/browser`) with IDs hardcoded in `src/sections/Contact.jsx`; validation in `src/lib/validateContact.js`.

### Tests
`npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`) the contact-form validator (`src/lib/*.test.js`) and the avatar logic (`src/components/avatar/*.test.js`).
