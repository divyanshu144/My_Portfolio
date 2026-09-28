# vCard Redesign — Design

Date: 2026-09-28
Branch: `vcard-redesign`

## Goal

Port the visual design and layout of the open-source vCard template (`vcard-personal-portfolio/`, kept as a reference clone) into the existing React + Vite portfolio, populated with Divyanshu's real content. The AI assistant is kept; the 3D scenes are removed. A new Blog tab lists posts from Divyanshu's Substack.

## Decisions (agreed)

| Topic | Decision |
|---|---|
| Approach | Port vCard's CSS near-verbatim into React components (not a Tailwind rewrite, not a reskin) |
| Look | Exact vCard: dark palette, gold accent `hsl(45, 100%, 72%)`, Poppins. The sky-blue accent from the previous UI polish is dropped |
| Tabs | About, Resume, Portfolio, Blog, Contact |
| Blog source | Substack RSS via `GET /api/blog` |
| Substack | `https://div1761180.substack.com` (feed at `/feed`, verified HTTP 200 during design), configured through `SUBSTACK_URL` |
| Hosting | Frontend + `api/*.js` Vercel functions. `server/index.js` remains the local-dev equivalent |
| AI assistant | Logic unchanged; only `.ai-*` CSS restyled to the vCard palette |
| Projects source | Curated list of repos (`projects[].repo` in `portfolioData.json`) enriched with live GitHub metadata via `GET /api/projects`. No category filter |
| Skills display | Tag chips, not progress bars (data has no proficiency values) |
| "What I'm doing" | Cards built from skill groups |
| Testimonials, clients, map | Removed |

## Structure

- `src/App.jsx`: holds `activeTab` state. Renders `Sidebar`, a `<main>` with the tab bar and the active page, and the floating `AIAssistant`.
- `src/sections/`: `Sidebar`, `About`, `Resume`, `Portfolio`, `Blog`, `Contact`. Old `Hero`, `Experience`, `Footer`, `Navbar` are deleted.
- `src/index.css`: vCard's stylesheet (custom properties, layout, components) plus restyled `.ai-*` rules. vCard's CSS is authoritative for layout, so Tailwind is removed to avoid reset conflicts.
- Tab switching is React state, replacing vCard's DOM toggling in `script.js`. Sidebar collapse on mobile and the portfolio filter are component state as well.
- Static assets: vCard icons copied to `public/`; personal photo and project images replace the template's.

## Content mapping

Source of truth stays `data/portfolioData.json` (backend AI context) and `src/constants/index.js` (UI). They must be kept in sync, as before.

- **Sidebar:** `name`, `location`, `contact` (email, phone, linkedin, github); title derived from `targetRoles`. No birthday row.
- **About:** `summary` as bio. "What I'm doing" cards, one per group in `skills` (languages, ai_ml, backend_apis, data_etl, devops, ...).
- **Resume:** `education` and `experience` timelines. Skills as chips grouped by `skills` category.
- **Portfolio:** a plain card grid (no filter). Each card merges the hand-written `name`, `summary`, `highlights` and `tech` from `portfolioData.json` with live GitHub data from `/api/projects`: description fallback, stars, primary language, topics, homepage link and last-pushed date. `myProjects` in `constants/index.js` is retired for this tab; `portfolioData.json` becomes the single list. Project images are optional; cards without one show a gold-tinted placeholder with the repo's language.
- **Blog:** posts from `/api/blog`.
- **Contact:** existing EmailJS form and credentials in vCard's form styling, keeping vCard's validity-based submit-button enabling. Map replaced with location text.

## Blog API

- `api/_lib/substack.js`: fetches `${SUBSTACK_URL}/feed`, parses RSS with `fast-xml-parser`, returns `[{ title, date, excerpt, image, url }]`, newest first, capped at 9. Shared by both backends so parsing does not drift.
- `api/blog.js`: Vercel handler, GET only. In-memory cache (~30 min) plus `Cache-Control: s-maxage` so Substack is not hit per request.
- `server/index.js`: `GET /api/blog` using the same helper, for local dev.
- `Blog.jsx`: fetches on mount; loading state; on error or empty feed shows a "Read on Substack" link card instead of an empty tab.
- `SUBSTACK_URL` is set as an env var on Vercel and in the local `.env`.

## Projects API

- `api/_lib/github.js`: for each `projects[].repo` URL, calls `GET https://api.github.com/repos/{owner}/{repo}` and returns `{ stars, language, topics, homepage, pushedAt, htmlUrl }`. Fetches run in parallel. Shared by both backends.
- `api/projects.js` (Vercel) and `GET /api/projects` in `server/index.js` (local dev). Cached in memory ~30 min plus `Cache-Control: s-maxage`.
- Uses the free REST API: 60 requests/hour per IP unauthenticated, 5,000/hour with an optional `GITHUB_TOKEN` env var (sent as a bearer token when present). Pinned repos are GraphQL-only, so the curated list, not pins, decides what appears.
- On per-repo failure (404, rate limit) that project falls back to its static data, so the tab never renders empty. The API returns the merged list, so `Portfolio.jsx` renders one array.
- Repo URLs come only from `portfolioData.json`, never from request input, so there is no SSRF or arbitrary-repo surface.

## AI assistant

`AIAssistant.jsx` and `/api/chat` are untouched. The `.ai-*` rules in `index.css` move to vCard tokens (eerie-black, jet, orange-yellow-crayola, Poppins, vCard border/shadow style). The floating button and modal must be checked at phone width against vCard's mobile layout.

## Cleanup

- Delete 3D components, `public/models`, `public/textures`, and 3D helpers in `constants/index.js` (`calculateSizes`, unused `navLinks`).
- Remove dependencies once unused: `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `@gsap/react`, `leva`, `maath`, `react-globe.gl`, `react-responsive`, plus Tailwind and its PostCSS/config files.
- Add `fast-xml-parser`. Remove the now-unused `myProjects` from `constants/index.js`.

## Error handling

- `/api/projects`: per-repo GitHub failure falls back to static data for that project; the endpoint itself only errors if `portfolioData.json` cannot be read.
- `/api/blog`: upstream failure or malformed XML returns a 502 with a JSON error; the UI falls back to the link card.
- Contact form: unchanged EmailJS success/failure handling.

## Verification

- `npm run build` and `npm run lint` clean; no dangling imports after deletions.
- `npm run dev` + `npm run server`: manually check every tab at desktop and phone width, the AI assistant modal, contact form validation states, the Blog tab and the Portfolio tab with their APIs both working and failing (including GitHub rate-limit fallback).
- Compare against the vCard demo screenshots for spacing and colour.
- No test suite exists in the repo; add a single unit test for the RSS parser only if requested.

## Out of scope

Project category filter, dark/light toggle, testimonials, clients, a real map, re-adding Resume/Coach AI tabs, any changes to the OpenAI routes.
