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
- **`App.jsx`**: root; renders `Sidebar` plus five tabs (About, Resume, Portfolio, Blog, Contact), with a floating `AIAssistant` overlay
- **`sections/`**: the sidebar and tab pages (Sidebar, About, Resume, Portfolio, Blog, Contact)
- **`components/`**: `AIAssistant.jsx` (chat/resume/explain/coach modal)
- **`constants/index.js`**: `SUBSTACK_URL` and `skillGroups`
- **`vcard.css`** and **`index.css`**: styling (see Styling below)

### Backend
- `server/index.js`: Express dev server (AI routes below plus the two read-only routes mounted from `api/`).
- `api/*.js`: Vercel serverless functions used in production: `chat`, `resume`, `explain`, `coach`, `health`, plus:
  - `GET /api/blog`: Substack posts (RSS parsed in `api/_lib/substack.js`, `SUBSTACK_URL`, default `https://div1761180.substack.com`).
  - `GET /api/projects`: `portfolioData.projects` enriched with live GitHub metadata (`api/_lib/github.js`, optional `GITHUB_TOKEN`).
- Both read-only routes cache in memory for ~30 min and serve stale data if upstream fails.

The AI routes are backed by the OpenAI Responses API (`POST /api/chat`, `/api/resume`, `/api/explain`, `/api/coach`). The server loads `data/portfolioData.json` at startup and injects it as system context. Vite proxies all `/api/*` requests to `http://localhost:8787` during dev.

### Key data files
- `data/portfolioData.json`: single source of truth for bio, skills, education, experience and the project list (each project's `repo` URL drives the GitHub enrichment). Also injected into the AI context.
- `src/constants/index.js`: only `SUBSTACK_URL` and `skillGroups` (display names/icons for skill groups).

### Styling
- `src/vcard.css` is a verbatim copy of the vCard template's stylesheet; do not edit it. Additions and the AI assistant styles live in `src/index.css`.
- The UI is the vCard layout: `Sidebar` plus five tabs (About, Resume, Portfolio, Blog, Contact) registered in `src/App.jsx`.

### Contact form
Uses EmailJS (`@emailjs/browser`) with IDs hardcoded in `src/sections/Contact.jsx`; validation in `src/lib/validateContact.js`.

### Tests
`npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`) and pure UI helpers (`src/lib/*.test.js`).
