# Walking Avatar Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the floating "Ask Div" pill and full-screen chat modal with a small cartoon avatar that walks to a bike, rides along the bottom of the page dropping facts about Div, gets off to chat when hovered or tapped, and rides away when the chat closes. A synthesized bicycle bell rings while he sits down on the bike and is cut off when he starts riding.

**Architecture:** A pure state machine (`avatarMachine.js`) decides the phase. A hook (`useAvatarRoam`) owns timers and a `requestAnimationFrame` loop that moves the bike and rider by writing `transform` directly to DOM refs (no per-frame React renders). The character and bike are inline SVG styled and animated by CSS keyed off `data-*` attributes. The existing chat logic moves unchanged into `ChatPopup.jsx` (`useChat` + popup), and `AIAssistant.jsx` becomes a thin composer, so `App.jsx` does not change.

**Tech Stack:** React 18, Vite 5, inline SVG + CSS, Web Audio API, `node:test`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-30-walking-avatar-assistant-design.md`

## Global Constraints

- Work on branch `walking-avatar` (already checked out). Never commit to or push `main`. Never push at all unless the user asks.
- Stage files by explicit path only. **Never** `git add -A` / `git add .`: `vcard-personal-portfolio/` is untracked and must not be committed.
- Every commit ends with the trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (second `-m`).
- No new dependencies. `src/vcard.css` is never edited; all CSS goes in `src/index.css`.
- No em-dashes in any text a visitor can see (fact text, bubbles, labels).
- Facts contain only things the owner has stated (the 7 in the spec). Do not invent facts.
- Sound: only a short synthesized bicycle bell, played while he sits down on the bike (the `mounting` phase) and stopped when that phase ends. No sound switch, no audio files. It never plays without user activation, so the first-load intro is silent.
- Tab bar: below 1024px the vCard navbar is fixed to the bottom (about 62px). The avatar strip must sit above it (`--wa-bottom: 64px`) and must never cover a tab.
- `AIAssistant` keeps its default export and no props (so `src/App.jsx` is unchanged). The chat request/response handling (`/api/chat`, history, error text, markdown rendering) is moved, not rewritten.
- The Explainer tab is dropped from the UI. `/api/explain` stays on the server untouched.
- Tests use `node:test` + `node:assert/strict`; run with `npm test`. `npm run lint` and `npm run build` must be clean at the end of every task.

## Review Focus

Failure modes the spec implies but no obvious test names, most likely first. Each has a test or check in the task named in brackets.

1. **Chat history lost when the popup closes.** Closing and reopening must keep the conversation, because `useChat` lives in `AIAssistant`, not in the popup. [Task 6, manual check]
2. **Pointer leaves before he finishes dismounting.** He must not get stuck in `waiting`. The grace timer starts when he enters `waiting` and the pointer is not over him. [Task 1 reducer tests, Task 5 manual check]
3. **The bell keeps sounding into the ride, or after a hover interrupts the mount.** Leaving `mounting` for any reason must silence it. [Task 3 `stop()` tests, Task 5 hook cleanup]
4. **Web Audio missing or throwing.** No `AudioContext`, a throwing `currentTime`, or an oscillator that already ended must never throw. [Task 3]
5. **Narrow or resized viewport.** At 390px he must ride inside the screen, above the tab bar, the popup must fit, and a resize while riding must clamp positions. [Task 1 motion tests, Task 7 manual check]

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/avatar/avatarMachine.js` (+ test) | Pure reducer: phases, events, transitions |
| `src/components/avatar/motion.js` (+ test) | Pure geometry: speeds, bounds, step, ride targets, coast, seat offset, bubble shift |
| `src/components/avatar/facts.js` (+ test) | Shuffled no-repeat fact picker |
| `src/components/avatar/sound.js` (+ test) | Synthesized bicycle bell: `playBell()` and `stop()` |
| `src/components/avatar/AvatarFigure.jsx` | `ManArt` and `BikeArt` SVG |
| `src/components/avatar/useAvatarRoam.js` | Timers, rAF movement, hover/click handlers, fact bubbles |
| `src/components/avatar/WalkingAvatar.jsx` | Bike, actor and speech bubble markup |
| `src/components/avatar/ChatPopup.jsx` | `useChat`, markdown renderer, typing dots, `DivAvatar`, popup |
| `src/components/AIAssistant.jsx` (rewrite) | Composer: roam + chat + popup anchor |
| `src/index.css` | Old fab/modal/tab/explainer rules removed; avatar + popup rules added |
| `data/portfolioData.json` | New `avatarFacts` array |
| `avatar-preview.html`, `src/avatarPreview.jsx` | Throwaway dev preview page; deleted in Task 7 |
| `package.json`, `CLAUDE.md`, spec | Test glob, docs, spec state-list correction |

---

### Task 1: State machine, motion helpers, test glob

**Files:**
- Create: `src/components/avatar/avatarMachine.js`, `src/components/avatar/avatarMachine.test.js`, `src/components/avatar/motion.js`, `src/components/avatar/motion.test.js`
- Modify: `package.json` (test script), `docs/superpowers/specs/2026-09-30-walking-avatar-assistant-design.md` (state list correction)

**Interfaces:**
- Produces from `avatarMachine.js`: `PHASE` (`ARRIVING, WALKING_TO_BIKE, MOUNTING, RIDING, BRAKING, DISMOUNTING, WAITING, CHATTING, PARKED` with string values `'arriving'`, `'walkingToBike'`, `'mounting'`, `'riding'`, `'braking'`, `'dismounting'`, `'waiting'`, `'chatting'`, `'parked'`), `EVENT` (`START, INTRO_BEGIN, REACHED_BIKE, MOUNT_DONE, HOVER_START, BRAKE_DONE, DISMOUNT_DONE, GRACE_ELAPSED, OPEN_CHAT, CLOSE_CHAT`, values equal to their names), `avatarReducer(state, event) => state` where `state = { phase, pendingChat: boolean, reducedMotion: boolean }` and `event = { type, ...payload }` (`START` payload: `{ introDone, reducedMotion }`).
- Produces from `motion.js`: constants `WALK_SPEED=45`, `RIDE_SPEED=110`, `COAST_SPEED=160`, `MAN_W=60`, `BIKE_W=100`, `MARGIN=16`, `SEAT_DX=10`, `SEAT_DX_FLIPPED=32`, `INTRO_GAP=190`, `COAST_DISTANCE=80`; functions `clamp(v, lo, hi)`, `stepToward(x, target, speed, dt)`, `riderBounds(vw) => {min,max}`, `seatX(bikeX, facing)`, `introPositions(vw) => {bike, man}`, `pickRideTarget({current,min,max,rng?,minDistance?})`, `coastBikeX(bikeX, facing, min, max)`, `bubbleShift(centerX, width, vw, pad?)`.

- [ ] **Step 1: Add the avatar tests to the test script**

In `package.json`, change the `test` script to:

```json
    "test": "node --test \"api/_lib/*.test.js\" \"src/lib/*.test.js\" \"src/components/avatar/*.test.js\"",
```

- [ ] **Step 2: Write the failing state machine tests**

`src/components/avatar/avatarMachine.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { avatarReducer, EVENT, PHASE } from './avatarMachine.js';

const at = (phase, extra = {}) => ({ phase, pendingChat: false, reducedMotion: false, ...extra });
const run = (state, ...events) =>
  events.reduce((s, e) => avatarReducer(s, typeof e === 'string' ? { type: e } : e), state);

test('START picks the starting phase', () => {
  assert.equal(avatarReducer(at(null), { type: EVENT.START, introDone: false, reducedMotion: false }).phase, PHASE.ARRIVING);
  assert.equal(avatarReducer(at(null), { type: EVENT.START, introDone: true, reducedMotion: false }).phase, PHASE.RIDING);
  const parked = avatarReducer(at(null), { type: EVENT.START, introDone: false, reducedMotion: true });
  assert.equal(parked.phase, PHASE.PARKED);
  assert.equal(parked.reducedMotion, true);
});

test('intro: arrive, walk to the bike, mount, ride', () => {
  const s = run(at(PHASE.ARRIVING), EVENT.INTRO_BEGIN, EVENT.REACHED_BIKE, EVENT.MOUNT_DONE);
  assert.equal(s.phase, PHASE.RIDING);
});

test('hover while riding: brake, dismount, wait; then the grace timer sends him back to the bike', () => {
  let s = run(at(PHASE.RIDING), EVENT.HOVER_START);
  assert.equal(s.phase, PHASE.BRAKING);
  s = run(s, EVENT.BRAKE_DONE);
  assert.equal(s.phase, PHASE.DISMOUNTING);
  s = run(s, EVENT.DISMOUNT_DONE);
  assert.equal(s.phase, PHASE.WAITING);
  s = run(s, EVENT.GRACE_ELAPSED);
  assert.equal(s.phase, PHASE.WALKING_TO_BIKE);
  s = run(s, EVENT.REACHED_BIKE, EVENT.MOUNT_DONE);
  assert.equal(s.phase, PHASE.RIDING);
});

test('click while waiting opens the chat; closing sends him back to the bike', () => {
  let s = run(at(PHASE.WAITING), EVENT.OPEN_CHAT);
  assert.equal(s.phase, PHASE.CHATTING);
  s = run(s, EVENT.CLOSE_CHAT);
  assert.equal(s.phase, PHASE.WALKING_TO_BIKE);
});

test('tap while riding: brake, dismount, then open the chat without waiting', () => {
  let s = run(at(PHASE.RIDING), EVENT.OPEN_CHAT);
  assert.equal(s.phase, PHASE.BRAKING);
  assert.equal(s.pendingChat, true);
  s = run(s, EVENT.BRAKE_DONE, EVENT.DISMOUNT_DONE);
  assert.equal(s.phase, PHASE.CHATTING);
  assert.equal(s.pendingChat, false);
});

test('OPEN_CHAT while braking or dismounting is remembered', () => {
  for (const phase of [PHASE.BRAKING, PHASE.DISMOUNTING]) {
    const s = avatarReducer(at(phase), { type: EVENT.OPEN_CHAT });
    assert.equal(s.phase, phase);
    assert.equal(s.pendingChat, true);
  }
});

test('hover on the ground goes straight to waiting; hover while seated brakes', () => {
  assert.equal(avatarReducer(at(PHASE.WALKING_TO_BIKE), { type: EVENT.HOVER_START }).phase, PHASE.WAITING);
  assert.equal(avatarReducer(at(PHASE.ARRIVING), { type: EVENT.HOVER_START }).phase, PHASE.WAITING);
  assert.equal(avatarReducer(at(PHASE.MOUNTING), { type: EVENT.HOVER_START }).phase, PHASE.BRAKING);
});

test('illegal events are ignored and return the same state object', () => {
  const cases = [
    [PHASE.RIDING, EVENT.GRACE_ELAPSED],
    [PHASE.WAITING, EVENT.MOUNT_DONE],
    [PHASE.RIDING, EVENT.BRAKE_DONE],
    [PHASE.RIDING, EVENT.CLOSE_CHAT],
    [PHASE.CHATTING, EVENT.HOVER_START],
    [PHASE.ARRIVING, EVENT.REACHED_BIKE],
  ];
  for (const [phase, type] of cases) {
    const s = at(phase);
    assert.equal(avatarReducer(s, { type }), s, `${phase} + ${type}`);
  }
  const s = at(PHASE.RIDING);
  assert.equal(avatarReducer(s, { type: 'NOPE' }), s);
});

test('reduced motion: stays parked, chat still opens and closes back to parked', () => {
  const parked = at(PHASE.PARKED, { reducedMotion: true });
  assert.equal(avatarReducer(parked, { type: EVENT.HOVER_START }), parked);
  let s = avatarReducer(parked, { type: EVENT.OPEN_CHAT });
  assert.equal(s.phase, PHASE.CHATTING);
  s = avatarReducer(s, { type: EVENT.CLOSE_CHAT });
  assert.equal(s.phase, PHASE.PARKED);
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npm test`
Expected: FAIL, cannot find `./avatarMachine.js`.

- [ ] **Step 4: Implement the reducer**

`src/components/avatar/avatarMachine.js`:

```js
export const PHASE = {
  ARRIVING: 'arriving',            // standing a few steps from the bike
  WALKING_TO_BIKE: 'walkingToBike', // intro walk, and every return to the bike
  MOUNTING: 'mounting',            // hopping on (bell plays here)
  RIDING: 'riding',
  BRAKING: 'braking',
  DISMOUNTING: 'dismounting',      // he stays put, the bike coasts ahead
  WAITING: 'waiting',              // standing beside the bike, "Want to chat?"
  CHATTING: 'chatting',            // popup open
  PARKED: 'parked',                // reduced motion: seated, not moving
};

export const EVENT = {
  START: 'START',
  INTRO_BEGIN: 'INTRO_BEGIN',
  REACHED_BIKE: 'REACHED_BIKE',
  MOUNT_DONE: 'MOUNT_DONE',
  HOVER_START: 'HOVER_START',
  BRAKE_DONE: 'BRAKE_DONE',
  DISMOUNT_DONE: 'DISMOUNT_DONE',
  GRACE_ELAPSED: 'GRACE_ELAPSED',
  OPEN_CHAT: 'OPEN_CHAT',
  CLOSE_CHAT: 'CLOSE_CHAT',
};

export function avatarReducer(state, event) {
  const { phase } = state;
  const to = (next, extra = {}) => ({ ...state, phase: next, ...extra });

  switch (event.type) {
    case EVENT.START:
      if (event.reducedMotion) return { phase: PHASE.PARKED, pendingChat: false, reducedMotion: true };
      return { phase: event.introDone ? PHASE.RIDING : PHASE.ARRIVING, pendingChat: false, reducedMotion: false };

    case EVENT.INTRO_BEGIN:
      return phase === PHASE.ARRIVING ? to(PHASE.WALKING_TO_BIKE) : state;

    case EVENT.REACHED_BIKE:
      return phase === PHASE.WALKING_TO_BIKE ? to(PHASE.MOUNTING) : state;

    case EVENT.MOUNT_DONE:
      return phase === PHASE.MOUNTING ? to(PHASE.RIDING) : state;

    case EVENT.HOVER_START:
      if (state.reducedMotion) return state;
      if (phase === PHASE.RIDING || phase === PHASE.MOUNTING) return to(PHASE.BRAKING);
      if (phase === PHASE.ARRIVING || phase === PHASE.WALKING_TO_BIKE) return to(PHASE.WAITING);
      return state;

    case EVENT.BRAKE_DONE:
      return phase === PHASE.BRAKING ? to(PHASE.DISMOUNTING) : state;

    case EVENT.DISMOUNT_DONE:
      if (phase !== PHASE.DISMOUNTING) return state;
      return state.pendingChat ? to(PHASE.CHATTING, { pendingChat: false }) : to(PHASE.WAITING);

    case EVENT.GRACE_ELAPSED:
      return phase === PHASE.WAITING ? to(PHASE.WALKING_TO_BIKE) : state;

    case EVENT.OPEN_CHAT:
      switch (phase) {
        case PHASE.WAITING:
        case PHASE.PARKED:
        case PHASE.ARRIVING:
        case PHASE.WALKING_TO_BIKE:
          return to(PHASE.CHATTING);
        case PHASE.RIDING:
        case PHASE.MOUNTING:
          return to(PHASE.BRAKING, { pendingChat: true });
        case PHASE.BRAKING:
        case PHASE.DISMOUNTING:
          return state.pendingChat ? state : to(phase, { pendingChat: true });
        default:
          return state;
      }

    case EVENT.CLOSE_CHAT:
      return phase === PHASE.CHATTING ? to(state.reducedMotion ? PHASE.PARKED : PHASE.WALKING_TO_BIKE) : state;

    default:
      return state;
  }
}
```

- [ ] **Step 5: Run to verify the machine passes**

Run: `npm test`
Expected: all machine tests pass.

- [ ] **Step 6: Write the failing motion tests**

`src/components/avatar/motion.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIKE_W, INTRO_GAP, MARGIN,
  bubbleShift, clamp, coastBikeX, introPositions, pickRideTarget, riderBounds, seatX, stepToward,
} from './motion.js';

test('clamp keeps a value inside the range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(30, 0, 10), 10);
});

test('stepToward moves by speed*dt and never overshoots', () => {
  assert.equal(stepToward(0, 100, 50, 0.5), 25);
  assert.equal(stepToward(100, 0, 50, 0.5), 75);
  assert.equal(stepToward(98, 100, 50, 0.5), 100);
  assert.equal(stepToward(100, 100, 50, 0.5), 100);
});

test('riderBounds leaves room for the bike and never inverts', () => {
  assert.deepEqual(riderBounds(1560), { min: MARGIN, max: 1560 - BIKE_W - MARGIN });
  assert.deepEqual(riderBounds(100), { min: MARGIN, max: MARGIN });
});

test('seatX depends on which way the bike faces', () => {
  assert.equal(seatX(100, 1), 110);
  assert.equal(seatX(100, -1), 132);
});

test('introPositions starts him INTRO_GAP behind the seat, on wide and narrow screens', () => {
  for (const vw of [1560, 390]) {
    const { bike, man } = introPositions(vw);
    const { min, max } = riderBounds(vw);
    assert.ok(bike >= min && bike <= max, `bike in bounds at ${vw}`);
    assert.equal(seatX(bike, 1) - man, INTRO_GAP);
    assert.ok(man >= MARGIN);
  }
  const tiny = introPositions(200);
  assert.ok(tiny.man >= MARGIN);
});

test('pickRideTarget stays inside the bounds for any random value', () => {
  for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
    const t = pickRideTarget({ current: 300, min: 16, max: 1000, rng: () => r });
    assert.ok(t >= 16 && t <= 1000, `r=${r} -> ${t}`);
  }
});

test('pickRideTarget avoids tiny moves when there is room', () => {
  const t = pickRideTarget({ current: 500, min: 0, max: 1000, rng: () => 0.5 });
  assert.ok(Math.abs(t - 500) >= 140);
});

test('pickRideTarget handles a degenerate range', () => {
  assert.equal(pickRideTarget({ current: 16, min: 16, max: 16 }), 16);
  assert.equal(pickRideTarget({ current: 50, min: 100, max: 90 }), 100);
});

test('coastBikeX rolls ahead, flips near an edge, and clamps in a tiny range', () => {
  assert.equal(coastBikeX(300, 1, 16, 1000), 380);
  assert.equal(coastBikeX(300, -1, 16, 1000), 220);
  assert.equal(coastBikeX(950, 1, 16, 1000), 870);
  assert.equal(coastBikeX(40, -1, 16, 1000), 120);
  assert.equal(coastBikeX(16, 1, 16, 16), 16);
});

test('bubbleShift keeps a bubble inside the viewport', () => {
  assert.equal(bubbleShift(500, 200, 1000), 0);
  assert.equal(bubbleShift(40, 200, 1000), 68);    // left edge would be -60, pad 8
  assert.equal(bubbleShift(980, 200, 1000), -88);  // right edge would be 1080, limit 992
  assert.ok(bubbleShift(100, 2000, 500) >= 0);
});
```

- [ ] **Step 7: Run to verify failure, then implement**

Run: `npm test`
Expected: FAIL, cannot find `./motion.js`.

`src/components/avatar/motion.js`:

```js
export const WALK_SPEED = 45;      // px per second
export const RIDE_SPEED = 110;
export const COAST_SPEED = 160;
export const MAN_W = 60;
export const BIKE_W = 100;
export const MARGIN = 16;
export const SEAT_DX = 10;         // man left edge = bike left edge + this, bike facing right
export const SEAT_DX_FLIPPED = 32; // same, bike facing left (the pair mirrors about the bike centre)
export const INTRO_GAP = 190;      // how far behind the seat he starts
export const COAST_DISTANCE = 80;

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export const stepToward = (x, target, speed, dt) => {
  const dist = target - x;
  const step = speed * dt;
  return Math.abs(dist) <= step ? target : x + Math.sign(dist) * step;
};

export const riderBounds = (viewportWidth) => ({
  min: MARGIN,
  max: Math.max(MARGIN, viewportWidth - BIKE_W - MARGIN),
});

export const seatX = (bikeX, facing) => bikeX + (facing === -1 ? SEAT_DX_FLIPPED : SEAT_DX);

export const introPositions = (viewportWidth) => {
  const { min, max } = riderBounds(viewportWidth);
  const bike = clamp(Math.round(viewportWidth * 0.55), Math.min(min + INTRO_GAP, max), max);
  const man = Math.max(MARGIN, seatX(bike, 1) - INTRO_GAP);
  return { bike, man };
};

export const pickRideTarget = ({ current, min, max, rng = Math.random, minDistance = 140 }) => {
  if (max <= min) return min;
  const span = max - min;
  let target = min + rng() * span;
  if (Math.abs(target - current) < minDistance) {
    target = current - min > max - current ? min + rng() * span * 0.3 : max - rng() * span * 0.3;
  }
  return clamp(target, min, max);
};

export const coastBikeX = (bikeX, facing, min, max) => {
  const ahead = bikeX + facing * COAST_DISTANCE;
  if (ahead >= min && ahead <= max) return ahead;
  const behind = bikeX - facing * COAST_DISTANCE;
  return clamp(behind >= min && behind <= max ? behind : ahead, min, max);
};

// Horizontal shift (px) that keeps a bubble of `width` centred on `centerX` inside the viewport.
export const bubbleShift = (centerX, width, viewportWidth, pad = 8) => {
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  if (left < pad) return pad - left;
  if (right > viewportWidth - pad) return viewportWidth - pad - right;
  return 0;
};
```

- [ ] **Step 8: Run to verify all pass**

Run: `npm test`
Expected: all tests pass (previous 21 plus the new ones).

- [ ] **Step 9: Correct the spec's state list** (the implementation reuses `walkingToBike` for returning to the bike, so there is no separate `remounting` phase)

```bash
python3 - <<'EOF'
p='docs/superpowers/specs/2026-09-30-walking-avatar-assistant-design.md'
s=open(p).read()
def rep(a,b):
    global s
    assert a in s, a
    s=s.replace(a,b,1)
rep("States: `arriving`, `walkingToBike`, `mounting`, `riding`, `braking`, `dismounting`, `waiting`, `chatting`, `remounting`.",
    "States: `arriving`, `walkingToBike`, `mounting`, `riding`, `braking`, `dismounting`, `waiting`, `chatting`, and `parked` (reduced motion). Returning to the bike after a chat or a hover reuses `walkingToBike` then `mounting`; there is no separate remounting state.")
rep("| `waiting` | hover ends for 2 s | `remounting` |","| `waiting` | hover ends for 2 s | `walkingToBike` |")
rep("| `chatting` | close (X / Esc / outside) | `remounting` |","| `chatting` | close (X / Esc / outside) | `walkingToBike` |")
rep("| `remounting` | animation end | `riding` |\n","")
rep("The reducer is a pure function","On dismount he stays exactly where he is (so the pointer is still over him) and the bike coasts about 80 px ahead. The reducer is a pure function")
open(p,'w').write(s)
EOF
git diff --stat docs/
```
Expected: the spec file shows a small diff.

- [ ] **Step 10: Lint, then commit**

Run: `npm run lint` (clean). Then:

```bash
git add package.json src/components/avatar/avatarMachine.js src/components/avatar/avatarMachine.test.js src/components/avatar/motion.js src/components/avatar/motion.test.js docs/superpowers/specs/2026-09-30-walking-avatar-assistant-design.md
git commit -m "feat(avatar): add pure state machine and motion helpers" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Fact picker and facts data

**Files:**
- Create: `src/components/avatar/facts.js`, `src/components/avatar/facts.test.js`
- Modify: `data/portfolioData.json` (add `avatarFacts`)

**Interfaces:**
- Produces: `createFactPicker(facts, rng?) => { next(): string | null }`. Shuffles, returns each fact once per cycle, never the same fact twice in a row across cycles (when there is more than one), returns `null` for an empty or invalid list.
- Produces data: `portfolioData.avatarFacts: string[]`.

- [ ] **Step 1: Write the failing tests**

`src/components/avatar/facts.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createFactPicker } from './facts.js';

const seeded = (values) => { let i = 0; return () => values[i++ % values.length]; };
const FACTS = ['a', 'b', 'c', 'd'];

test('returns every fact exactly once per cycle', () => {
  const pick = createFactPicker(FACTS, seeded([0.1, 0.7, 0.3, 0.9, 0.5]));
  const cycle = [pick.next(), pick.next(), pick.next(), pick.next()];
  assert.deepEqual([...cycle].sort(), FACTS);
});

test('never repeats the same fact back to back, even across cycles', () => {
  const pick = createFactPicker(FACTS, seeded([0, 0, 0, 0, 0.99, 0.5, 0.2]));
  let prev = pick.next();
  for (let i = 0; i < 40; i++) {
    const cur = pick.next();
    assert.notEqual(cur, prev);
    prev = cur;
  }
});

test('a single fact repeats (nothing else to show)', () => {
  const pick = createFactPicker(['only']);
  assert.equal(pick.next(), 'only');
  assert.equal(pick.next(), 'only');
});

test('empty, missing and blank facts give null', () => {
  assert.equal(createFactPicker([]).next(), null);
  assert.equal(createFactPicker(undefined).next(), null);
  assert.equal(createFactPicker(['', '  ', 5]).next(), null);
});
```

- [ ] **Step 2: Run to verify failure, then implement**

Run: `npm test` (FAIL, cannot find `./facts.js`).

`src/components/avatar/facts.js`:

```js
export function createFactPicker(facts, rng = Math.random) {
  const list = Array.isArray(facts) ? facts.filter((f) => typeof f === 'string' && f.trim()) : [];
  let queue = [];
  let last = null;

  const refill = () => {
    queue = [...list];
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    // next() pops from the end: keep the same fact from appearing twice in a row across cycles
    if (queue.length > 1 && queue[queue.length - 1] === last) {
      [queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]];
    }
  };

  return {
    next() {
      if (!list.length) return null;
      if (!queue.length) refill();
      last = queue.pop();
      return last;
    },
  };
}
```

- [ ] **Step 3: Run to verify pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Add the facts to the data file**

In `data/portfolioData.json`, add this array directly after the `"aboutCards": [ ... ],` entry (before `"skills"`):

```json
  "avatarFacts": [
    "Cut inference cost 73% on JobFit.",
    "MSc Statistical Data Science, University of Exeter (Merit).",
    "Rebuilt a refund review flow used across 60+ government contracts.",
    "Took a prompt test set from 40% to 100% pass rate.",
    "Plays guitar and reads books.",
    "Works part time as a barista at Starbucks.",
    "Learns something new every day."
  ],
```

Verify: `node -e "const d=require('./data/portfolioData.json');console.log(d.avatarFacts.length, JSON.stringify(d.avatarFacts).includes('—'))"` prints `7 false`.

- [ ] **Step 5: Commit**

```bash
npm run lint
git add src/components/avatar/facts.js src/components/avatar/facts.test.js data/portfolioData.json
git commit -m "feat(avatar): add no-repeat fact picker and avatarFacts data" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Bicycle bell

**Files:**
- Create: `src/components/avatar/sound.js`, `src/components/avatar/sound.test.js`

**Interfaces:**
- Produces: `createSound(deps?) => { playBell(): boolean, stop(): void }`.
  - `deps` (optional, default to browser globals): `getAudioContext()`, `userActive()`.
  - `playBell` returns `true` only if the page has had user activation, an `AudioContext` exists and scheduling succeeded; it never throws. Any bell still sounding is stopped first. The bell is two dings (about 0.55 s in total) built from sine partials.
  - `stop` immediately stops and disconnects every oscillator and gain still sounding; harmless when nothing is playing; never throws.

- [ ] **Step 1: Write the failing tests**

`src/components/avatar/sound.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSound } from './sound.js';

const fakeContext = ({ throwOnStop = false, state = 'running' } = {}) => {
  const ctx = { started: 0, immediateStops: 0, disconnects: 0, resumed: 0, currentTime: 0, state, destination: {} };
  ctx.resume = () => { ctx.resumed++; };
  ctx.createGain = () => ({
    gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    connect() {},
    disconnect() { ctx.disconnects++; },
  });
  ctx.createOscillator = () => ({
    type: '',
    frequency: { value: 0 },
    connect() {},
    start() { ctx.started++; },
    stop(when) {
      if (when === undefined) {
        ctx.immediateStops++;
        if (throwOnStop) throw new Error('InvalidStateError');
      }
    },
  });
  return ctx;
};

const make = (ctx, active = true) => createSound({ getAudioContext: () => ctx, userActive: () => active });

test('the bell stays silent before the visitor has interacted with the page', () => {
  const ctx = fakeContext();
  assert.equal(make(ctx, false).playBell(), false);
  assert.equal(ctx.started, 0);
});

test('the bell plays two dings, three partials each, when the page is active', () => {
  const ctx = fakeContext();
  assert.equal(make(ctx).playBell(), true);
  assert.equal(ctx.started, 6);
});

test('a suspended audio context is resumed', () => {
  const ctx = fakeContext({ state: 'suspended' });
  make(ctx).playBell();
  assert.equal(ctx.resumed, 1);
});

test('no Web Audio, or a context that throws while scheduling, never throws', () => {
  assert.equal(createSound({ getAudioContext: () => null, userActive: () => true }).playBell(), false);
  const broken = createSound({
    getAudioContext: () => ({ get currentTime() { throw new Error('boom'); } }),
    userActive: () => true,
  });
  assert.equal(broken.playBell(), false);
  assert.doesNotThrow(() => broken.stop());
});

test('stop silences every oscillator and disconnects both dings', () => {
  const ctx = fakeContext();
  const sound = make(ctx);
  sound.playBell();
  sound.stop();
  assert.equal(ctx.immediateStops, 6);
  assert.equal(ctx.disconnects, 2);
});

test('stop is harmless when nothing is playing and does nothing the second time', () => {
  const ctx = fakeContext();
  const sound = make(ctx);
  assert.doesNotThrow(() => sound.stop());
  sound.playBell();
  sound.stop();
  sound.stop();
  assert.equal(ctx.immediateStops, 6);
});

test('stop swallows errors from oscillators that already ended', () => {
  const ctx = fakeContext({ throwOnStop: true });
  const sound = make(ctx);
  sound.playBell();
  assert.doesNotThrow(() => sound.stop());
});

test('a new bell replaces the one that is still sounding', () => {
  const ctx = fakeContext();
  const sound = make(ctx);
  sound.playBell();
  sound.playBell();
  assert.equal(ctx.immediateStops, 6);
  assert.equal(ctx.started, 12);
});
```

- [ ] **Step 2: Run to verify failure, then implement**

Run: `npm test` (FAIL, cannot find `./sound.js`).

`src/components/avatar/sound.js`:

```js
const ding = (ctx, at, freq, live) => {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, at);
  master.gain.exponentialRampToValueAtTime(0.18, at + 0.006);
  master.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
  master.connect(ctx.destination);
  live.masters.push(master);
  [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach(([mult, level]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + 0.45);
    live.oscillators.push(osc);
  });
};

export function createSound(deps = {}) {
  const getAudioContext = deps.getAudioContext ?? (() => {
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  });
  const userActive = deps.userActive ?? (() => globalThis.navigator?.userActivation?.hasBeenActive ?? true);

  let ctx = null;
  let live = { oscillators: [], masters: [] };

  const stop = () => {
    const { oscillators, masters } = live;
    live = { oscillators: [], masters: [] };
    oscillators.forEach((o) => { try { o.stop(); } catch { /* already ended */ } });
    masters.forEach((m) => { try { m.disconnect(); } catch { /* already disconnected */ } });
  };

  return {
    playBell() {
      if (!userActive()) return false;
      try {
        ctx = ctx ?? getAudioContext();
        if (!ctx) return false;
        stop();
        if (ctx.state === 'suspended') ctx.resume?.();
        const t = ctx.currentTime;
        ding(ctx, t, 1568, live);
        ding(ctx, t + 0.16, 2093, live);
        return true;
      } catch {
        stop();
        return false;
      }
    },
    stop,
  };
}
```

- [ ] **Step 3: Run to verify pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Lint and commit**

```bash
npm run lint
git add src/components/avatar/sound.js src/components/avatar/sound.test.js
git commit -m "feat(avatar): add synthesized bicycle bell with stop" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Character and bike art, styles, preview page

**Files:**
- Create: `src/components/avatar/AvatarFigure.jsx`, `avatar-preview.html`, `src/avatarPreview.jsx`
- Modify: `src/index.css` (append the avatar art rules; the old assistant rules are removed in Task 6)

**Interfaces:**
- Produces: `ManArt` and `BikeArt` React components (no props). Styling contract, used by later tasks:
  - `.wa-actor` (`data-pose="ground"|"seated"`, `data-facing="1"|"-1"`, `data-moving="0"|"1"`, `data-hop="0"|"1"`) contains `.wa-man` (button) containing `ManArt`.
  - `.wa-bike` (`data-facing`, `data-moving`) contains `BikeArt`.
  - Both `.wa-actor` and `.wa-bike` are absolutely positioned at `left: 0; bottom: 0` inside `.wa`, and moved with `transform: translate3d(x,0,0)`.

- [ ] **Step 1: Create the SVG components**

`src/components/avatar/AvatarFigure.jsx`:

```jsx
const Head = () => (
  <>
    <circle className="wa-skin" cx="0" cy="0" r="11" />
    <path className="wa-hair" d="M-11 -2 Q-11 -13 0 -13 Q11 -13 11 -3 Q7 -8 0 -7 Q-7 -7 -11 -2Z" />
    <circle className="wa-eye" cx="5" cy="1" r="1.4" />
  </>
);

// 60 x 92 box, feet on the bottom edge. Faces right; CSS mirrors it for `data-facing="-1"`.
export const ManArt = () => (
  <svg className="wa-man-svg" viewBox="0 0 60 92" width="60" height="92" aria-hidden="true" focusable="false">
    {/* standing / walking */}
    <g className="wa-pose wa-pose--ground">
      <g className="wa-leg wa-leg--back">
        <rect className="wa-pants" x="23" y="56" width="9" height="30" rx="4" />
        <rect className="wa-shoe" x="22" y="84" width="14" height="8" rx="4" />
      </g>
      <g className="wa-arm wa-arm--back">
        <rect className="wa-hoodie-dark" x="14" y="31" width="8" height="26" rx="4" />
      </g>
      <rect className="wa-hoodie" x="17" y="28" width="26" height="34" rx="10" />
      <g className="wa-leg wa-leg--front">
        <rect className="wa-pants" x="29" y="56" width="9" height="30" rx="4" />
        <rect className="wa-shoe" x="28" y="84" width="14" height="8" rx="4" />
      </g>
      <g className="wa-arm wa-arm--front">
        <rect className="wa-hoodie" x="38" y="31" width="8" height="26" rx="4" />
      </g>
      <g transform="translate(30 17)"><Head /></g>
    </g>

    {/* seated on the bike: hips on the saddle, hands on the bar, feet on the pedals */}
    <g className="wa-pose wa-pose--seated">
      <g className="wa-seated-leg wa-seated-leg--a">
        <polyline className="wa-line wa-line--pants" points="30,52 44,62 34,77" />
        <rect className="wa-shoe" x="29" y="75" width="12" height="5" rx="2.5" />
      </g>
      <g transform="rotate(14 30 52)">
        <rect className="wa-hoodie" x="19" y="24" width="22" height="32" rx="9" />
      </g>
      <g className="wa-seated-leg wa-seated-leg--b">
        <polyline className="wa-line wa-line--pants" points="30,52 46,60 40,74" />
        <rect className="wa-shoe" x="35" y="72" width="12" height="5" rx="2.5" />
      </g>
      <line className="wa-line wa-line--arm" x1="36" y1="33" x2="62" y2="49" />
      <g transform="translate(39 19) rotate(8)"><Head /></g>
    </g>
  </svg>
);

// 100 x 58 box, wheel bottoms on the bottom edge. Faces right.
export const BikeArt = () => (
  <svg className="wa-bike-svg" viewBox="0 0 100 58" width="100" height="58" aria-hidden="true" focusable="false">
    <g className="wa-wheel wa-wheel--rear">
      <circle className="wa-tyre" cx="20" cy="44" r="13" />
      <path className="wa-spoke" d="M20 31V57M7 44H33M10.8 34.8L29.2 53.2M29.2 34.8L10.8 53.2" />
    </g>
    <g className="wa-wheel wa-wheel--front">
      <circle className="wa-tyre" cx="80" cy="44" r="13" />
      <path className="wa-spoke" d="M80 31V57M67 44H93M70.8 34.8L89.2 53.2M89.2 34.8L70.8 53.2" />
    </g>
    <path className="wa-frame" d="M20 44 L40 22 L70 22 L45 44 Z M40 22 L45 44 M70 22 L80 44 M70 22 L69 14 M64 14 L75 14 M40 22 L38 17" />
    <rect className="wa-saddle" x="31" y="14" width="14" height="4" rx="2" />
    <g className="wa-crank">
      <line className="wa-frame" x1="45" y1="44" x2="45" y2="52" />
      <rect className="wa-pedal" x="41" y="51" width="8" height="3" rx="1.5" />
    </g>
  </svg>
);
```

- [ ] **Step 2: Append the art rules to `src/index.css`**

Append at the end of the file:

```css
/* ─── Walking avatar: art ─────────────────────────────────────── */
:root {
  --wa-bottom: 0px;
  --wa-hoodie: hsl(45, 100%, 72%);
  --wa-hoodie-dark: hsl(40, 78%, 52%);
  --wa-skin: #f1c8a5;
  --wa-hair: #2a1f18;
  --wa-pants: #34344a;
  --wa-shoe: #f1f1f1;
  --wa-frame: hsl(35, 100%, 62%);
}
@media (max-width: 1023px) { :root { --wa-bottom: 64px; } }

.wa-hoodie { fill: var(--wa-hoodie); }
.wa-hoodie-dark { fill: var(--wa-hoodie-dark); }
.wa-skin { fill: var(--wa-skin); }
.wa-hair { fill: var(--wa-hair); }
.wa-pants { fill: var(--wa-pants); }
.wa-shoe { fill: var(--wa-shoe); }
.wa-eye { fill: #1b1b1f; }
.wa-line { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.wa-line--pants { stroke: var(--wa-pants); stroke-width: 8; }
.wa-line--arm { stroke: var(--wa-hoodie-dark); stroke-width: 7; }
.wa-tyre { fill: none; stroke: #d5d5dc; stroke-width: 3; }
.wa-spoke { fill: none; stroke: #8d8d99; stroke-width: 1; }
.wa-frame { fill: none; stroke: var(--wa-frame); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.wa-saddle, .wa-pedal { fill: #2b2b33; }

.wa-man-svg, .wa-bike-svg { display: block; overflow: visible; }
.wa-actor[data-facing="-1"] .wa-man-svg,
.wa-bike[data-facing="-1"] .wa-bike-svg { transform: scaleX(-1); }

.wa-pose { display: none; }
.wa-actor[data-pose="ground"] .wa-pose--ground,
.wa-actor[data-pose="seated"] .wa-pose--seated { display: inline; }

.wa-leg--back { transform-origin: 27px 57px; }
.wa-leg--front { transform-origin: 33px 57px; }
.wa-arm--back { transform-origin: 18px 33px; }
.wa-arm--front { transform-origin: 42px 33px; }
.wa-wheel--rear { transform-origin: 20px 44px; }
.wa-wheel--front { transform-origin: 80px 44px; }
.wa-crank { transform-origin: 45px 44px; }

@keyframes wa-swing-leg { from { transform: rotate(-26deg); } to { transform: rotate(26deg); } }
@keyframes wa-swing-arm { from { transform: rotate(-18deg); } to { transform: rotate(18deg); } }
@keyframes wa-spin { to { transform: rotate(360deg); } }
@keyframes wa-pedal { from { transform: translate(0, -3px); } to { transform: translate(0, 3px); } }
@keyframes wa-hop { 0% { transform: translateY(0); } 40% { transform: translateY(-16px); } 100% { transform: translateY(0); } }

.wa-actor[data-moving="1"][data-pose="ground"] .wa-leg--back { animation: wa-swing-leg 0.5s ease-in-out infinite alternate; }
.wa-actor[data-moving="1"][data-pose="ground"] .wa-leg--front { animation: wa-swing-leg 0.5s ease-in-out infinite alternate-reverse; }
.wa-actor[data-moving="1"][data-pose="ground"] .wa-arm--back { animation: wa-swing-arm 0.5s ease-in-out infinite alternate-reverse; }
.wa-actor[data-moving="1"][data-pose="ground"] .wa-arm--front { animation: wa-swing-arm 0.5s ease-in-out infinite alternate; }
.wa-actor[data-moving="1"][data-pose="seated"] .wa-seated-leg--a { animation: wa-pedal 0.55s ease-in-out infinite alternate; }
.wa-actor[data-moving="1"][data-pose="seated"] .wa-seated-leg--b { animation: wa-pedal 0.55s ease-in-out infinite alternate-reverse; }
.wa-bike[data-moving="1"] .wa-wheel { animation: wa-spin 0.55s linear infinite; }
.wa-bike[data-moving="1"] .wa-crank { animation: wa-spin 1.1s linear infinite; }
.wa-actor[data-hop="1"] .wa-man { animation: wa-hop 0.5s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .wa-actor *, .wa-bike * { animation: none !important; }
}
```

- [ ] **Step 3: Create the throwaway preview page**

`avatar-preview.html` (repo root):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>avatar preview (temporary)</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/avatarPreview.jsx"></script>
  </body>
</html>
```

`src/avatarPreview.jsx`:

```jsx
import { createRoot } from 'react-dom/client'
import './vcard.css'
import './index.css'
import { BikeArt, ManArt } from './components/avatar/AvatarFigure'

// Temporary: static poses for checking the art. Deleted in the last task.
const Cell = ({ label, pose, moving, facing = 1, withBike = false }) => (
  <div style={{ margin: 12, color: '#ddd', font: '12px Poppins, sans-serif' }}>
    <div style={{ position: 'relative', width: 220, height: 110, background: '#1c1c1e', borderRadius: 12 }}>
      {withBike && (
        <div className="wa-bike" data-facing={facing} data-moving={moving ? '1' : '0'} style={{ left: 30 }}>
          <BikeArt />
        </div>
      )}
      <div
        className="wa-actor"
        data-pose={pose}
        data-facing={facing}
        data-moving={moving ? '1' : '0'}
        style={{ left: withBike ? (facing === 1 ? 30 + 10 : 30 + 32) : 80 }}
      >
        <div className="wa-man" style={{ pointerEvents: 'none' }}><ManArt /></div>
      </div>
    </div>
    <div>{label}</div>
  </div>
)

createRoot(document.getElementById('root')).render(
  <div style={{ display: 'flex', flexWrap: 'wrap', padding: 16, background: '#111' }}>
    <Cell label="standing" pose="ground" moving={false} />
    <Cell label="walking" pose="ground" moving />
    <Cell label="walking (facing left)" pose="ground" moving facing={-1} />
    <Cell label="seated, stopped" pose="seated" moving={false} withBike />
    <Cell label="riding" pose="seated" moving withBike />
    <Cell label="riding (facing left)" pose="seated" moving facing={-1} withBike />
  </div>,
)
```

- [ ] **Step 4: Look at it and adjust the art until it reads correctly**

Run `npm run dev`, open `http://localhost:5173/avatar-preview.html` (Claude-in-Chrome if available), and take a screenshot. Acceptance criteria (all must be true):
- Standing and walking: a small figure with dark hair, gold hoodie, dark trousers and white shoes; walking swings legs and arms alternately.
- Seated: hips rest on the saddle, hands reach the handlebar, feet rest near the pedals, nothing floating apart from the bike.
- Riding: both wheels spin and the crank turns; the legs pedal.
- Facing left is an exact mirror of facing right, with the rider still sitting on the saddle (not offset from the bike).

If a criterion fails, adjust only the SVG coordinates in `AvatarFigure.jsx` (the seat offsets 10 and 32 in `motion.js` assume the saddle centre is at x=38 in the bike box and the hip at x=30 in the man box; if you move those, update `SEAT_DX` and `SEAT_DX_FLIPPED` and their tests accordingly). Stop the dev server when done.

- [ ] **Step 5: Lint, build, commit**

```bash
npm run lint && npm run build
git add src/components/avatar/AvatarFigure.jsx src/index.css avatar-preview.html src/avatarPreview.jsx
git commit -m "feat(avatar): add SVG character and bike with walk, ride and hop animations" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Roaming hook and WalkingAvatar component

**Files:**
- Create: `src/components/avatar/useAvatarRoam.js`, `src/components/avatar/WalkingAvatar.jsx`
- Modify: `src/index.css` (append layout, bubble and sound-button rules), `src/avatarPreview.jsx` (mount the live avatar)

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces `useAvatarRoam({ facts, sound })` returning `{ phase, bubble, actorRef, bikeRef, handlers, closeChat }`:
  - `bubble` is `null` or `{ text, kind: 'fact' | 'prompt' }`.
  - `handlers` are spread onto the avatar button: `onPointerEnter`, `onPointerLeave` (mouse/pen only), `onFocus` (keyboard focus only), `onBlur`, `onClick`.
  - `closeChat()` dispatches `CLOSE_CHAT`.
- Produces `<WalkingAvatar roam />` (the bell is driven by the hook, not the component).

- [ ] **Step 1: Write the hook**

`src/components/avatar/useAvatarRoam.js`:

```js
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { avatarReducer, EVENT, PHASE } from './avatarMachine';
import { createFactPicker } from './facts';
import {
  COAST_SPEED, MAN_W, RIDE_SPEED, WALK_SPEED,
  bubbleShift, clamp, coastBikeX, introPositions, pickRideTarget, riderBounds, seatX, stepToward,
} from './motion';

const INTRO_KEY = 'avatarIntroDone';
const GRACE_MS = 2000;
const BRAKE_MS = 250;
const MOUNT_MS = 600;
const ARRIVE_MS = 700;
const FACT_FIRST_MS = 1500;
const FACT_EVERY_MS = 8000;
const FACT_SHOW_MS = 4000;
const BUBBLE_W = 200;
const SEATED = new Set([PHASE.MOUNTING, PHASE.RIDING, PHASE.BRAKING, PHASE.PARKED]);

const readIntroDone = () => { try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; } };
const writeIntroDone = () => { try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ } };
const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initialPositions = (phase) => {
  const vw = window.innerWidth;
  const { min, max } = riderBounds(vw);
  if (phase === PHASE.ARRIVING) return { ...introPositions(vw), facing: 1, bikeFacing: 1 };
  const bike = phase === PHASE.PARKED ? max : min + Math.random() * (max - min);
  return { bike, man: seatX(bike, 1), facing: 1, bikeFacing: 1 };
};

export function useAvatarRoam({ facts, sound }) {
  const [state, dispatch] = useReducer(avatarReducer, undefined, () =>
    avatarReducer(
      { phase: null, pendingChat: false, reducedMotion: false },
      { type: EVENT.START, introDone: readIntroDone(), reducedMotion: prefersReducedMotion() },
    ));
  const { phase } = state;
  const [factBubble, setFactBubble] = useState(null);

  const actorRef = useRef(null);
  const bikeRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const hoveringRef = useRef(false);
  const graceRef = useRef(0);
  const pos = useRef(null);
  if (pos.current === null) pos.current = initialPositions(phase);
  const picker = useMemo(() => createFactPicker(facts), [facts]);

  // Writes positions and animation flags straight to the DOM (no React render per frame).
  const apply = useCallback((manMoving, bikeMoving) => {
    const p = pos.current;
    const actor = actorRef.current;
    const bike = bikeRef.current;
    if (actor) {
      actor.style.transform = `translate3d(${p.man}px,0,0)`;
      actor.dataset.facing = String(p.facing);
      actor.dataset.moving = manMoving ? '1' : '0';
      actor.style.setProperty('--wa-shift', `${bubbleShift(p.man + MAN_W / 2, BUBBLE_W, window.innerWidth)}px`);
    }
    if (bike) {
      bike.style.transform = `translate3d(${p.bike}px,0,0)`;
      bike.dataset.facing = String(p.bikeFacing);
      bike.dataset.moving = bikeMoving ? '1' : '0';
    }
  }, []);

  // Place things whenever the phase changes; this also stops any running animation flags.
  useLayoutEffect(() => {
    const p = pos.current;
    if (phase === PHASE.ARRIVING) {
      const { bike, man } = introPositions(window.innerWidth);
      Object.assign(p, { bike, man, facing: 1, bikeFacing: 1 });
    }
    if (phase === PHASE.MOUNTING || phase === PHASE.PARKED) {
      p.facing = p.bikeFacing;
      p.man = seatX(p.bike, p.bikeFacing);
    }
    apply(false, false);
  }, [phase, apply]);

  // Timers that advance the machine.
  useEffect(() => {
    let t = 0;
    if (phase === PHASE.ARRIVING) t = setTimeout(() => dispatch({ type: EVENT.INTRO_BEGIN }), ARRIVE_MS);
    if (phase === PHASE.MOUNTING) {
      sound.playBell();
      t = setTimeout(() => dispatch({ type: EVENT.MOUNT_DONE }), MOUNT_MS);
    }
    if (phase === PHASE.BRAKING) t = setTimeout(() => dispatch({ type: EVENT.BRAKE_DONE }), BRAKE_MS);
    if (phase === PHASE.RIDING) writeIntroDone();
    // If the pointer already left while he was dismounting, start the grace period now.
    if (phase === PHASE.WAITING && !hoveringRef.current) {
      graceRef.current = setTimeout(() => dispatch({ type: EVENT.GRACE_ELAPSED }), GRACE_MS);
    }
    return () => {
      clearTimeout(t);
      clearTimeout(graceRef.current);
      if (phase === PHASE.MOUNTING) sound.stop(); // the bell ends when he starts riding, or if a hover interrupts the mount
    };
  }, [phase, sound]);

  // Movement: walking to the bike, riding, and the bike coasting after he gets off.
  useEffect(() => {
    if (phase !== PHASE.WALKING_TO_BIKE && phase !== PHASE.RIDING && phase !== PHASE.DISMOUNTING) return undefined;
    let raf = 0;
    let last = performance.now();
    let target = null;
    let pauseUntil = 0;
    let done = false;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pos.current;
      const { min, max } = riderBounds(window.innerWidth);
      let manMoving = false;
      let bikeMoving = false;

      if (phase === PHASE.WALKING_TO_BIKE) {
        const goal = seatX(p.bike, p.bikeFacing);
        if (goal !== p.man) p.facing = Math.sign(goal - p.man);
        p.man = stepToward(p.man, goal, WALK_SPEED, dt);
        manMoving = p.man !== goal;
        if (!manMoving && !done) { done = true; dispatch({ type: EVENT.REACHED_BIKE }); }
      } else if (phase === PHASE.RIDING) {
        if (now >= pauseUntil) {
          if (target === null) {
            target = pickRideTarget({ current: p.bike, min, max });
            if (target !== p.bike) p.bikeFacing = p.facing = Math.sign(target - p.bike);
          }
          p.bike = stepToward(p.bike, target, RIDE_SPEED, dt);
          p.man = seatX(p.bike, p.bikeFacing);
          manMoving = bikeMoving = p.bike !== target;
          if (!bikeMoving) { target = null; pauseUntil = now + 800 + Math.random() * 2200; }
        }
      } else {
        if (target === null) target = coastBikeX(p.bike, p.bikeFacing, min, max);
        p.bike = stepToward(p.bike, target, COAST_SPEED, dt);
        bikeMoving = p.bike !== target;
        if (!bikeMoving && !done) { done = true; dispatch({ type: EVENT.DISMOUNT_DONE }); }
      }

      apply(manMoving, bikeMoving);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, apply]);

  // Keep everything on screen when the window is resized.
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const { min, max } = riderBounds(vw);
      const p = pos.current;
      p.bike = clamp(p.bike, min, max);
      p.man = SEATED.has(phaseRef.current) ? seatX(p.bike, p.bikeFacing) : clamp(p.man, min, vw - MAN_W - min);
      apply(false, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [apply]);

  // Fact bubbles while riding.
  useEffect(() => {
    if (phase !== PHASE.RIDING) return undefined;
    let hide = 0;
    const show = () => {
      const fact = picker.next();
      if (!fact) return;
      setFactBubble(fact);
      clearTimeout(hide);
      hide = setTimeout(() => setFactBubble(null), FACT_SHOW_MS);
    };
    const first = setTimeout(show, FACT_FIRST_MS);
    const every = setInterval(show, FACT_EVERY_MS);
    return () => { clearTimeout(first); clearInterval(every); clearTimeout(hide); setFactBubble(null); };
  }, [phase, picker]);

  const hoverStart = useCallback(() => {
    hoveringRef.current = true;
    clearTimeout(graceRef.current);
    dispatch({ type: EVENT.HOVER_START });
  }, []);

  const hoverEnd = useCallback(() => {
    hoveringRef.current = false;
    if (phaseRef.current === PHASE.WAITING) {
      clearTimeout(graceRef.current);
      graceRef.current = setTimeout(() => dispatch({ type: EVENT.GRACE_ELAPSED }), GRACE_MS);
    }
  }, []);

  const handlers = useMemo(() => ({
    onPointerEnter: (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') hoverStart(); },
    onPointerLeave: (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') hoverEnd(); },
    onFocus: (e) => { if (e.currentTarget.matches(':focus-visible')) hoverStart(); },
    onBlur: () => hoverEnd(),
    onClick: () => dispatch({ type: EVENT.OPEN_CHAT }),
  }), [hoverStart, hoverEnd]);

  const closeChat = useCallback(() => dispatch({ type: EVENT.CLOSE_CHAT }), []);

  let bubble = null;
  if (phase === PHASE.WAITING) bubble = { text: 'Want to chat?', kind: 'prompt' };
  else if (phase === PHASE.RIDING && factBubble) bubble = { text: factBubble, kind: 'fact' };

  return { phase, bubble, actorRef, bikeRef, handlers, closeChat };
}
```

- [ ] **Step 2: Write the component**

`src/components/avatar/WalkingAvatar.jsx`:

```jsx
import { BikeArt, ManArt } from './AvatarFigure';
import { PHASE } from './avatarMachine';

const SEATED = new Set([PHASE.MOUNTING, PHASE.RIDING, PHASE.BRAKING, PHASE.PARKED]);

const WalkingAvatar = ({ roam }) => {
  const hop = roam.phase === PHASE.MOUNTING || roam.phase === PHASE.DISMOUNTING;

  return (
    <div className="wa" data-phase={roam.phase}>
      <div className="wa-bike" ref={roam.bikeRef}><BikeArt /></div>

      <div
        className="wa-actor"
        ref={roam.actorRef}
        data-pose={SEATED.has(roam.phase) ? 'seated' : 'ground'}
        data-hop={hop ? '1' : '0'}
      >
        {roam.bubble && (
          <div key={roam.bubble.text} className={`wa-bubble wa-bubble--${roam.bubble.kind}`} aria-hidden="true">
            {roam.bubble.text}
          </div>
        )}
        <button className="wa-man" type="button" aria-label="Ask Div, chat with me" {...roam.handlers}>
          <ManArt />
        </button>
      </div>
    </div>
  );
};

export default WalkingAvatar;
```

- [ ] **Step 3: Append the layout rules to `src/index.css`**

```css
/* ─── Walking avatar: layout and bubble ────────────────────────── */
body { padding-bottom: 120px; }
@media (max-width: 1023px) { body { padding-bottom: 190px; } }

.wa { position: fixed; left: 0; right: 0; bottom: var(--wa-bottom); height: 96px; pointer-events: none; z-index: 40; }
.wa-bike { position: absolute; left: 0; bottom: 0; width: 100px; height: 58px; will-change: transform; }
.wa-actor { position: absolute; left: 0; bottom: 0; width: 60px; height: 92px; will-change: transform; }
.wa-man {
  position: relative; display: block; width: 60px; height: 92px; padding: 0;
  background: none; border: 0; border-radius: 12px; cursor: pointer; pointer-events: auto;
}
.wa-man:focus-visible { outline: 2px solid var(--orange-yellow-crayola); outline-offset: 4px; }

.wa-bubble {
  position: absolute; bottom: 100px; left: 30px;
  width: max-content; max-width: 200px; padding: 8px 12px;
  border-radius: 12px; background: var(--eerie-black-1); border: 1px solid var(--jet);
  color: var(--white-2); font-size: var(--fs-7); line-height: 1.4; box-shadow: var(--shadow-1);
  transform: translateX(calc(-50% + var(--wa-shift, 0px)));
  animation: wa-bubble-in 0.25s ease-out;
  pointer-events: none;
}
.wa-bubble--fact { animation: wa-bubble-in 0.25s ease-out, wa-bubble-out 0.4s ease-in 3.6s forwards; }
.wa-bubble::after {
  content: ''; position: absolute; top: 100%; left: calc(50% - var(--wa-shift, 0px)); margin-left: -6px;
  border: 6px solid transparent; border-top-color: var(--jet);
}
@keyframes wa-bubble-in {
  from { opacity: 0; transform: translateX(calc(-50% + var(--wa-shift, 0px))) translateY(6px); }
  to { opacity: 1; transform: translateX(calc(-50% + var(--wa-shift, 0px))); }
}
@keyframes wa-bubble-out { to { opacity: 0; } }

@media (prefers-reduced-motion: reduce) { .wa-bubble { animation: none; } }
```

- [ ] **Step 4: Mount the live avatar in the preview page**

Replace `src/avatarPreview.jsx` with:

```jsx
import { createRoot } from 'react-dom/client'
import './vcard.css'
import './index.css'
import WalkingAvatar from './components/avatar/WalkingAvatar'
import { useAvatarRoam } from './components/avatar/useAvatarRoam'
import { createSound } from './components/avatar/sound'
import portfolioData from '../data/portfolioData.json'

// Temporary: the live avatar without the chat popup, with a phase read-out. Deleted in the last task.
const sound = createSound()

const Live = () => {
  const roam = useAvatarRoam({ facts: portfolioData.avatarFacts, sound })
  return (
    <>
      <div style={{ padding: 16, color: '#ddd', font: '14px Poppins, sans-serif' }}>
        <p>phase: <b id="phase">{roam.phase}</b></p>
        <p>Hover the avatar, click it, then use the button to close the fake chat.</p>
        {roam.phase === 'chatting' && <button id="close" onClick={roam.closeChat}>close chat</button>}
      </div>
      <WalkingAvatar roam={roam} />
    </>
  )
}

createRoot(document.getElementById('root')).render(<Live />)
```

- [ ] **Step 5: Verify every behaviour in the browser**

Run `npm run dev` and open `http://localhost:5173/avatar-preview.html` (clear session storage first: `sessionStorage.clear()` then reload). Check each item and note the result in the report:
1. The phase read-out goes `arriving` then `walkingToBike` (he walks toward the parked bike, legs swinging, about 4 seconds), then `mounting` (a hop), then `riding`. First load is silent.
2. While riding, the bike rolls left and right with spinning wheels, pausing and turning around (the whole pair mirrors), always inside the screen. A fact bubble appears about every 8 seconds and fades; the text matches one of the 7 facts.
3. Hover him (mouse): `braking`, `dismounting` (the bike rolls ahead, he stays under the pointer), `waiting` with a "Want to chat?" bubble and no fact bubbles.
4. Move the pointer away without clicking: after about 2 seconds the phase goes `walkingToBike`, `mounting`, `riding`. **Also test moving the pointer away quickly, before he finishes dismounting: he must still return to the bike, not stay in `waiting`.**
5. Hover again then click: `chatting`, the fake close button appears; clicking it goes back to `walkingToBike`, `mounting`, `riding`.
6. Reload the page (same session): no intro; he starts already riding.
7. Resize the window while riding: he stays on screen.
8. Bell: on a fresh load with no interaction the intro mount plays nothing. After you have clicked the page, hover him, click, close the fake chat so he sits back on the bike: a short bicycle bell rings as he sits and is cut off when he starts riding (audible in a real browser; otherwise wrap `OscillatorNode.prototype.start` and `.stop` in the page console to count calls). Hover away during the 0.6 s mount: the bell is stopped.
Stop the dev server. If tab-focus or timing behaviour needs a fix, fix it in the hook and re-run the relevant checks.

- [ ] **Step 6: Lint, test, build, commit**

```bash
npm run lint && npm test && npm run build
git add src/components/avatar/useAvatarRoam.js src/components/avatar/WalkingAvatar.jsx src/index.css src/avatarPreview.jsx
git commit -m "feat(avatar): add roaming hook and walking avatar component" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Chat popup, composer, CSS cleanup

**Files:**
- Create: `src/components/avatar/ChatPopup.jsx`
- Modify: `src/components/AIAssistant.jsx` (rewrite), `src/index.css` (remove old fab/modal/tab/explainer rules, add popup rules)

**Interfaces:**
- Produces from `ChatPopup.jsx`: `useChat() => { messages, chatInput, setChatInput, loading, send }` where `send(event)` handles form submit and Enter; `default ChatPopup({ chat, anchorX, onClose })`; named exports `DivAvatar`, `MarkdownText`, `TypingDots`.
- `AIAssistant` (default export, no props) renders `WalkingAvatar` and, while `roam.phase === PHASE.CHATTING`, the popup.

- [ ] **Step 1: Create `ChatPopup.jsx` by moving the existing chat code**

Create `src/components/avatar/ChatPopup.jsx`. Its top section is moved **verbatim** from the current `src/components/AIAssistant.jsx`:
- the `parseInline` function and the `MarkdownText`, `TypingDots` and `DivAvatar` components (currently lines 11 to 82). Add `export` in front of `MarkdownText`, `TypingDots` and `DivAvatar`.
- Do not copy the `tabs` array, `defaultRepo`, or anything from the Explainer.

Then add the rest of the file:

```jsx
import { useEffect, useRef, useState } from 'react';
import { clamp } from './motion';

// ... parseInline, MarkdownText, TypingDots, DivAvatar moved verbatim from AIAssistant.jsx ...

const GREETING = {
  role: 'assistant',
  content: "Hey! I'm an AI trained on Divyanshu's portfolio. Ask about his projects, tech stack, or whether he needs UK sponsorship 🤙",
};

// Chat state lives in AIAssistant (not in the popup) so the conversation survives closing and reopening.
export function useChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;
    const userContent = chatInput.trim();
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: userContent }]);
    setChatInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userContent, history }),
      });
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* non-JSON proxy error */ }
      if (!res.ok || !data) throw new Error(data?.error || 'AI assistant is temporarily unavailable. Please try again shortly.');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text || '' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${err?.message || 'Something went wrong.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, chatInput, setChatInput, loading, send };
}

const POPUP_W = 340;

export default function ChatPopup({ chat, anchorX, onClose }) {
  const { messages, chatInput, setChatInput, loading, send } = chat;
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
  };

  const left = anchorX == null ? 8 : clamp(anchorX - POPUP_W / 2, 8, window.innerWidth - POPUP_W - 8);

  return (
    <>
      <div className="wa-backdrop" onClick={onClose} />
      <div className="wa-popup" role="dialog" aria-label="Chat with Div" style={{ '--wa-left': `${left}px` }}>
        <div className="ai-accent-bar" />

        <div className="ai-modal_header">
          <div className="ai-row">
            <DivAvatar className="ai-avatar" />
            <div>
              <p className="ai-modal_title">Chat with Div</p>
              <p className="ai-modal_subtitle">Divyanshu&apos;s personal AI · ask me anything</p>
            </div>
          </div>
          <button className="ai-close" onClick={onClose} aria-label="Close chat">✕</button>
        </div>

        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role === 'user' ? 'ai-message--user' : 'ai-message--assistant'}`}>
                {msg.role === 'assistant' && <DivAvatar className="ai-message_avatar" />}
                <div className={`ai-message_bubble ${msg.role === 'user' ? 'ai-bubble--user' : 'ai-bubble--assistant'}`}>
                  {msg.role === 'assistant'
                    ? <MarkdownText text={msg.content} />
                    : <p className="ai-user-text">{msg.content}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai-message--assistant">
                <DivAvatar className="ai-message_avatar" />
                <div className="ai-bubble--assistant ai-bubble--typing"><TypingDots /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="ai-chat_input-row">
            <textarea
              ref={inputRef}
              className="ai-input ai-chat_textarea"
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about skills, projects, visa, availability... (Enter to send)"
              disabled={loading}
            />
            <button className="ai-send" type="submit" disabled={loading || !chatInput.trim()} aria-label="Send">↑</button>
          </form>
        </div>
      </div>
    </>
  );
}
```

(The `import` lines go at the very top of the file; the moved helper code follows them.)

- [ ] **Step 2: Rewrite `src/components/AIAssistant.jsx`**

Replace the whole file with:

```jsx
import { useLayoutEffect, useState } from 'react';
import portfolioData from '../../data/portfolioData.json';
import WalkingAvatar from './avatar/WalkingAvatar';
import ChatPopup, { useChat } from './avatar/ChatPopup';
import { PHASE } from './avatar/avatarMachine';
import { useAvatarRoam } from './avatar/useAvatarRoam';
import { createSound } from './avatar/sound';

const sound = createSound();
const facts = portfolioData.avatarFacts ?? [];

const AIAssistant = () => {
  const roam = useAvatarRoam({ facts, sound });
  const chat = useChat();
  const open = roam.phase === PHASE.CHATTING;
  const [anchorX, setAnchorX] = useState(null);

  // Anchor the popup to wherever he is standing when it opens.
  useLayoutEffect(() => {
    if (open && roam.actorRef.current) {
      const r = roam.actorRef.current.getBoundingClientRect();
      setAnchorX(r.left + r.width / 2);
    }
  }, [open, roam.actorRef]);

  return (
    <>
      <WalkingAvatar roam={roam} />
      {open && <ChatPopup chat={chat} anchorX={anchorX} onClose={roam.closeChat} />}
    </>
  );
};

export default AIAssistant;
```

- [ ] **Step 3: Remove the old assistant CSS and add the popup CSS**

Run this script from the repo root. It keeps every rule in the "AI Assistant" block whose selector starts with one of the kept prefixes (the ones the popup still uses) and drops the rest (the old pill, modal shell, tabs and Explainer rules), then re-adds the one shared dark-text rule:

```bash
python3 - <<'EOF'
p = 'src/index.css'
css = open(p).read()
marker = '/* ─── AI Assistant'
end_marker = '/* ─── Walking avatar: art'   # the avatar rules from Tasks 4 and 5 come after the old block: leave them untouched
start, end = css.index(marker), css.index(end_marker)
head, block, tail = css[:start], css[start:end], css[end:]

chunks, i, n = [], 0, len(block)
while i < n:
    if block.startswith('/*', i):
        j = block.index('*/', i) + 2
    elif block[i].isspace():
        j = i
        while j < n and block[j].isspace():
            j += 1
    else:
        j = block.index('{', i)
        depth, k = 1, j + 1
        while depth:
            depth += (block[k] == '{') - (block[k] == '}')
            k += 1
        j = k
    chunks.append(block[i:j])
    i = j

KEEP = ('.ai-accent-bar', '.ai-modal_header', '.ai-avatar', '.ai-modal_title', '.ai-modal_subtitle',
        '.ai-close', '.ai-chat', '.ai-messages', '.ai-message', '.ai-bubble', '.ai-send', '.ai-input',
        '.ai-md', '.ai-user-text', '.ai-row', '.ai-dot', '@keyframes ai-bounce')

kept, dropped = [], []
for c in chunks:
    text = c.strip()
    if not text or text.startswith('/*') or text.startswith(KEEP):
        kept.append(c)
    else:
        dropped.append(text.split('{')[0].strip())

open(p, 'w').write(head + ''.join(kept).rstrip() + '\n\n' + tail)
print('dropped %d rules:' % len(dropped))
for d in dropped:
    print('  ', d)
EOF
```

Expected: the dropped list contains the `.ai-fab*`, `.ai-modal`, `.ai-modal_overlay`, `.ai-modal_panel`, `.ai-tab*`, `.ai-body*`, `.ai-form`, `.ai-label*`, `.ai-btn*`, `.ai-output*`, `select.ai-input option`, `@keyframes ai-pulse`, the `.ai-fab span, .ai-modal span` rule, the `@media (max-width: 1023px)` block that moved the fab, and the old combined dark-text rule. No `.wa-` rule, `:root`, `body` or `@keyframes wa-` may appear in the dropped list (the script copies everything from the `/* ─── Walking avatar: art` comment onward through unchanged). If any does, restore `src/index.css` with `git checkout -- src/index.css` and stop.

Then append the popup rules and the dark-text rule the script removed:

```css
/* ─── Chat popup ──────────────────────────────────────────────── */
.ai-avatar, .ai-message_avatar, .ai-send { color: var(--smoky-black); }

.wa-backdrop { position: fixed; inset: 0; z-index: 55; background: transparent; }
.wa-popup {
  position: fixed; z-index: 60;
  left: var(--wa-left, 8px); bottom: calc(var(--wa-bottom) + 108px);
  width: 340px; max-height: min(460px, calc(100vh - 150px));
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--eerie-black-2); border: 1px solid var(--jet); border-radius: 1.25rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}
@media (max-width: 579px) {
  .wa-popup { left: 8px; right: 8px; width: auto; max-height: calc(100vh - var(--wa-bottom) - 130px); }
}
```

Verify every `ai-*` class used by the new popup still has a rule:

```bash
for c in $(grep -o 'ai-[a-zA-Z_-]*' src/components/avatar/ChatPopup.jsx | sort -u); do grep -q "\.$c" src/index.css || echo "MISSING RULE: $c"; done; echo checked
```
Expected: only `checked` is printed (no `MISSING RULE`). If a class is missing, restore that rule from git (`git show HEAD:src/index.css`) and append it.

- [ ] **Step 4: Verify in the real app**

Run `npm run server` and `npm run dev`, open `http://localhost:5173` (clear session storage first). Check and report each:
1. The intro plays on the real page: he walks to the bike, mounts, rides along the bottom strip. No old pill button, no old modal and no sound button exist.
2. Hover him: he gets off, "Want to chat?". Click: a small popup opens beside him (about 340 px wide, inside the screen), input focused. Send "Say hello in five words": a reply appears with the assistant styling.
3. Press **Esc**: popup closes, he walks to the bike, mounts and rides away. Reopen: **the earlier messages are still there** (history persists).
4. Open again and click outside the popup: it closes the same way. Use the X: same.
5. Confirm the page's tabs still work and nothing else changed.
6. `git grep -n "ai-fab\|ai-modal_overlay\|ai-tab" -- src` prints nothing.
Stop both servers.

- [ ] **Step 5: Lint, test, build, commit**

```bash
npm run lint && npm test && npm run build
git add src/components/avatar/ChatPopup.jsx src/components/AIAssistant.jsx src/index.css
git commit -m "feat(avatar): move chat into a small popup and wire the walking avatar in" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Docs, remove the preview, final verification

**Files:**
- Delete: `avatar-preview.html`, `src/avatarPreview.jsx`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove the throwaway preview**

```bash
git rm -q avatar-preview.html src/avatarPreview.jsx
git status --short
```
Expected: the two files staged as deleted; nothing else new.

- [ ] **Step 2: Update `CLAUDE.md`**

Replace the line

`- **`components/`**: `AIAssistant.jsx` (chat/explainer modal)`

with

```markdown
- **`components/AIAssistant.jsx`**: thin composer of the walking avatar and the chat popup
- **`components/avatar/`**: the walking-avatar assistant. `avatarMachine.js` (pure state machine), `motion.js` (pure geometry), `facts.js` (fact picker), `sound.js` (bicycle bell), `useAvatarRoam.js` (timers and rAF movement), `AvatarFigure.jsx` (SVG art), `WalkingAvatar.jsx`, `ChatPopup.jsx` (`useChat` + popup). Facts he says come from `avatarFacts` in `data/portfolioData.json`. A short synthesized bicycle bell rings while he sits down on the bike and stops when he starts riding; it only plays after the visitor has interacted with the page (browser autoplay rules), so the first-load intro is silent.
```

Also change the `### Tests` line to: `` `npm test` runs `node:test` unit tests for the API helpers (`api/_lib/*.test.js`), the contact-form validator (`src/lib/*.test.js`) and the avatar logic (`src/components/avatar/*.test.js`). ``

And in the Backend section change the sentence about `/api/explain` to say it is still served but the UI no longer uses it (only `/api/chat`).

- [ ] **Step 3: Full checks**

```bash
npm test && npm run lint && npm run build
git grep -n "avatarPreview\|avatar-preview" -- . ':!docs' || echo "no preview references"
```
Expected: all pass, `no preview references`.

- [ ] **Step 4: Final browser verification**

Run `npm run server` and `npm run dev`; clear session storage; open `http://localhost:5173`. Report each of these (state plainly which could not be checked):
1. Desktop: the whole flow from Task 6 Step 4 still works after the preview removal.
2. **390 px width** (Claude-in-Chrome: create an iframe of the page 390 wide and inspect inside it, as done earlier for the tab bar): he rides only above the tab bar (his bottom edge is above the navbar top), no tab is covered (`elementFromPoint` at each tab's centre returns that tab), the popup is full width with 8 px side gaps, inside the screen, and there is no horizontal scroll. Open the popup, close it, confirm he returns to the bike.
3. A tap-style open (dispatch a click on the avatar without hover) on a riding avatar: he brakes, gets off, then the popup opens without an intermediate "Want to chat?".
4. Sound: after you have clicked the page, hover him, click, and close the chat. As he sits back on the bike the bell runs and it is stopped when he starts riding (count `OscillatorNode.prototype.start`/`.stop` calls from the page console; state whether you could hear it). On a fresh load with no interaction the intro mount plays nothing.
5. Reduced motion: state that this was verified by the reducer tests only unless you managed to emulate `prefers-reduced-motion`.
Stop the servers and close any browser tab you opened.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document the walking avatar and remove the preview page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected: `git status` shows only `?? vcard-personal-portfolio/`.

- [ ] **Step 6: Hand back to the user**

Report: branch `walking-avatar` is ready, nothing pushed or merged. Remind them that (a) the only sound is a short bicycle bell (no recording is needed; the recorded-intro idea was dropped), (b) the Explainer tab is gone from the UI (the `/api/explain` route remains), (c) `main` has a local Explainer-dropdown fix commit that is not pushed yet, and (d) reduced-motion behaviour was verified only as stated. Do not merge or push without their go-ahead.
