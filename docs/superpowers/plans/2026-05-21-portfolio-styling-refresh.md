# Portfolio Styling Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the portfolio's visual identity — swap indigo/purple accent for sky blue, replace decorative bento images with metrics, remove Aceternity spotlight glows, replace floating 3D objects with GSAP stat cards.

**Architecture:** Five files modified in sequence — config first, CSS second, then one section at a time. Each task is independently verifiable via `npm run dev`. No unit tests exist for this visual app; testing is manual visual inspection in the browser.

**Tech Stack:** React, Tailwind CSS, GSAP + `@gsap/react`, Vite dev server

---

## File Map

| File | What changes |
|------|-------------|
| `tailwind.config.js` | Update `black.*` colour tokens to cooler navy-black palette |
| `src/index.css` | Body bg, all hardcoded purple/indigo hex → sky blue; hero badges, chip tiers, new `.stat-card` classes |
| `src/sections/About.jsx` | Remove 4 image tags; add Impact Numbers card |
| `src/sections/Projects.jsx` | Remove spotlight image; add editorial number + accent line |
| `src/sections/Hero.jsx` | Remove 4 floating 3D components + imports; add 3 GSAP stat cards |

---

## Task 1: Tailwind Colour Tokens

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Update the `black` colour tokens**

Replace the entire `colors.black` block in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        generalsans: ['General Sans', 'sans-serif'],
      },
      colors: {
        black: {
          DEFAULT: '#000',
          100: '#080c10',
          200: '#0f141a',
          300: '#1e2a36',
          500: '#1e3a4a',
          600: '#0a0e14',
        },
        white: {
          DEFAULT: '#FFFFFF',
          800: '#E4E4E6',
          700: '#D6D9E9',
          600: '#AFB0B6',
          500: '#62646C',
        },
      },
      backgroundImage: {
        terminal: "url('/assets/terminal.png')",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Start dev server and verify no build errors**

```bash
npm run dev
```

Expected: server starts at `http://localhost:5173`, no console errors. The site will look slightly different (cooler card/border tones) but no layout breaks.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "style: update colour tokens to navy-black palette"
```

---

## Task 2: Global CSS — Accent Colours + New Classes

**Files:**
- Modify: `src/index.css`

This task touches three areas: (a) body background, (b) all hardcoded purple/indigo hex values in AI assistant classes, (c) hero badge + chip tier classes + new `.stat-card` classes.

- [ ] **Step 1: Update body background**

Find and replace in `src/index.css`:

```css
/* BEFORE */
body {
  background: #010103;
  font-family: 'General Sans', sans-serif;
}

/* AFTER */
body {
  background: #080c10;
  font-family: 'General Sans', sans-serif;
}
```

- [ ] **Step 2: Update hero badge classes (lines ~220–228)**

```css
/* BEFORE */
.hero-badge--ai {
  @apply text-indigo-300 border-indigo-500/40 bg-indigo-500/10;
}
.hero-badge--fs {
  @apply text-emerald-300 border-emerald-500/40 bg-emerald-500/10;
}
.hero-badge--ds {
  @apply text-purple-300 border-purple-500/40 bg-purple-500/10;
}

/* AFTER */
.hero-badge--ai {
  @apply text-sky-300 border-sky-500/40 bg-sky-500/10;
}
.hero-badge--fs {
  @apply text-sky-200 border-sky-400/30 bg-sky-400/8;
}
.hero-badge--ds {
  @apply text-sky-400 border-sky-600/40 bg-sky-600/10;
}
```

- [ ] **Step 3: Update about chip colour tiers (lines ~231–239)**

```css
/* BEFORE */
.about-chip--ai {
  @apply text-indigo-300 border-indigo-500/30 bg-indigo-500/10;
}
.about-chip--fe {
  @apply text-emerald-300 border-emerald-500/30 bg-emerald-500/10;
}
.about-chip--ops {
  @apply text-orange-300 border-orange-500/30 bg-orange-500/10;
}

/* AFTER */
.about-chip--ai {
  @apply text-sky-300 border-sky-500/30 bg-sky-500/10;
}
.about-chip--fe {
  @apply text-slate-300 border-slate-500/30 bg-slate-500/10;
}
.about-chip--ops {
  @apply text-slate-400 border-slate-600/30 bg-slate-600/8;
}
```

- [ ] **Step 4: Update AI assistant accent colours**

In `src/index.css`, find each of the following and apply the replacement. These are all outside the `@layer utilities` block (after line ~242).

```css
/* ai-accent-bar */
/* BEFORE: background: linear-gradient(to right, #6366f1, #8b5cf6, #a78bfa); */
/* AFTER:  */
.ai-accent-bar {
  height: 3px;
  background: linear-gradient(to right, #0ea5e9, #38bdf8, #7dd3fc);
  flex-shrink: 0;
}

/* ai-avatar */
/* BEFORE: background: linear-gradient(135deg, #6366f1, #7c3aed); */
/* AFTER:  */
.ai-avatar {
  width: 2.25rem; height: 2.25rem; border-radius: 9999px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: white; flex-shrink: 0;
}

/* ai-tab_active */
/* BEFORE: background: linear-gradient(135deg, #6366f1, #7c3aed); */
/* AFTER:  */
.ai-tab_active {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white; border-color: transparent;
}

/* ai-message_avatar */
/* BEFORE: background: linear-gradient(135deg, #6366f1, #7c3aed); */
/* AFTER:  */
.ai-message_avatar {
  width: 1.625rem; height: 1.625rem; border-radius: 9999px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.55rem; color: white; flex-shrink: 0;
}

/* ai-input:focus */
/* BEFORE: border-color: #6366f1; */
/* AFTER:  */
.ai-input:focus { border-color: #38bdf8; }

/* ai-send */
/* BEFORE: background: linear-gradient(135deg, #6366f1, #7c3aed); */
/* AFTER:  */
.ai-send {
  width: 2.25rem; height: 2.25rem; border-radius: 9999px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: box-shadow 0.2s, transform 0.2s; flex-shrink: 0;
}

/* ai-send:hover */
/* BEFORE: box-shadow: 0 0 14px rgba(99,102,241,0.55); */
/* AFTER:  */
.ai-send:hover:not(:disabled) { box-shadow: 0 0 14px rgba(56,189,248,0.55); transform: scale(1.08); }

/* ai-btn */
/* BEFORE: background: linear-gradient(135deg, #6366f1, #7c3aed); */
/* AFTER:  */
.ai-btn {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white; font-weight: 600; font-size: 0.875rem;
  padding: 0.5rem 1.25rem; border-radius: 0.625rem;
  width: fit-content; transition: box-shadow 0.2s; margin-top: 0.25rem;
}

/* ai-btn:hover */
/* BEFORE: box-shadow: 0 0 18px rgba(99,102,241,0.45); */
/* AFTER:  */
.ai-btn:hover:not(:disabled) { box-shadow: 0 0 18px rgba(56,189,248,0.45); }

/* ai-modal_panel box-shadow */
/* BEFORE: box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.07); */
/* AFTER:  */
.ai-modal_panel {
  position: relative; z-index: 10;
  width: 92%; max-width: 40rem;
  max-height: 88vh;
  background: #0f141a;
  border: 1px solid #1e2a36;
  border-radius: 1.25rem;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(56,189,248,0.05);
  display: flex; flex-direction: column; overflow: hidden;
}
```

- [ ] **Step 5: Add `.stat-card` classes**

Append these classes at the end of `src/index.css`, before the final closing line:

```css
/* ─── Hero Stat Cards ─────────────────────────────────────────── */
.stat-card {
  position: absolute;
  background: #0f141a;
  border: 1px solid #1e2a36;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  pointer-events: none;
  backdrop-filter: blur(8px);
  z-index: 10;
}
.stat-card_label {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #38bdf8;
  font-family: 'General Sans', sans-serif;
}
.stat-card_value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0f4f8;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-family: 'General Sans', sans-serif;
}
.stat-card_sub {
  font-size: 0.65rem;
  color: #64748b;
  font-family: 'General Sans', sans-serif;
}
```

- [ ] **Step 6: Verify in browser**

With `npm run dev` still running, open `http://localhost:5173`. Check:
- Body background is visibly deeper/bluer (not pure black)
- AI assistant button (floating bottom-right) has sky blue glow when opened
- Hero role badges (AI Engineer, Full-Stack Dev, MSc Data Science) are sky blue tones instead of indigo/purple/emerald

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "style: swap purple/indigo accent to sky blue throughout"
```

---

## Task 3: About Section — Metrics Grid

**Files:**
- Modify: `src/sections/About.jsx`

- [ ] **Step 1: Remove the four decorative image blocks**

In `src/sections/About.jsx`, delete the following `<div className="about-media">` blocks (and their wrapping `<div>` if the `about-media` div is the only child in that slot):

```jsx
// DELETE from profile card (card 1):
<div className="about-media">
  <img src="assets/grid1.png" alt="profile highlight" className="about-image" />
</div>

// DELETE from tech stack card (card 2):
<div className="about-media">
  <img src="assets/techstack.png" alt="tech stack" className="about-image" />
</div>

// DELETE from education card (card 5):
<div className="about-media">
  <img src="assets/grid3.png" alt="education" className="about-image" />
</div>

// DELETE from leadership card (card 6):
<div className="about-media">
  <img src="assets/grid4.png" alt="leadership" className="about-image object-cover" />
</div>
```

- [ ] **Step 2: Add the Impact Numbers card**

Insert this new card as the third item in the masonry (after the tech stack card, before the Globe card). Add it as a new `<div>` sibling in the masonry container:

```jsx
{/* Impact Numbers card */}
<div>
  <div className="about-card about-card_compact">
    <div className="space-y-3">
      <p className="about-kicker">Impact</p>
      <p className="about-heading">By the numbers</p>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">1.8M</p>
          <p className="about-meta mt-0.5">EPC records processed</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">9×</p>
          <p className="about-meta mt-0.5">eval engine speedup</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">20%</p>
          <p className="about-meta mt-0.5">app perf improvement</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">40%</p>
          <p className="about-meta mt-0.5">test coverage increase</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/#about`. Check:
- No broken image placeholders in any card
- Impact Numbers card shows all 4 stats in a 2×2 grid
- Masonry layout is balanced (no giant empty gaps)
- Tech stack chips show sky blue (AI/ML), slate (Frontend), dim slate (Ops)

- [ ] **Step 4: Commit**

```bash
git add src/sections/About.jsx
git commit -m "style: replace bento images with metrics grid in About section"
```

---

## Task 4: Projects Section — Editorial Numbers

**Files:**
- Modify: `src/sections/Projects.jsx`

- [ ] **Step 1: Remove the spotlight image**

In `src/sections/Projects.jsx`, delete this line inside the left panel `<div>`:

```jsx
// DELETE:
<div className="absolute top-0 right-0">
  <img src={currentProject.spotlight} alt="spotlight" className="w-full h-96 object-cover rounded-xl" />
</div>
```

- [ ] **Step 2: Add the editorial project number and accent line**

The left panel div currently has `className="flex flex-col gap-5 relative sm:p-10 py-10 px-5 shadow-2xl shadow-black-200"`. It already has `relative` so we can place absolute children directly. Add the number span and accent line as the first two children inside it:

```jsx
<div className="flex flex-col gap-5 relative sm:p-10 py-10 px-5 shadow-2xl shadow-black-200">
  {/* Accent line */}
  <div className="absolute top-0 left-0 right-0 h-px"
    style={{ background: 'linear-gradient(to right, transparent, #38bdf8, transparent)' }}
  />
  {/* Editorial project number */}
  <span
    className="absolute top-0 right-4 font-black select-none pointer-events-none"
    style={{
      fontSize: '7rem',
      lineHeight: 1,
      color: '#0f1a24',
      letterSpacing: '-0.04em',
      zIndex: 0,
    }}
    aria-hidden="true"
  >
    {String(selectedProjectIndex + 1).padStart(2, '0')}
  </span>

  {/* Wrap remaining content to sit above the number */}
  <div className="relative" style={{ zIndex: 1 }}>
    <div className="p-3 backdrop-filter backdrop-blur-3xl w-fit rounded-lg" style={currentProject.logoStyle}>
      <img className="w-10 h-10 shadow-sm" src={currentProject.logo} alt="logo" />
    </div>

    <div className="flex flex-col gap-5 text-white-600 my-5">
      <p className="text-white text-2xl font-semibold animatedText">{currentProject.title}</p>
      <p className="animatedText">{currentProject.desc}</p>
      <p className="animatedText">{currentProject.subdesc}</p>
    </div>

    <div className="flex items-center justify-between flex-wrap gap-5">
      <div className="flex items-center gap-3">
        {currentProject.tags.map((tag, index) => (
          <div key={index} className="tech-logo">
            <img src={tag.path} alt={tag.name} />
          </div>
        ))}
      </div>
      <a
        className="flex items-center gap-2 cursor-pointer text-white-600"
        href={currentProject.href}
        target="_blank"
        rel="noreferrer">
        <p>View</p>
        <img src="/assets/arrow-up.png" alt="arrow" className="w-3 h-3" />
      </a>
    </div>

    <div className="flex justify-between items-center mt-7">
      <button className="arrow-btn" onClick={() => handleNavigation('previous')}>
        <img src="/assets/left-arrow.png" alt="left arrow" />
      </button>
      <button className="arrow-btn" onClick={() => handleNavigation('next')}>
        <img src="/assets/right-arrow.png" alt="right arrow" className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/#projects`. Check:
- No spotlight glow image behind the project panel
- Sky blue accent line visible at the very top of the left panel
- Large faded number (`01`, `02`, ...) visible in the top-right corner of the panel, behind the content
- Number updates when navigating between projects
- Text content is fully readable above the number

- [ ] **Step 4: Commit**

```bash
git add src/sections/Projects.jsx
git commit -m "style: replace spotlight glow with editorial numbers in Projects section"
```

---

## Task 5: Hero Section — Floating Stat Cards

**Files:**
- Modify: `src/sections/Hero.jsx`

- [ ] **Step 1: Remove the four floating 3D component imports**

At the top of `src/sections/Hero.jsx`, delete these four import lines:

```jsx
// DELETE these four lines:
import Target from '../components/Target'
import ReactLogo from '../components/ReactLogo'
import Cube from '../components/Cube'
import Rings from '../components/Rings'
```

- [ ] **Step 2: Add `useRef` import and refs**

Ensure `useRef` is imported from React (add it if not already there):

```jsx
import { Suspense, useRef } from 'react'
```

Add three ref declarations at the top of the `Hero` component function, after the media query hooks:

```jsx
const cardARef = useRef(null)
const cardBRef = useRef(null)
const cardCRef = useRef(null)
```

- [ ] **Step 3: Remove the four 3D components from the Canvas group**

Inside the `<Canvas>`, find the `<group>` block and remove all four components. The group should become empty and can be deleted entirely:

```jsx
// DELETE the entire group block:
<group>
  <Target position={sizes.targetPosition} />
  <ReactLogo position={sizes.reactLogoPosition} />
  <Cube position={sizes.cubePosition} />
  <Rings position={sizes.ringPosition} />
</group>
```

- [ ] **Step 4: Add the GSAP float animation**

Add a `useGSAP` call inside the `Hero` component (after the existing media query hooks and refs, before the return statement):

```jsx
useGSAP(() => {
  [cardARef, cardBRef, cardCRef].forEach((ref, i) => {
    if (!ref.current) return
    gsap.to(ref.current, {
      y: '-=10',
      duration: 3 + i * 0.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.9,
    })
  })
}, [])
```

Make sure `gsap` and `useGSAP` are imported — they should already be imported at the top:

```jsx
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
```

- [ ] **Step 5: Add the three floating stat cards to the JSX**

Inside the Hero `<section>`, after the `<div className="w-full h-full absolute inset-0 mt-4">` Canvas block and before the bottom CTA button block, add the three stat cards:

```jsx
{/* Floating stat cards — desktop only */}
<div
  ref={cardARef}
  className="stat-card hidden sm:flex flex-col gap-1 bottom-32 left-8"
>
  <p className="stat-card_label">ML Pipeline</p>
  <p className="stat-card_value">1.8M</p>
  <p className="stat-card_sub">EPC records processed</p>
</div>

<div
  ref={cardBRef}
  className="stat-card hidden sm:flex flex-col gap-1 top-40 right-8"
>
  <p className="stat-card_label">PromptOps</p>
  <p className="stat-card_value">9×</p>
  <p className="stat-card_sub">eval engine speedup</p>
</div>

<div
  ref={cardCRef}
  className="stat-card hidden sm:flex flex-col gap-1 bottom-52 right-12"
>
  <p className="stat-card_label">UK Work Rights</p>
  <p className="stat-card_value">✓</p>
  <p className="stat-card_sub">Graduate Route · no sponsorship</p>
</div>
```

- [ ] **Step 6: Verify the final Hero.jsx structure**

The complete `Hero` component should look like this (abbreviated):

```jsx
import { PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import HackerRoom from '../components/HackerRoom'
import CanvasLoader from '../components/CanvasLoader'
import { useMediaQuery } from 'react-responsive'
import { calculateSizes } from '../constants'
import HeroCamera from '../components/HeroCamera'
import Button from '../components/Button'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Hero = () => {
  const isSmall = useMediaQuery({ maxWidth: 400 })
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 })
  const sizes = calculateSizes(isSmall, isMobile, isTablet)

  const cardARef = useRef(null)
  const cardBRef = useRef(null)
  const cardCRef = useRef(null)

  useGSAP(() => {
    [cardARef, cardBRef, cardCRef].forEach((ref, i) => {
      if (!ref.current) return
      gsap.to(ref.current, {
        y: '-=10',
        duration: 3 + i * 0.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.9,
      })
    })
  }, [])

  return (
    <section className="min-h-screen w-full flex flex-col relative">
      {/* Header text + badges */}
      <div className="w-full mx-auto flex flex-col sm:mt-36 mt-20 c-space gap-3">
        <p className="sm:text-3xl text-2xl font-bold text-white text-center font-generalsans">
          Hi, I am Divyanshu Charak <span className="waving-hand">👋</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          <span className="hero-badge hero-badge--ai">AI Engineer</span>
          <span className="hero-badge hero-badge--fs">Full-Stack Dev</span>
          <span className="hero-badge hero-badge--ds">MSc Data Science</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full absolute inset-0 mt-4">
        <Canvas className="w-full h-full">
          <Suspense fallback={<CanvasLoader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 20]} />
            <HeroCamera isMobile={isMobile}>
              <HackerRoom
                position={sizes.deskPosition}
                rotation={[0, -Math.PI, 0]}
                scale={sizes.deskScale}
              />
            </HeroCamera>
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 10]} intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating stat cards */}
      <div ref={cardARef} className="stat-card hidden sm:flex flex-col gap-1 bottom-32 left-8">
        <p className="stat-card_label">ML Pipeline</p>
        <p className="stat-card_value">1.8M</p>
        <p className="stat-card_sub">EPC records processed</p>
      </div>
      <div ref={cardBRef} className="stat-card hidden sm:flex flex-col gap-1 top-40 right-8">
        <p className="stat-card_label">PromptOps</p>
        <p className="stat-card_value">9×</p>
        <p className="stat-card_sub">eval engine speedup</p>
      </div>
      <div ref={cardCRef} className="stat-card hidden sm:flex flex-col gap-1 bottom-52 right-12">
        <p className="stat-card_label">UK Work Rights</p>
        <p className="stat-card_value">✓</p>
        <p className="stat-card_sub">Graduate Route · no sponsorship</p>
      </div>

      {/* CTA button */}
      <div className="absolute bottom-7 left-0 right-0 w-full z-10 c-space">
        <a href="#about" className="w-fit">
          <Button name="Let's work together" isBeam containerClass="sm:w-fit w-full sm:min-w-96" />
        </a>
      </div>
    </section>
  )
}

export default Hero
```

- [ ] **Step 7: Verify in browser**

Open `http://localhost:5173`. Check:
- HackerRoom 3D scene still loads correctly
- No React logo, cube, rings, or target floating in the scene
- Three stat cards visible on desktop (hidden on mobile — resize to verify)
- Cards drift gently up and down, out of sync with each other
- No console errors

- [ ] **Step 8: Commit**

```bash
git add src/sections/Hero.jsx
git commit -m "style: replace floating 3D objects with GSAP stat cards in Hero"
```

---

## Final Verification Checklist

Run through these after all 5 tasks are complete:

- [ ] Sky blue accent visible in AI assistant modal (accent bar, send button, active tab)
- [ ] Body background is noticeably deep navy-black (not pure `#000` or `#010103`)
- [ ] About section: no broken image placeholders, Impact Numbers card shows 1.8M / 9× / 20% / 40%
- [ ] About chips: AI/ML chips are sky blue tint, Frontend chips are neutral slate, Ops chips are dim
- [ ] Projects: no spotlight glow image, editorial number visible behind project content, accent line at top
- [ ] Projects: number changes when navigating (01 → 02 → 03...)
- [ ] Hero: HackerRoom scene loads, no floating 3D objects
- [ ] Hero: 3 stat cards float gently on desktop, hidden on mobile
- [ ] Mobile (≤768px): no layout breaks in any section
- [ ] `npm run build` completes with no errors
