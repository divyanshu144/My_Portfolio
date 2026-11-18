# Portfolio assistant: workspace console (design)

Date: 2026-11-18. Status: agreed with the owner in conversation; written for a builder who will not be able to ask questions.

## Intent

The "Ask AI" assistant on the portfolio currently looks bolted on: a 300px gold-themed popup over a blurred page, giving long chat-style answers. Its real audience is recruiters and hiring managers who want a quick fact (visa, availability, stack fit, what was built) and then want to get to the right part of the site.

The redesign turns it into a **guide that feels like part of the workspace**: short answers, each with buttons that take the visitor somewhere on the site, sources shown for every answer, and a job-description "fit check". Success means a recruiter gets an answer in a sentence or two and is one click from the evidence, CV or email.

## Goals

1. A bottom **console** in the workspace's visual language (near-black surfaces, cyan accents, monospace labels; same family as the System explorer in `src/components/explorer/`).
2. **Short answers plus action buttons** that navigate the site, instead of long prose.
3. **Page-aware suggested questions** that change with the current tab and case study.
4. **"Ask about this" buttons** on each case study and each Experience entry that open the console with a question already asked.
5. **A "Based on: …" source tag** under every answer, linking to the source on the site.
6. **Fit check:** a recruiter pastes a job description and gets an honest, per-requirement assessment with evidence links.

## Non-goals

- No change to the avatar modules in `src/components/avatar/` beyond what the chat needs (they stay in the repo, unrendered, and their tests stay green).
- No user accounts, saved history across visits, analytics, or email sending from the server. Email is always a `mailto:` link the visitor sends themselves.
- No new AI provider. Keep the existing OpenAI-compatible client in `api/_lib/context.js` (provider picked by `XAI_API_KEY` / `GROQ_API_KEY` / `OPENAI_API_KEY`; production uses Groq `openai/gpt-oss-120b`).
- Streaming responses are not required (could come later).

## Anti-goals (would be failures even if it "works")

- **Inventing anything.** The AI must never produce a link, source, project, metric or skill that is not in `data/portfolioData.json`. A fabricated "fit" claim on a recruiter-facing page is the worst outcome.
- **Overstating fit.** The fit check must list gaps plainly ("not shown"); it must not stretch evidence to cover a requirement.
- **Long answers.** Replies longer than about three sentences defeat the purpose.
- **Covering or blocking the page.** No full-page blur or modal lock; the page stays readable and usable above the console.
- **The old gold theme** anywhere in the assistant.

## Constraints

- React 19 + Vite frontend; Express dev server (`server/index.js`) and Vercel serverless functions (`api/*.js`) in production. Vite proxies `/api/*` to `:8787` in dev.
- Today the chat logic is **duplicated**: `api/chat.js` (production, context from `api/_lib/context.js`) and `server/index.js` (dev, its own context plus fetched GitHub READMEs). The blog route already shows the pattern to follow: the dev server mounts the `api/` handler. Both new endpoints must behave the same in dev and production.
- `api/_lib/context.js` currently builds context from summary, skills, experience, education and project summaries/highlights, but **not** the `caseStudy` fields. The new answers need them (sources and evidence come from case studies).
- `src/vcard.css` must not be edited. New styles go in `src/workspace.css` (the chat's old styles live in `src/index.css`; remove or override what is no longer used).
- Tests use `node:test` (`npm test`); keep logic that can be tested pure and test it there. Existing: 69 tests.
- Accessibility: keyboard operable, visible focus, works with screen readers, respects `prefers-reduced-motion` (motion becomes fades), as elsewhere on the site.
- The public `/api/*` endpoints are unauthenticated and cost money per call: inputs must be size-limited.

## What was decided (by the owner)

### Layout: bottom console with tabs (mockup "C1")
- A console docked along the bottom of the viewport, inset slightly from the edges, with a header row holding two tabs, **Ask** and **Fit check**, plus a close control.
- **Short by default** (enough for an answer and its buttons). It **grows to about half the viewport** when the Fit check tab has a pasted job description or results. The visitor can **drag the top edge to resize**.
- The page above remains visible and usable; no backdrop blur.
- The existing bottom-right **"Ask AI" launcher** stays, restyled to match, and toggles the console.

### Ask tab
- **Suggested questions:** 2–3 chips that depend on where the visitor is (current tab; on Projects, the case study in view). Clicking one asks it.
- **Answers:** 2–3 sentences, plain text.
- **"Based on: …"** under each answer: one or more source tags, each a link that takes the visitor to that place on the site.
- **Action buttons:** 1–3 per answer. The available actions are: switch to a tab; scroll to a specific case study; play that case study's example run; download the CV; open a project repository; email Divyanshu (`mailto:` with a sensible subject).
- The AI may only pick actions and sources **from a fixed list derived from `portfolioData.json`** (see "Allowed actions and sources"). Anything else it returns is dropped.

### Fit check tab
- A text area to paste a job description, and a button to run the check.
- Result: a short list of the role's key requirements, each marked **Strong**, **Partial** or **Not shown**, each with a one-line reason and links to the evidence (sources from the same fixed list). Gaps are shown plainly.
- Ends with actions: **Download CV**, **Email about this role** (`mailto:` pre-filled with the role title if one was found, otherwise a generic subject), and the most relevant case study.

### "Ask about this"
- A small button on **each featured case study** and **each Experience entry**. It opens the console on the Ask tab and asks a pre-written question about that item (for example "What did he build in SuperOps, and why does it matter?"). The questions live in the data, not generated.

### Behaviour
- **Keyboard:** Ctrl+` toggles the console (like an editor terminal); Escape closes it; focus moves into the console on open and returns to the opener on close. The console is **not** a modal: no focus trap, the page stays interactive.
- **Conversation** persists while the page is open (closing and reopening keeps it), as today.
- **Phones:** the console becomes a full-width bottom sheet; it grows almost to full height for the fit check.
- **Look:** near-black surfaces, cyan accents, monospace labels, matching the System explorer. Remove all gold from the assistant.

## Allowed actions and sources

Both are built from `portfolioData.json` at startup, so they stay in step with the site:

- **Sources / navigation targets:** Profile (summary, location, visa and availability facts), each Experience entry, Education, each featured case study (JobFit, DocChat, SuperOps), each other project, Notes. Each has a stable id and knows how to navigate there (tab, plus the element to scroll to).
- **Actions:** `open:<target id>`, `play:<case study id>` (only featured projects), `cv` (only if `cv` is set), `repo:<project>` (only if that project has `repo`), `email`.
- The AI receives the list of ids with short labels and returns ids only; the frontend maps ids to labels, URLs and behaviour. Unknown ids are discarded. If nothing valid remains, the answer shows with no buttons rather than failing.

## Data the owner must supply (the builder adds placeholders and flags them)

- Page-aware suggested questions per tab and per featured case study (the builder writes a sensible first draft into `portfolioData.json`; the owner will review).
- "Ask about this" questions per case study and per Experience entry (same: drafted by the builder, reviewed by the owner).

## What is left to the builder

- API shape: whether Ask and Fit check are one endpoint with a mode or two endpoints, and the exact request/response JSON. Responses must be structured (answer text, source ids, action ids; for fit check, a list of requirement items) and validated server-side.
- How structured output is obtained from the model (JSON instructions plus parsing and a safe fallback when the model returns malformed output).
- Prompt wording, provided it enforces: answers of 2–3 sentences; only facts from the portfolio context; only allowed ids; fit check marks anything not evidenced as "Not shown".
- How to include `caseStudy` content in the AI context, and whether to unify the dev server onto the `api/` handlers (recommended).
- Input limits (suggested: question about 500 characters, job description about 8,000 characters, history capped to the last few turns) and how the `history` the client sends is sanitised (only `user`/`assistant` roles, length-capped).
- Exact dimensions, resize limits, animation and the restyled launcher, within the look described above.
- How "the case study in view" is detected for suggestions (for example an IntersectionObserver), and scroll/highlight behaviour when an action lands on a case study.
- Test coverage: at least the pure parts (allowed-id building and filtering, response validation and fallback, suggestion selection, `mailto:` construction).

## Calls made while writing this (not discussed with the owner; flagged for review)

- **Profile source** navigates to the Overview tab. Visa and availability facts come from `visa` in `portfolioData.json` (status, details, right to work) and the availability line in `baseSystem`.
- **"Play the example run"** switches to Projects, scrolls to that case study and starts its demo (which otherwise waits for the visitor's Play click).
- **Fit check note:** a one-line note under the text area says the description is sent to the AI to compare against the portfolio and is not stored. Nothing is stored server-side.
- **Abuse and cost:** size limits only (no per-visitor rate limiting), as serverless instances do not share memory. Revisit if usage grows.
- **Replaces the old popup:** the new console replaces `ChatPopup`'s rendering in `AIAssistant.jsx`. Conversation state handling can be reused or rewritten; the old popup styles in `src/index.css` that become unused are removed.
- **Opening message:** instead of a greeting bubble, the empty Ask tab shows one line ("Ask about my projects, experience or fit for a role") and the page-aware suggestions.
- **"Ask about this"** covers featured case studies and Experience entries only (not Education or other projects).

## Verification expected

- `npm run lint`, `npm test`, `npm run build` pass.
- In a browser, desktop and phone width: open/close by button, Ctrl+` and Escape; suggestions change with tab and case study; an answer shows 2–3 sentences, a source tag and working buttons for each action type; a pasted job description produces Strong/Partial/Not shown items with links and the console grows; "Ask about this" opens with the question asked; no horizontal overflow; reduced motion uses fades.
- A deliberately mismatched job description (for example a role needing skills not in the portfolio) returns those requirements as "Not shown" rather than stretching evidence.
