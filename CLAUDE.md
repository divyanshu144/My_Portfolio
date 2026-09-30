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
- **`App.jsx`**: root; renders `Sidebar` plus five tabs (About, Experience, Portfolio, Blog, Contact), with a floating `AIAssistant` overlay
- **`sections/`**: the sidebar and tab pages (Sidebar, About, Experience, Portfolio, Blog, Contact)
- **`components/AIAssistant.jsx`**: thin composer of the walking avatar and the chat popup
- **`components/avatar/`**: the walking-avatar assistant. `avatarMachine.js` (pure state machine), `motion.js` (pure geometry; `riderBounds` keeps the bike `FLAG_W` (52px) clear of each screen edge), `facts.js` (fact picker), `sound.js` (bicycle bell), `useAvatarRoam.js` (timers and rAF movement), `AvatarFigure.jsx` (SVG art), `WalkingAvatar.jsx`, `ChatPopup.jsx` (`useChat` + popup). Facts he says come from `avatarFacts` in `data/portfolioData.json`. The small "Ask me / anything" flag on the bike is an HTML button (`.wa-flag` in `WalkingAvatar.jsx`), shown only while riding or parked; clicking it opens the chat like clicking him. A short synthesized bicycle bell rings while he sits down on the bike and stops when he starts riding; it only plays after the visitor has interacted with the page (browser autoplay rules), so the first-load intro is silent.
- **`constants/index.js`**: `SUBSTACK_URL` and `skillGroups`
- **`vcard.css`** and **`index.css`**: styling (see Styling below)

### Backend
- `server/index.js`: Express dev server (AI routes below plus the blog route mounted from `api/`).
- `api/*.js`: Vercel serverless functions used in production: `chat`, `explain`, `health`, plus:
  - `GET /api/blog`: Substack posts (RSS parsed in `api/_lib/substack.js`, `SUBSTACK_URL`, default `https://div1761180.substack.com`). Cached in memory for ~30 min, and serves stale data if Substack is down.

The AI routes are `POST /api/chat` (used by the chat popup) and `POST /api/explain` (still served, but the UI no longer uses it), served through an OpenAI-compatible client. The provider is picked by whichever key is set (`XAI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`); `MODEL` overrides the model (Groq default: `openai/gpt-oss-120b`). The server loads `data/portfolioData.json` at startup and injects it as system context. Vite proxies all `/api/*` requests to `http://localhost:8787` during dev.

### Key data files
- `data/portfolioData.json`: single source of truth for bio (`summary`), skills, education, experience and the project list. Also injected into the AI context. Project cards render only what is in this file, in this order. `repo` (card link) and `demo` (Live demo link) are optional per project; a project without `repo` is not clickable. `_todo` fields are notes for the owner and are never rendered or sent to the AI.
- `src/constants/index.js`: only `SUBSTACK_URL` and `skillGroups` (display names for skill groups).

### Styling
- `src/vcard.css` is a verbatim copy of the vCard template's stylesheet; do not edit it. Additions and the AI assistant styles live in `src/index.css`.
- The UI is the vCard layout: `Sidebar` plus five tabs (About, Experience, Portfolio, Blog, Contact) registered in `src/App.jsx`.

### Contact form
Uses EmailJS (`@emailjs/browser`) with IDs hardcoded in `src/sections/Contact.jsx`; validation in `src/lib/validateContact.js`.

### Tests
`npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`) the contact-form validator (`src/lib/*.test.js`) and the avatar logic (`src/components/avatar/*.test.js`).
