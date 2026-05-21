# Portfolio Styling Refresh — Design Spec
**Date:** 2026-05-21  
**Status:** Approved  
**Scope:** Visual refresh to make the portfolio more timeless and distinctive, removing trend-dependent elements

---

## Goals

1. Replace the Aceternity-style spotlight glow effects (ubiquitous, will date)
2. Replace the bento grid decorative images in About (trend-dependent)
3. Replace floating 3D objects in Hero (template-y)
4. Shift accent colour from indigo/purple to sky blue (more distinctive for AI/ML positioning)
5. Add metrics-first content where decorative images were removed

---

## Non-Goals

- Changing the overall layout structure of any section
- Replacing or modifying the HackerRoom 3D scene
- Changing typography (General Sans stays)
- Touching the AI Assistant modal behaviour or API routes
- Modifying the Experience, Contact, or Footer sections

---

## Section 1 — Color System

### Accent colour
| Token | Before | After |
|-------|--------|-------|
| Primary accent | `#6366f1` (indigo) | `#38bdf8` (sky blue) |
| Accent dark | `#7c3aed` (purple) | `#0ea5e9` |
| Accent light | `#a78bfa` | `#7dd3fc` |

### Background & surfaces
| Token | Before | After |
|-------|--------|-------|
| Body bg | `#010103` | `#080c10` |
| Card bg | `#0E0E10` | `#0f141a` |
| Border | `#1C1C21` | `#1e2a36` |
| Muted | `#3A3A49` | `#1e3a4a` |

### Files
- `tailwind.config.js` — update `black` colour tokens: `100: #080c10`, `200: #0f141a`, `300: #1e2a36`, `500: #1e3a4a`, `600: #0a0e14`
- `src/index.css`:
  - `body { background }` → `#080c10`
  - All AI assistant accent colours (`.ai-accent-bar`, `.ai-avatar`, `.ai-tab_active`, `.ai-send`, `.ai-btn`, `.ai-input:focus`, `.ai-modal_panel` bg) → sky blue variants
  - Hero badge classes → sky blue palette
  - All gradient definitions using `#6366f1` / `#7c3aed` → `#38bdf8` / `#0ea5e9`

**Note:** `src/constants/index.js` is NOT modified. The unused size props (`targetPosition`, `reactLogoPosition`, `cubePosition`, `ringPosition`) remain in `calculateSizes` — removing them is out of scope.

---

## Section 2 — About Section

### Remove
- `<img src="assets/grid1.png">` from profile card
- `<img src="assets/techstack.png">` from tech stack card
- `<img src="assets/grid3.png">` from education card
- `<img src="assets/grid4.png">` from leadership card

### Add — Impact Numbers card
New card inserted after the stack card in masonry order:

```
┌─────────────────────────────┐
│ IMPACT                      │
│                             │
│  1.8M        9×             │
│  EPC records  eval speedup  │
│                             │
│  20%         40%            │
│  perf improv  test coverage │
└─────────────────────────────┘
```

- Stats sourced from real project/experience data
- Large number in `#f0f4f8`, label in `#64748b` (small, uppercase)
- Card background: `#0f141a`, border: `#1e2a36`

### Chip colour tiers (tech stack card)
- AI/ML chips (Python, FastAPI, LLMs/RAG, XGBoost, Airflow): sky blue tint — `bg-sky-950/40 border-sky-800/30 text-sky-300`
- Frontend chips (React, Next.js, TypeScript): neutral — `bg-slate-900 border-slate-700 text-slate-300`
- Ops chips (Docker, PostgreSQL): dim — `bg-slate-900/50 border-slate-800 text-slate-500`

### Files
- `src/sections/About.jsx`
- `src/index.css` — add `.about-chip--ai`, `.about-chip--fe`, `.about-chip--ops` colour overrides

---

## Section 3 — Projects Section

### Remove
```jsx
// DELETE this line from Projects.jsx:
<img src={currentProject.spotlight} alt="spotlight" className="w-full h-96 object-cover rounded-xl" />
```

### Add — Editorial project number
- Add a `<span>` with the zero-padded project index (`01`, `02`, `03`...) as an absolutely-positioned decorative element inside the left panel
- Style: `position: absolute`, `top: -1rem`, `right: 1rem`, `font-size: 7rem`, `font-weight: 800`, `color: #0f1a24`, `letter-spacing: -0.04em`, `user-select: none`, `pointer-events: none`, `z-index: 0`
- Content panel sits at `position: relative`, `z-index: 1`

### Add — Top accent line
- `position: absolute`, `top: 0`, `left: 0`, `right: 0`, `height: 2px`
- `background: linear-gradient(to right, transparent, #38bdf8, transparent)`

### Navigation arrow colour
- Update `.arrow-btn` in `index.css` to use sky blue on hover

### Files
- `src/sections/Projects.jsx`
- `src/index.css`

---

## Section 4 — Hero Section

### Remove from Canvas `<group>`
```jsx
// DELETE these four components and their imports:
<Target position={sizes.targetPosition} />
<ReactLogo position={sizes.reactLogoPosition} />
<Cube position={sizes.cubePosition} />
<Rings position={sizes.ringPosition} />
```
- Remove `calculateSizes` references to `targetPosition`, `reactLogoPosition`, `cubePosition`, `ringPosition` (leave `deskPosition` and `deskScale`)

### Add — Floating stat cards
Three absolutely-positioned HTML cards outside the `<Canvas>`:

| Card | Content | Position (desktop) |
|------|---------|-------------------|
| A | `1.8M` / EPC records processed | `bottom-32 left-8` |
| B | `9×` / eval engine speedup | `top-40 right-8` |
| C | `Graduate Route ✓` / No sponsorship needed | `bottom-52 right-12` |

**Card structure:**
```jsx
<div className="stat-card hidden sm:flex flex-col gap-1" ref={cardRef}>
  <p className="stat-card_label">LABEL</p>
  <p className="stat-card_value">VALUE</p>
  <p className="stat-card_sub">sub text</p>
</div>
```

**CSS (`.stat-card` in index.css):**
```css
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
}
.stat-card_value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0f4f8;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.stat-card_sub {
  font-size: 0.65rem;
  color: #64748b;
}
```

**GSAP float animation:**
```js
useGSAP(() => {
  [cardARef, cardBRef, cardCRef].forEach((ref, i) => {
    gsap.to(ref.current, {
      y: '-=10',
      duration: 3 + i * 0.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.9,
    });
  });
}, []);
```

### Hero badge colours
Update `.hero-badge--ai`, `.hero-badge--fs`, `.hero-badge--ds` in `index.css` to sky blue palette (matching chip colour tiers in About).

### Files
- `src/sections/Hero.jsx`
- `src/index.css`

---

## Implementation Order

1. `tailwind.config.js` — colour tokens
2. `src/index.css` — all hardcoded accent colours, new classes (`.stat-card`, chip tiers, hero badges)
3. `src/sections/About.jsx` — remove images, add Impact card, chip class updates
4. `src/sections/Projects.jsx` — remove spotlight, add editorial number + accent line
5. `src/sections/Hero.jsx` — remove 3D objects, add floating stat cards with GSAP

## Testing Checklist

- [ ] Sky blue accent renders correctly across AI assistant, buttons, chips, hero badges
- [ ] About masonry layout doesn't break without images (check column balance)
- [ ] Impact Numbers card shows correct values
- [ ] Projects left panel: spotlight gone, editorial number visible behind content
- [ ] Projects: accent line renders at top of left panel
- [ ] Hero: no 3D floating objects visible
- [ ] Hero: 3 stat cards visible on desktop, hidden on mobile
- [ ] Hero: GSAP float animation running, staggered, not in sync
- [ ] Mobile layout: nothing broken by removed components
- [ ] Dev server runs clean with no console errors
