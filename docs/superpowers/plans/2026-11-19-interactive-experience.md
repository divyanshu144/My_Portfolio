# Interactive Experience Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Experience, Education, and My Skills interactive and easy to explore.

**Architecture:** Keep the existing portfolio JSON as the source of role, education, and skill content. Build timeline controls, selected detail panels, and selectable skill groups in `Resume.jsx`, with responsive presentation and selection states in `workspace.css`; preserve role IDs and assistant actions.

**Tech Stack:** React, existing portfolio JSON, CSS, node:test or the repository's existing component-render harness.

**Spec:** `docs/superpowers/specs/2026-11-19-interactive-experience-design.md`

## Global Constraints

- Keep the current React and CSS architecture; no new dependencies.
- Preserve existing role IDs so assistant navigation and `goTo` continue to work.
- Selecting a role updates the detail panel without changing the URL or scrolling the page.
- Support mouse, touch, and keyboard selection with accessible selected state.
- Respect reduced-motion preferences; no autoplay or scroll hijacking.
- Education uses the same selector and detail-panel pattern for its two entries.
- Skills show all groups and chips at once; selecting a group highlights its chips and updates a short description and count.
- The selected main navigation tab is restored from session storage after a page reload.

## Review Focus

1. Existing assistant navigation to a role still targets the right timeline control.
2. Keyboard selection moves among roles and exposes the current selection; focus remains visible.
3. A role with optional/missing location or highlights renders without empty placeholders or errors.
4. At narrow widths, controls and details remain readable and reachable without horizontal overflow.
5. Reduced motion removes movement while preserving clear selected-state feedback.

---

### Task 1: Interactive role timeline and details

**Files:**
- Modify: `src/sections/Resume.jsx`
- Modify: `src/workspace.css`
- Test: add a focused test or use the existing render harness for `Resume` behavior

**Interfaces:**
- Consume `portfolioData.experience`, `portfolioData.assistant.askAbout`, and the existing `askAssistant(question)` event.
- Preserve `id={x.id}` on a stable role element for assistant catalog anchors.
- The timeline selects the first experience by default. A selected role displays title, company, dates, location when present, highlights, and the existing Ask about this action.

- [ ] Write a failing behavior check proving that selecting another role updates the detail panel, while the role's Ask about this action sends its existing question.
- [ ] Extend the behavior check to prove that selecting the second education entry updates its degree detail and that the first entry's dissertation remains visible when selected.
- [ ] Extend the behavior check to prove that all skill groups remain visible and selecting a group updates its pressed state, highlighted chips, count, and description.
- [ ] Run the focused check and confirm it fails because the current section has no role selection.
- [ ] Implement accessible role selection. Use ordinary buttons with `aria-pressed` or tabs with correct tab keyboard behavior; choose the simpler pattern that matches the rendered structure.
- [ ] Add responsive timeline/detail styling in `workspace.css`; retain a single-column layout on narrow screens and visible keyboard focus.
- [ ] Add a reduced-motion rule that removes panel movement while keeping selection changes obvious.
- [ ] Run the focused check, `npm run lint`, `npm test`, and `npm run build`.
- [ ] Review the diff for preserved IDs, assistant action, optional education fields, and unchanged skills.

**Expected:** All checks pass; role selection updates the visible detail panel without page scrolling, and existing assistant navigation still resolves the role ID.
