# Skill constellation

## Intent

Give My Skills a more memorable, animated presentation that feels at home in the portfolio's dark technical workspace while keeping the full skill set easy to scan.

## Goals

- Show skills as connected category clusters, with each skill represented as a readable node.
- Keep every category and skill visible without requiring a visitor to discover hidden content.
- Make categories and skill nodes respond to pointer and keyboard focus with clear selection feedback.
- Use restrained entrance and selection motion; disable movement when the visitor requests reduced motion.
- Preserve the current skill names and category data.

## Non-goals

- No automatic scrolling, autoplay, or continuously moving constellation.
- No new animation dependency or changes to other portfolio sections.

## Approaches

- Animated skill grid: highly readable and straightforward, but less distinctive.
- Moving ticker: immediately lively, but moves content away from visitors and makes comparison harder.
- Connected skill constellation: categories form clusters of linked skill nodes; selected nodes glow and their connections become clearer. This is the owner's chosen direction because it gives the section a more exploratory feel while retaining visible skill names.

## Design

Build the constellation in the existing Skills section and use its current skill data. Give each category a stable cluster with a prominent category label, visible skill nodes, and fine connecting lines. Clicking a category focuses its cluster; hovering or keyboard-focusing a skill node highlights that node and its cluster. Keep all names visible and provide a nearby text detail for the focused item so the visual treatment does not carry meaning through color alone. Use subtle staggered entrance and short selection transitions, with no looping motion. On narrow screens, reflow clusters into a single-column sequence without overlap or horizontal scrolling. Under `prefers-reduced-motion`, remove entrance movement and transitions while retaining selected and focus states.

## Constraints

- Keep React, the existing Motion package, and current CSS architecture; add no dependencies.
- Preserve the current skill group keys and skill data.
- Use semantic buttons for interactive category and skill controls, with keyboard focus and selected state exposed accessibly.
- Confirm readability, responsive layout, and keyboard behavior before considering the change complete.
