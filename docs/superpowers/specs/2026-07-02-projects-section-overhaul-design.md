# Projects Section Overhaul — Design Spec
**Date:** 2026-07-02
**Status:** Approved
**Scope:** Replace 3D CRT computer with a procedural modern laptop, rewrite all project data (content + tags), switch tech tags from icon images to text chips.

---

## Goals

1. Replace the retro CRT `DemoComputer` with a clean procedural R3F laptop (`ProjectDevice`)
2. Update `myProjects` data: add JobFit Agent, rewrite DocChat + PromptOps entries, keep EPC
3. Switch tech tags from mismatched image icons to accurate sky-blue text chips
4. Remove dead fields (`texture`, `spotlight`) from project data

## Non-Goals

- Changing the overall carousel/navigation structure (prev/next arrows stay)
- Modifying any other section
- Sourcing or adding icon/logo image assets
- Deleting old `.mp4` files from `public/textures/project/` (flagged for manual cleanup, not auto-deleted)

---

## Section 1 — Project Data (`src/constants/index.js`)

Order: **01 JobFit → 02 DocChat → 03 PromptOps → 04 EPC**

### 01 — JobFit Agent

```js
{
  title: 'JobFit Agent — AI Job-Application System',
  desc: 'Full-stack AI assistant that scores job fit, runs structured gap analysis, and generates tailored cover letters and DOCX resumes — built as a real workflow system with persisted state, validated LLM outputs, and SSE-streamed progress.',
  subdesc: 'Multi-agent pipeline (parse → score → gap → generate) with Pydantic v2 schemas, pgvector semantic profile memory, Celery background jobs, per-call cost tracking, and a Prometheus metrics endpoint. Ships with Docker Compose, local Kubernetes manifests, and AWS ECS Fargate CI/CD.',
  href: 'https://github.com/divyanshu144/Job_Agent',
  logo: '/assets/project-logo1.png',
  logoStyle: {
    backgroundColor: '#0D1117',
    border: '0.2px solid #1e2a36',
    boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
  },
  tags: ['FastAPI', 'Anthropic', 'Celery', 'pgvector', 'React', 'AWS ECS'],
}
```

### 02 — DocChat

```js
{
  title: 'DocChat — Agentic Research Assistant',
  desc: 'Multi-source research assistant: ingest PDFs, YouTube videos, and web pages into a shared Qdrant vector store and ask questions across all of them — answers stream token-by-token with inline citation chips.',
  subdesc: 'Five-node LangGraph agent (Planner → Retriever → Synthesizer → Grounding → Critic) with replan loop, per-source filtering, conversation folders with drag-and-drop, JWT auth with silent refresh, and LangSmith tracing.',
  href: 'https://github.com/divyanshu144/DocChat',
  logo: '/assets/project-logo2.png',
  logoStyle: {
    backgroundColor: '#0a1628',
    border: '0.2px solid #1e2a36',
    boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
  },
  tags: ['FastAPI', 'LangGraph', 'Qdrant', 'Groq', 'React', 'PostgreSQL'],
}
```

### 03 — PromptOps

```js
{
  title: 'PromptOps — Prompt-as-Code MLOps',
  desc: 'Prompt engineering as a software discipline: version prompts by SHA-256 hash, run automated LLM-as-judge evaluation across a test suite, detect regressions, and optimize via parallel candidate generation.',
  subdesc: 'Pluggable EvalHarness ABC (LLM judge or DeepEval G-Eval), 9× parallel mutation optimizer with SSE streaming, pass-rate tracking, A/B diff view, MLflow experiment logging, and multi-provider support (Ollama, OpenAI, Anthropic).',
  href: 'https://github.com/divyanshu144/promptOps_framework',
  logo: '/assets/project-logo3.png',
  logoStyle: {
    backgroundColor: '#13202F',
    border: '0.2px solid #17293E',
    boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
  },
  tags: ['FastAPI', 'Next.js', 'MLflow', 'Anthropic', 'Ollama', 'SQLite'],
}
```

### 04 — EPC South West

```js
{
  title: 'EPC South West — Large-Scale ML Pipeline',
  desc: 'End-to-end ETL and ML pipeline processing 1.8M+ UK EPC records (2008–2025) — causal modelling, XGBoost prediction, and SHAP explainability for energy policy analysis.',
  subdesc: 'Reproducible CLI-driven workflow with Airflow DAG orchestration, MLflow experiment tracking, and a FastAPI service layer — documented end-to-end for handoff and scaling.',
  href: 'https://github.com/divyanshu144/EPC',
  logo: '/assets/project-logo4.png',
  logoStyle: {
    backgroundColor: '#0E1F38',
    border: '0.2px solid #0E2D58',
    boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
  },
  tags: ['Python', 'XGBoost', 'Airflow', 'MLflow', 'FastAPI', 'SHAP'],
}
```

**Removed fields vs current:** `texture`, `spotlight` (no longer consumed by the new component).

---

## Section 2 — New Component: `ProjectDevice.jsx`

Replaces `DemoComputer.jsx` entirely in the Projects canvas.

### Shape

Procedural R3F — no `.glb` file required:

- **Base**: `<RoundedBox>` (wide, thin), dark matte material (`#0d1117`), slight bevel
- **Screen panel**: `<RoundedBox>` (taller, thinner), hinged at top of base, tilted back ~15°, same dark material
- **Screen surface**: `<mesh>` plane on the front face of the screen panel, `meshBasicMaterial` with a canvas texture

### Screen texture (canvas-generated)

Generated via an offscreen `<canvas>` element in a `useMemo` keyed on `selectedProjectIndex`:

```
Background: linear-gradient navy (#080c10) → sky (#0ea5e9, 15% opacity)
Big number: "01" – "04", top-left, font-weight 900, color #1e3a4a (dark ghost)
Project title: 2-3 words, centered, white, ~18px
Sky underline: 2px #38bdf8 line below title
```

Returns a `CanvasTexture` that gets assigned to the screen mesh material. Regenerates on index change.

### Lighting

```
<ambientLight intensity={0.8} />
<directionalLight position={[5, 5, 5]} intensity={0.6} />
<pointLight position={[-4, 2, 3]} color="#38bdf8" intensity={0.4} />  {/* sky rim */}
```

### Controls

```jsx
<OrbitControls
  autoRotate
  autoRotateSpeed={0.6}
  maxPolarAngle={Math.PI / 2}
  enableZoom={false}
/>
```

Same interaction contract as current `DemoComputer` (no zoom, orbit enabled).

### File location

`src/components/ProjectDevice.jsx` — new file. `DemoComputer.jsx` left in place (not deleted).

---

## Section 3 — Tech Tag Chips

### Data shape change

`tags` on each project changes from:
```js
// before
tags: [{ id: 1, name: 'Python', path: '/assets/sql.png' }, ...]
```
to:
```js
// after
tags: ['FastAPI', 'Anthropic', 'Celery', 'pgvector', 'React', 'AWS ECS']
```

### CSS

New class in `src/index.css`:

```css
.project-chip {
  @apply px-2.5 py-1 rounded-full text-xs font-semibold border;
  @apply text-sky-300 border-sky-500/30 bg-sky-500/10;
}
```

Mirrors existing `.about-chip--ai` pattern.

### JSX change in `Projects.jsx`

```jsx
// before
{currentProject.tags.map((tag, index) => (
  <div key={index} className="tech-logo">
    <img src={tag.path} alt={tag.name} />
  </div>
))}

// after
{currentProject.tags.map((tag, index) => (
  <span key={index} className="project-chip">{tag}</span>
))}
```

---

## Section 4 — `Projects.jsx` Changes Summary

| Change | Detail |
|--------|--------|
| Import | Remove `DemoComputer`, `useVideoTexture`; add `ProjectDevice` |
| Canvas | Swap `<DemoComputer texture={...} />` → `<ProjectDevice selectedProjectIndex={selectedProjectIndex} title={currentProject.title} />` |
| Tags render | String chips (see Section 3) |
| Keep intact | Editorial number, accent line, prev/next arrows, GSAP fade, "View" link |

---

## Dead Assets (flag, not auto-delete)

| Asset | Status after this change |
|-------|--------------------------|
| `src/components/DemoComputer.jsx` | Unused — safe to delete |
| `public/textures/project/*.mp4` | Unused — safe to delete (6 files, ~42MB) |
| `texture` / `spotlight` fields in old `myProjects` | Removed in the data rewrite |
| `/assets/spotlight*.png` | Unused — safe to delete |

---

## Files Changed

| File | Action |
|------|--------|
| `src/constants/index.js` | Rewrite `myProjects` array (4 entries, new shape) |
| `src/components/ProjectDevice.jsx` | Create (new procedural laptop component) |
| `src/sections/Projects.jsx` | Update imports + canvas + tag render |
| `src/index.css` | Add `.project-chip` class |
