# Skill Constellation Implementation Plan

> **For agentic workers:** Use the approved skill constellation spec and complete this plan task by task.

**Goal:** Present all portfolio skills as an animated, keyboard-accessible constellation of category clusters and skill nodes.

**Architecture:** Keep `portfolioData.json` as the source of skill labels. Update `SkillsExplorer` in `Resume.jsx` to render semantic category and skill buttons, selected-skill detail, and staggered Motion nodes; use `workspace.css` for the connected constellation appearance and responsive layout.

**Tech Stack:** React 18, Motion, existing CSS, existing JSDOM behavior fixture.

**Spec:** `docs/superpowers/specs/2026-11-19-skill-constellation-design.md`

## Global Constraints

- Preserve current skill group keys and skill data.
- Keep every category and skill visible.
- Support pointer and keyboard selection with accessible state and detail text.
- Respect reduced-motion preferences and avoid looping animation.
- Add no dependencies; keep narrow layouts readable without horizontal scrolling.

## Review Focus

1. Every skill is represented by a real focusable control and no labels are lost.
2. Selecting a skill highlights its category and displays the skill and category context.
3. Keyboard focus updates the same context as pointer selection.
4. Small viewports reflow the nodes without overlap or horizontal overflow.
5. Reduced motion shows all nodes and selected states without entrance movement.

---

### Task 1: Build the animated skill constellation

**Files:**
- Modify: `src/sections/Resume.jsx`
- Modify: `src/workspace.css`
- Modify: `tests/resume-interaction.html`

**Interfaces:**
- Consume: `portfolioData.skills`, `skillGroups`, and existing `skillDescriptions`.
- Produce: category selectors (`.skill-group-selector`), focusable skill buttons (`.skill-node`), and a selected skill context panel (`.skills-context`).

- [x] Extend the behavior fixture to assert all skill labels render as focusable skill buttons; focusing and clicking a node updates its category and context panel, pointer hover previews it, and pointer exit restores the pinned selection.
- [x] Run `node /private/tmp/run-experience-interaction.mjs` and confirm the new node assertions fail because skills are static list items.
- [x] Implement semantic skill-node buttons. Selecting or focusing a node updates the active category and selected-skill detail; category selection clears the focused skill and retains the category summary.
- [x] Add restrained staggered node entrance as each category reaches the viewport; keep labels visible before entrance and disable motion through `useReducedMotion`.
- [x] Style category clusters as a connected constellation with distinct selected/focus states; use compact masonry columns on wide screens and a single column on narrow screens.
- [x] Run the focused interaction fixture, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.
- [x] Review keyboard focus, reduced motion, mobile reflow, and preservation of all skill data.

**Expected:** Every skill remains visible and keyboard reachable. Selecting a skill highlights it and its category and updates the detail panel. Motion is brief, staggered, and absent when reduced motion is enabled.
