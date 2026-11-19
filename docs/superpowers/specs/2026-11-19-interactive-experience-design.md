# Interactive experience timeline

## Intent

Make the Experience section feel active and inviting to explore. Recruiters should be able to scan a career path, select a role, and read its details without losing the context of the timeline.

## Goals

- Present work experience as an interactive timeline with a clearly selected role and a detail panel.
- Keep role title, company, dates, and location easy to scan; reveal highlights for the selected role.
- Support mouse, touch, and keyboard selection with clear focus and selected states.
- Preserve the existing `Ask about this` action for roles and its assistant behavior.
- Match the dark workspace visual system and respect reduced-motion preferences.
- Make skill groups selectable so visitors can focus the related tools and read a short context note while every skill remains visible.

## Non-goals

- Education follows the same selectable timeline pattern, with qualification details in its own panel. The existing skill groups remain intact; AI & ML entries may be expanded when supported by project evidence.
- No autoplay, scroll hijacking, or forced step-by-step progression.
- No changes to portfolio data or assistant APIs.

## Approaches

- Expandable role cards: easy to build and compact, but provides little sense of career progression.
- Guided career story: expressive, but slows down people who want to scan or jump directly to a role.
- Interactive timeline with a selected-role detail panel: recommended and selected by the owner because it makes progression visible while leaving navigation in the visitor's control.

## Design

Use the existing experience data in `data/portfolioData.json`. Render roles as selectable timeline controls and show the selected role's title, company, dates, location, highlights, and `Ask about this` action in an adjacent detail panel on wide screens. On narrow screens, keep the timeline and detail panel in a single-column layout. The first role is selected initially. Selecting a role updates the detail panel without changing the URL or scrolling the page. Keyboard users can move among role controls and activate them with standard button keys; selected state is exposed accessibly.

Use subtle transitions for selection and panel changes, with a reduced-motion version that removes movement. Education gets a separate two-item timeline that shows each degree, institution, dates, grade, and dissertation when present. In My Skills, keep every group and chip visible, let a group button highlight its chips, and show a brief description and item count for the selected group. Expose selection through button state and keep all controls keyboard accessible.

## Constraints and implementation calls

- Keep the current React and CSS architecture; no new dependencies.
- Preserve existing role IDs so assistant navigation and `goTo` continue to work. Put each role ID on its timeline control or a stable containing element.
- Keep the complete experience content available when JavaScript interaction is unavailable or before hydration where practical.
- The builder may choose the exact geometry, responsive breakpoint, and whether role controls use tab semantics or ordinary buttons, provided keyboard access and selected state are clear.
