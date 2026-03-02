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
- **`App.jsx`** — root, composes all sections in order: Navbar → Hero → About → Projects → Experience → Contact → Footer, with a floating `AIAssistant` overlay
- **`sections/`** — full-page sections (Hero, About, Projects, Experience, Contact, Footer, Navbar)
- **`components/`** — reusable pieces; many are Three.js/R3F 3D models (HackerRoom, Developer, Cube, ReactLogo, Rings, Target, DemoComputer) rendered inside R3F `<Canvas>` elements in the sections
- **`constants/index.js`** — all static data shown in the UI: nav links, project list (`myProjects`), work experience (`workExperiences`), and the `calculateSizes` responsive helper
- **`index.css`** — all custom CSS including `.ai-*` utility classes for the AI Assistant modal

### Backend (`server/index.js`)
Express server with four API routes, all backed by the OpenAI Responses API:
- `POST /api/chat` — general portfolio Q&A
- `POST /api/resume` — tailored resume + cover letter generation
- `POST /api/explain` — GitHub repo explainer (fetches README via GitHub API)
- `POST /api/coach` — interview coaching questions and answer outlines

The server loads `data/portfolioData.json` at startup and injects it as system context into every OpenAI request. Vite proxies all `/api/*` requests to `http://localhost:8787` during dev.

### Key data files
- **`data/portfolioData.json`** — single source of truth for Divyanshu's bio, skills, experience, education, and projects used by the backend AI context
- **`src/constants/index.js`** — separate static data for the frontend UI (project cards, experience timeline); must be kept in sync with `portfolioData.json` when content changes

### 3D rendering
Three.js scenes use `@react-three/fiber` and `@react-three/drei`. Models are `.glb` files served from `public/`. The `CanvasLoader` component handles R3F loading state. `HeroCamera` wraps camera with GSAP-driven scroll animation.

### Styling
Tailwind CSS with a custom dark-mode palette (see `tailwind.config.js`). Custom font: `General Sans`. Animations use GSAP (`gsap` + `@gsap/react`). The `react-responsive` hook drives breakpoint logic via `calculateSizes`.

### Contact form
Uses EmailJS (`@emailjs/browser`) — credentials are referenced via environment variable or hardcoded IDs in the Contact section.
