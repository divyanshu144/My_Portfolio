# Projects Section Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the retro CRT 3D model with a procedural modern laptop, rewrite all four project entries with accurate content and text-chip tags.

**Architecture:** Four sequential changes — data first, then CSS, then the new R3F component, then wire it into the section. No test suite exists in this project; each task ends with a `npm run build` smoke check and a dev-server visual check.

**Tech Stack:** React 19, @react-three/fiber, @react-three/drei (RoundedBox, OrbitControls), three.js CanvasTexture, Tailwind CSS via `@apply`, GSAP.

## Global Constraints

- Keep the existing carousel structure (prev/next arrows, selectedProjectIndex state, GSAP fade) — do not restructure Projects.jsx beyond what the spec requires.
- All sky-blue values must use the palette tokens already in use: `#38bdf8` (sky-500), `#0ea5e9` (sky-400), `#080c10` (body bg).
- `DemoComputer.jsx` is left on disk — do not delete it.
- Old `.mp4` files in `public/textures/project/` are left on disk — do not delete them.
- Dev server runs on `http://localhost:5173` via `npm run dev`.

---

### Task 1: Rewrite myProjects data

**Files:**
- Modify: `src/constants/index.js:59-171`

**Interfaces:**
- Produces: `myProjects` — array of 4 objects each with `{ title, desc, subdesc, href, logo, logoStyle, tags }` where `tags` is `string[]`
- `texture` and `spotlight` fields are dropped entirely
- Consumed by: `Projects.jsx` (Task 4)

- [ ] **Step 1: Replace the myProjects array**

Open `src/constants/index.js`. Replace lines 59–171 (the entire `myProjects` export through the closing `];`) with:

```js
export const myProjects = [
  {
    title: 'JobFit Agent — AI Job-Application System',
    desc: 'Full-stack AI assistant that scores job fit, runs structured gap analysis, and generates tailored cover letters and DOCX resumes — built as a real workflow system with persisted state, validated LLM outputs, and SSE-streamed progress.',
    subdesc:
      'Multi-agent pipeline (parse → score → gap → generate) with Pydantic v2 schemas, pgvector semantic profile memory, Celery background jobs, per-call cost tracking, and a Prometheus metrics endpoint. Ships with Docker Compose, local Kubernetes manifests, and AWS ECS Fargate CI/CD.',
    href: 'https://github.com/divyanshu144/Job_Agent',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#0D1117',
      border: '0.2px solid #1e2a36',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'Anthropic', 'Celery', 'pgvector', 'React', 'AWS ECS'],
  },
  {
    title: 'DocChat — Agentic Research Assistant',
    desc: 'Multi-source research assistant: ingest PDFs, YouTube videos, and web pages into a shared Qdrant vector store and ask questions across all of them — answers stream token-by-token with inline citation chips.',
    subdesc:
      'Five-node LangGraph agent (Planner → Retriever → Synthesizer → Grounding → Critic) with replan loop, per-source filtering, conversation folders with drag-and-drop, JWT auth with silent refresh, and LangSmith tracing.',
    href: 'https://github.com/divyanshu144/DocChat',
    logo: '/assets/project-logo2.png',
    logoStyle: {
      backgroundColor: '#0a1628',
      border: '0.2px solid #1e2a36',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'LangGraph', 'Qdrant', 'Groq', 'React', 'PostgreSQL'],
  },
  {
    title: 'PromptOps — Prompt-as-Code MLOps',
    desc: 'Prompt engineering as a software discipline: version prompts by SHA-256 hash, run automated LLM-as-judge evaluation across a test suite, detect regressions, and optimize via parallel candidate generation.',
    subdesc:
      'Pluggable EvalHarness ABC (LLM judge or DeepEval G-Eval), 9× parallel mutation optimizer with SSE streaming, pass-rate tracking, A/B diff view, MLflow experiment logging, and multi-provider support (Ollama, OpenAI, Anthropic).',
    href: 'https://github.com/divyanshu144/promptOps_framework',
    logo: '/assets/project-logo3.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'Next.js', 'MLflow', 'Anthropic', 'Ollama', 'SQLite'],
  },
  {
    title: 'EPC South West — Large-Scale ML Pipeline',
    desc: 'End-to-end ETL and ML pipeline processing 1.8M+ UK EPC records (2008–2025) — causal modelling, XGBoost prediction, and SHAP explainability for energy policy analysis.',
    subdesc:
      'Reproducible CLI-driven workflow with Airflow DAG orchestration, MLflow experiment tracking, and a FastAPI service layer — documented end-to-end for handoff and scaling.',
    href: 'https://github.com/divyanshu144/EPC',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#0E1F38',
      border: '0.2px solid #0E2D58',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['Python', 'XGBoost', 'Airflow', 'MLflow', 'FastAPI', 'SHAP'],
  },
];
```

- [ ] **Step 2: Verify the build parses correctly**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

Expected: build succeeds (✓ built), zero errors. If `Projects.jsx` throws because `tag.path` is undefined — that's expected; fix it in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/constants/index.js
git commit -m "feat: rewrite myProjects with 4 entries, text tag arrays"
```

---

### Task 2: Add .project-chip CSS class

**Files:**
- Modify: `src/index.css:238-240` (after the last `.about-chip--ops` rule, before the closing `}` of the `@layer components` block)

**Interfaces:**
- Produces: `.project-chip` — Tailwind utility class, sky-blue pill
- Consumed by: `Projects.jsx` tag render loop (Task 4)

- [ ] **Step 1: Add the class inside the @layer components block**

In `src/index.css`, find this line (currently line 239):
```css
  .about-chip--ops {
    @apply text-slate-400 border-slate-600/30 bg-slate-600/10;
  }
}
```

Add `.project-chip` immediately before the closing `}`:

```css
  .about-chip--ops {
    @apply text-slate-400 border-slate-600/30 bg-slate-600/10;
  }

  /* project section tech tag chips */
  .project-chip {
    @apply px-2.5 py-1 rounded-full text-xs font-semibold border;
    @apply text-sky-300 border-sky-500/30 bg-sky-500/10;
  }
}
```

- [ ] **Step 2: Verify no Tailwind errors**

```bash
npm run build 2>&1 | grep -iE "error|unknown"
```

Expected: no errors mentioning `project-chip` or unknown utilities.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add .project-chip text chip class"
```

---

### Task 3: Create ProjectDevice component

**Files:**
- Create: `src/components/ProjectDevice.jsx`

**Interfaces:**
- Props: `{ selectedProjectIndex: number, title: string }`
- `selectedProjectIndex` drives canvas texture regeneration (0–3)
- `title` format is `"Short Name — Subtitle"` — the component splits on ` — ` and takes index 0
- Produces: a self-contained R3F scene fragment (lights + laptop mesh + OrbitControls) — no `<Canvas>` wrapper (Canvas lives in Projects.jsx)
- Consumed by: `Projects.jsx` canvas (Task 4)

- [ ] **Step 1: Create the file**

Create `src/components/ProjectDevice.jsx` with this content:

```jsx
import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox, OrbitControls } from '@react-three/drei'

const LaptopModel = ({ selectedProjectIndex, title }) => {
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const ctx = canvas.getContext('2d')

    // Navy-to-dark-blue background
    const grad = ctx.createLinearGradient(0, 0, 512, 320)
    grad.addColorStop(0, '#080c10')
    grad.addColorStop(1, '#0a1e2e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 320)

    // Ghost project number (large, dark)
    ctx.font = '900 180px Arial, sans-serif'
    ctx.fillStyle = '#0e1e2d'
    ctx.textAlign = 'left'
    ctx.fillText(String(selectedProjectIndex + 1).padStart(2, '0'), 16, 210)

    // Project short title (white, centered)
    const shortTitle = title.split(' — ')[0]
    ctx.font = '600 26px Arial, sans-serif'
    ctx.fillStyle = '#f0f4f8'
    ctx.textAlign = 'center'
    ctx.fillText(shortTitle, 256, 252)

    // Sky-blue underline
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(256 - 50, 262, 100, 2)

    return new THREE.CanvasTexture(canvas)
  }, [selectedProjectIndex, title])

  return (
    <group position={[0, -0.6, 0]}>
      {/* Laptop base / keyboard unit */}
      <RoundedBox args={[3.2, 0.15, 2.2]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0d1117" roughness={0.7} metalness={0.3} />
      </RoundedBox>

      {/* Screen assembly — grouped so the surface stays flush with the panel */}
      <group position={[0, 1.2, -1.05]} rotation={[-0.25, 0, 0]}>
        {/* Screen panel (back of lid) */}
        <RoundedBox args={[3.2, 2.1, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#0d1117" roughness={0.7} metalness={0.3} />
        </RoundedBox>
        {/* Screen surface — 0.056 in front of panel to avoid z-fighting */}
        <mesh position={[0, 0, 0.056]}>
          <planeGeometry args={[2.9, 1.85]} />
          <meshBasicMaterial map={screenTexture} />
        </mesh>
      </group>
    </group>
  )
}

const ProjectDevice = ({ selectedProjectIndex, title }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-4, 2, 3]} color="#38bdf8" intensity={0.4} />
      <LaptopModel selectedProjectIndex={selectedProjectIndex} title={title} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2}
        enableZoom={false}
      />
    </>
  )
}

export default ProjectDevice
```

- [ ] **Step 2: Verify it builds without errors**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

Expected: ✓ built. If `RoundedBox` is not found — run `npm ls @react-three/drei` to confirm it's installed (it is, since `OrbitControls` is already used from there).

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectDevice.jsx
git commit -m "feat: add ProjectDevice procedural R3F laptop component"
```

---

### Task 4: Wire ProjectDevice into Projects.jsx

**Files:**
- Modify: `src/sections/Projects.jsx`

**Interfaces:**
- Consumes: `ProjectDevice` from `../components/ProjectDevice.jsx` — props `{ selectedProjectIndex, title }`
- Consumes: `myProjects[i].tags` — now `string[]` (from Task 1)
- All other state/logic unchanged

- [ ] **Step 1: Update the imports**

Replace the current import block at the top of `src/sections/Projects.jsx`:

```js
// before
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls } from '@react-three/drei';

import { myProjects } from '../constants/index.js';
import CanvasLoader from '../components/Loading.jsx';
import DemoComputer from '../components/DemoComputer.jsx';
```

```js
// after
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';

import { myProjects } from '../constants/index.js';
import CanvasLoader from '../components/Loading.jsx';
import ProjectDevice from '../components/ProjectDevice.jsx';
```

- [ ] **Step 2: Replace the tags render loop**

Find this block (lines 71–78 in the current file):

```jsx
              <div className="flex items-center gap-3">
                {currentProject.tags.map((tag, index) => (
                  <div key={index} className="tech-logo">
                    <img src={tag.path} alt={tag.name} />
                  </div>
                ))}
              </div>
```

Replace with:

```jsx
              <div className="flex items-center flex-wrap gap-2">
                {currentProject.tags.map((tag, index) => (
                  <span key={index} className="project-chip">{tag}</span>
                ))}
              </div>
```

- [ ] **Step 3: Replace the Canvas contents**

Find this block (lines 102–115):

```jsx
        <div className="border border-black-300 bg-black-200 rounded-lg h-96 md:h-full">
          <Canvas>
            <ambientLight intensity={Math.PI} />
            <directionalLight position={[10, 10, 5]} />
            <Center>
              <Suspense fallback={<CanvasLoader />}>
                <group scale={2} position={[0, -3, 0]} rotation={[0, -0.1, 0]}>
                  <DemoComputer texture={currentProject.texture} />
                </group>
              </Suspense>
            </Center>
            <OrbitControls maxPolarAngle={Math.PI / 2} enableZoom={false} />
          </Canvas>
        </div>
```

Replace with:

```jsx
        <div className="border border-black-300 bg-black-200 rounded-lg h-96 md:h-full">
          <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
            <Suspense fallback={<CanvasLoader />}>
              <ProjectDevice
                selectedProjectIndex={selectedProjectIndex}
                title={currentProject.title}
              />
            </Suspense>
          </Canvas>
        </div>
```

- [ ] **Step 4: Verify the build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

Expected: ✓ built, zero errors. Common issue: if `Center` is still referenced somewhere after the import removal — search and remove it.

- [ ] **Step 5: Visual check in dev server**

The dev server should still be running on `http://localhost:5173`. Hard-refresh the page, scroll to "My Selected Work" and verify:

- 4 projects load (JobFit, DocChat, PromptOps, EPC)
- Text chips render (not broken images)
- Right column shows a dark laptop shape with screen texture (navy bg + project number + title)
- Laptop auto-rotates slowly
- Sky-blue rim light visible on left edge of laptop
- Clicking `→` cycles through all 4 and the screen texture updates

- [ ] **Step 6: Commit**

```bash
git add src/sections/Projects.jsx
git commit -m "feat: wire ProjectDevice and text chips into Projects section"
```

---

### Task 5: Final commit and cleanup flag

**Files:**
- No file changes — this task records dead assets for later cleanup

- [ ] **Step 1: Confirm nothing references old texture/spotlight fields**

```bash
grep -rn "currentProject\.texture\|currentProject\.spotlight\|DemoComputer\|useVideoTexture" src/
```

Expected: zero matches. If any match appears, fix the referencing file before proceeding.

- [ ] **Step 2: Note dead assets for manual cleanup (do not delete now)**

The following are now unreferenced but intentionally left on disk per spec:

```
src/components/DemoComputer.jsx        (unused component)
public/textures/project/anonymous.mp4  (6 video files total, ~42 MB)
public/textures/project/Fooder.mp4
public/textures/project/movieTime.mp4
public/textures/project/music.mp4
public/textures/project/project4.mp4
public/textures/project/project5.mp4
public/assets/spotlight1.png
public/assets/spotlight2.png
public/assets/spotlight3.png
```

Delete them manually when ready to reclaim the space.

- [ ] **Step 3: Final build smoke check**

```bash
npm run build 2>&1 | tail -5
```

Expected: build completes, no warnings about missing modules.

- [ ] **Step 4: Lint check**

```bash
npm run lint 2>&1 | grep -v "^$"
```

Expected: no errors (warnings about unused `DemoComputer` import are gone since we removed it).
