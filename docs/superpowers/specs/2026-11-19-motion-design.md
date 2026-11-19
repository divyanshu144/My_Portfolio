# Motion and transitions (design)

Date: 2026-11-19. Status: agreed with the owner in conversation; for a builder who cannot ask questions.

## Intent

The owner feels the Overview hero and the project cards are static, and wants the whole site to move smoothly and look good. From three mockups (responsive/cursor-reactive, ambient, scroll story) the owner chose **ambient**: gentle motion that is always present, even when the visitor does nothing. They also approved a before/after set of transitions (tab switching, the assistant console opening, hovers, the case-study disclosure).

Audience: recruiters and hiring managers. Motion is background life and polish, never something that competes with reading.

## Goals

1. **Ambient life on the Overview hero and on project cards only** (owner's choice):
   - Hero (`section.about-hero` in `src/sections/About.jsx`, and the area behind it): a slow, soft light drifting behind the hero; the dot grid sliding very slowly; the second headline line ("people actually do.") with a slow blue-to-cyan shimmer.
   - Project cards: a light travelling slowly around each card's border, and a very slight float, out of phase between cards so they never move in unison.
2. **Smooth transitions across the site**, as shown in the approved before/after mockup:
   - Switching tabs: the active-tab highlight in the top nav (`.workspace-nav`) glides from the old tab to the new one; the outgoing page fades out quickly and the incoming page rises in slightly.
   - The assistant console: slides up from the bottom on open and back down on close (today it appears/disappears instantly); Ask/Fit check panels crossfade; the console's height change for a fit check (and back) is animated.
   - Hovers: buttons brighten and lift by 1px; text links get an underline that draws in; suggestion chips and tags light up. Every hover has a matching keyboard-focus state.
   - "Engineering decisions & evidence" (`details.case-study-details` in `src/sections/Portfolio.jsx`): opens and closes with a smooth height change instead of snapping.
   - Fit-check result rows arrive one after another (short stagger). Answers keep their existing fade-in.
3. **One shared rhythm:** a single easing curve and three durations (quick ~150ms, normal ~250ms, slow ~400ms) defined once and used by all new and touched motion.

## Non-goals

- No ambient motion on reading areas: case studies, Experience, Notes, Contact stay calm (owner's choice).
- No scroll hijacking, smooth-scroll libraries, scroll-triggered storytelling or cursor-reactive effects (owner chose ambient over those).
- No change to the System explorer / case-study demos' existing animation or timings (`src/components/explorer/`).
- No 3D (Three.js / R3F), Lottie, Rive or other plugin stacks.

## Anti-goals (failures even if it works)

- Motion that pulls the eye away from text or makes the hero headline hard to read.
- Noticeable jank, battery drain or fan noise: ambient effects must be cheap to draw and must pause when off screen or when the browser tab is hidden. No continuously animated `filter: blur()` on large layers.
- Motion that ignores "reduce motion".
- Layout shift: nothing may push content around after load (cards float via transform only).
- A noticeably slower first load.

## Constraints

- React 18.3 + Vite. Styles: `src/workspace.css` (current look, imported last); do not edit `src/vcard.css`. Existing keyframes and the `prefers-reduced-motion` blocks live in `src/workspace.css` and `src/index.css`.
- Tabs are all mounted; inactive ones are `display: none` (`article` without `.active`). `article.active` currently plays `workspace-enter` (.45s). Switching is `select(id)` in `src/App.jsx`, which also focuses the page `h1`; `goTo(tab, anchor)` builds on it and scrolls after the next frame. Page transitions must not break `goTo`'s scroll-to-anchor or the focus move.
- The assistant console (`src/components/assistant/AssistantConsole.jsx`) is rendered by `src/components/AIAssistant.jsx`; its height comes from `--console-h` / `clampHeight`; `--console-reserve` keeps the page end clear; Escape/Ctrl+` and focus-return behaviour must be preserved.
- `npm test` (node:test) must stay green; lint clean; build passes.

## Approaches considered

1. **Plain CSS plus a little JavaScript**: zero download cost, matches how all existing motion is built, reduce-motion in one place. Weaker at exit animations and elements gliding between positions.
2. **Motion for React** (`motion` package, `motion/react`): excellent at exit animations, layout glides and staggered lists; ~35 KB gzipped more JavaScript; animated parts rewritten as motion components.
3. **GSAP**: strongest for scroll-driven timelines, which the owner did not choose; extra weight and an imperative style alongside React.

**Chosen (owner): a mix of 1 and 2.**
- **Motion for React** for things that enter, leave or glide: console slide in/out (exit animation), the nav highlight glide (shared layout), tab page exit/enter, the console height change, fit result row stagger, and the "Engineering decisions & evidence" unfold.
- **CSS** for everything ambient and every hover: hero glow, grid drift, headline shimmer, travelling border light, card float, button/link/chip hovers.

## Decided details

- Reduce motion: wrap the app in Motion's `MotionConfig reducedMotion="user"` and give every CSS effect a `prefers-reduced-motion: reduce` rule. Under reduce motion: ambient effects show a still frame (light and glow present, not moving); transitions are instant or a plain fade where a change would otherwise be hard to notice.
- Ambient effects pause when their element is off screen (IntersectionObserver toggling a class or `animation-play-state`) and when `document.visibilityState` is `hidden`.
- The drifting light is pre-blurred/gradient-based and animated with `transform`/`opacity` only (no animated blur); the travelling border light may use an animated custom property (`@property`) or a rotating gradient layer; both must stay at a steady 60fps on a mid-range laptop.
- Keep the existing demo-in fade for answers; keep `target-fade` for `goTo` highlights.
- Intensity reference: the owner picked mockup "B, ambient" (local copy, not committed: `.superpowers/brainstorm/91193-1795046862/content/motion-styles.html`). Treat it as the *upper bound*: the production version should be the same character but quieter (lower opacity glow, slower drift), so it reads as background life.

## Calls made while writing this (builder may revise, flagged for the owner)

- "Project cards" means both the Overview's "Built for the real world" cards (`a.about-project`) and the Projects tab's "More projects" cards (`li.more-project`). The large case studies are reading areas and stay calm apart from the disclosure unfold.
- Tab page transition: outgoing page fades out in ~120ms, incoming rises 8px and fades in over ~250ms. Because inactive tabs are `display: none`, the builder decides whether to animate with Motion's `AnimatePresence` (rendering only the active page) or keep all pages mounted and animate the incoming one; whichever is chosen must keep demos' state, `goTo` scrolling and focus behaviour working.
- Console: slide distance = its own height; open ~250ms, close ~200ms; the launcher stays hidden while the console is open, as today.
- Motion is loaded with the app (no lazy split) unless the build shows a noticeable size jump; report the before/after bundle size.

## Left to the builder

- Exact keyframes, colours (from the existing palette: `#83e3db`, `#a8bfff`, near-black surfaces), durations within the shared rhythm, stagger amounts.
- How to structure motion components and where the shared timing tokens live (CSS custom properties plus a small JS module for Motion).
- Whether any existing CSS animation (`workspace-enter`, `demo-in` on the console) is replaced by its Motion equivalent.

## Verification expected

- Lint, tests and build pass; report the JavaScript bundle size before and after.
- In a browser at desktop and 390px: each approved before/after row behaves like the right-hand mockup; ambient effects are visible on the Overview hero and project cards and absent from case studies, Experience, Notes and Contact; ambient effects pause off screen and with the tab hidden; with reduce motion emulated (DevTools rendering setting), nothing moves continuously and transitions are instant or fades.
- `goTo` jumps, "Ask about this", Play the example run, Escape/Ctrl+` and focus return still work.
- Performance: no long frames from ambient effects in a short Performance recording on the Overview.
