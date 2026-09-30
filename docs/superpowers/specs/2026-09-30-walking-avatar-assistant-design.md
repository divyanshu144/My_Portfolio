# Walking Avatar Assistant, Design

Date: 2026-09-30
Branch: `walking-avatar`

## Goal

Replace the floating "Ask Div" pill and the full-screen chat modal with a small cartoon avatar of Div who walks to a bike on page load, rides along the bottom of the page dropping short facts about Div, and gets off the bike to chat when a visitor hovers or taps him. The chat itself (messages, `/api/chat`, history, markdown rendering) is unchanged.

## Decisions (agreed in conversation, plus defaults marked *default*)

| Topic | Decision |
|---|---|
| Intro | On load he stands a few steps from a parked bike, walks to it, hops on, then rides |
| Roaming | Rides left and right along the bottom strip of the viewport (side-view ground line), pausing and turning at random. Never over the mobile tab bar. *default* |
| Facts | Speech bubbles that fade, drawn from a list in `data/portfolioData.json`. Not persistent stickers. *default* |
| Hover (desktop) | He brakes, gets off where he is, bubble says "Want to chat?" and fact bubbles pause |
| Hover ends without a click | After about 2 seconds he gets back on and rides on. *default* |
| Click / tap | Opens a small chat popup anchored next to him. On touch devices one tap gets him off the bike and opens the popup |
| Close popup | X button, Esc, or click outside. He gets back on the bike and rides away |
| Explainer tab | Dropped from the popup (confirmed); the popup is chat only. `/api/explain` stays on the server unchanged |
| Sound | Off by default. One sound switch (speaker button). When on: a bicycle bell every time he sits on the bike, and the owner's recorded intro clip when the intro is replayed (see Sound). No copyrighted recordings |
| Look | Simple original cartoon: dark hair, gold hoodie (site accent), small bike. Drawn as inline SVG, no image assets or new libraries. *default* |
| Intro frequency | The walk-to-bike intro plays once per browser session; reloads within the session skip it and start him already riding. *default* |
| Reduced motion | With `prefers-reduced-motion`, he sits on the bike in the bottom-right corner, does not move; hover/click still opens the popup without the dismount animation |

## State machine

States: `arriving`, `walkingToBike`, `mounting`, `riding`, `braking`, `dismounting`, `waiting`, `chatting`, `remounting`.

| From | Event | To |
|---|---|---|
| (start) | intro not done this session | `arriving` then `walkingToBike` |
| (start) | intro already done | `riding` |
| `walkingToBike` | reached bike | `mounting` |
| `mounting` | animation end | `riding` |
| `riding` | hover / focus / tap | `braking` then `dismounting` then `waiting` |
| `waiting` | hover ends for 2 s | `remounting` |
| `waiting` | click / tap / Enter | `chatting` |
| `chatting` | close (X / Esc / outside) | `remounting` |
| `remounting` | animation end | `riding` |

The reducer is a pure function in `avatarMachine.js` so every transition is unit-tested. Timers (walking, riding targets, fact rotation, the 2 s grace period) live in a hook and dispatch events; nothing in the reducer touches the DOM or time.

## Movement and layout

- Horizontal position is one number `x` in px, applied with `transform: translateX(...)` and a CSS transition, so animation stays on the compositor. Walking about 40 px/s, riding about 120 px/s. Facing flips with `scaleX(-1)`.
- Riding picks a random target within a margin of both edges, moves there, pauses 1 to 3 s, repeats. When he dismounts, the bike stays put and he stands about 40 px beside it.
- Fixed to the bottom of the viewport. Bottom offset comes from a CSS variable: `0` above 1023 px, and the mobile tab-bar height plus a small gap below that, so he cannot cover the tab bar (this was a real overlap bug earlier).
- z-index above page content and below the popup.
- Movement and timers pause while the browser tab is hidden.

## Facts

`avatarFacts` is a new array of strings in `data/portfolioData.json` (single source, editable). Only facts already given by the owner. Initial list:

- Cut inference cost 73% on JobFit.
- MSc Statistical Data Science, University of Exeter (Merit).
- Rebuilt a refund review flow used across 60+ government contracts.
- Took a prompt test set from 40% to 100% pass rate.
- Plays guitar and reads books.
- Works part time as a barista at Starbucks.
- Learns something new every day.

Rotation: while `riding`, show one bubble for about 4 s roughly every 8 s, shuffled without repeats until the list is exhausted. No bubbles in any other state. No em-dashes in fact text.

## Sound

Two sounds, both opt-in. Browsers block audio that starts without a user gesture, and the first-load intro runs before any click, so the first-load intro is always silent.

- **Sound switch.** A small speaker button in the bottom corner (accessible name "Turn sound on" / "Turn sound off", `aria-pressed`). Off by default. The choice is remembered in `localStorage`, but sound still only plays after the visitor has interacted with the page this load (`navigator.userActivation.hasBeenActive`).
- **Bicycle bell.** Played each time the avatar finishes mounting the bike (during the intro replay and after every chat close or hover-away remount) when the switch is on. It is generated in code with the Web Audio API (two short sine tones with a fast decay, about 0.5 s, "ding-ding"), so there is no audio file to host. Volume is low. If Web Audio is unavailable, no sound plays and nothing errors.
- **Intro clip.** The owner records a short clip (about 6 to 10 seconds, small file) at `public/audio/intro.mp3`. It must be an original recording or something the owner has the rights to, and must not copy the melody of a commercial song. Turning the switch on (a click, so the browser allows sound) replays the intro from the start (he stands a few steps from the bike, walks, mounts, rides) with the clip playing from 0. Turning the switch off stops the clip. The clip is fetched only on that click (`preload="none"`), never autoplays, never loops.
- **No clip yet.** The switch still works for the bell. A `HEAD` request checks whether `intro.mp3` exists; if it does not, turning the switch on plays just the bell as feedback and does not replay the intro.
- **Reduced motion.** No replayed animation; the switch only enables the bell and plays the clip if present.
- **Testing.** Unit tests for the sound controller with the audio APIs faked: bell plays only when sound is on and the page has had user activation; switching off stops the clip; missing clip does not replay the intro; missing Web Audio does not throw. Manual: a click plays sound in Chrome, first load is silent, and the bell plays after closing the chat.

## Chat popup

- Small panel (about 340 x 460 px) positioned above and beside the avatar, flipped horizontally and clamped so it stays inside the viewport. On screens under 580 px it becomes full width, pinned above the tab bar.
- Contents are the existing chat: header with avatar badge and title, message list, typing dots, input. The message state, `/api/chat` call, error handling, and markdown renderer are reused unchanged (moved out of `AIAssistant.jsx` into `ChatPopup.jsx`). Conversation history persists while the page stays open, across popup opens.
- Keyboard: focus moves into the input on open; Esc closes; focus returns to the avatar button on close.

## Files

- `src/components/avatar/avatarMachine.js` (+ `avatarMachine.test.js`): pure reducer, event names, constants.
- `src/components/avatar/facts.js` (+ test): shuffled-without-repeat fact picker.
- `src/components/avatar/useAvatarRoam.js`: timers, target picking, dispatches events. Respects reduced motion and page visibility.
- `src/components/avatar/sound.js` (+ test): sound switch state (persisted), synthesized bicycle bell, and play/stop of `public/audio/intro.mp3` with an existence check.
- `src/components/avatar/AvatarFigure.jsx`: SVG character and bike, poses via CSS classes on `data-state` (stand/walk, mount, seated/ride with wheel spin, dismount).
- `src/components/avatar/ChatPopup.jsx`: the extracted chat panel.
- `src/components/AIAssistant.jsx`: becomes a thin composer of the above (keeps its default export so `App.jsx` does not change).
- `src/index.css`: replaces the `.ai-fab` and modal-overlay rules with avatar and popup rules; existing message, bubble and input rules are kept.
- `data/portfolioData.json`: adds `avatarFacts`.
- `CLAUDE.md`: architecture notes updated.

No new dependencies.

## Accessibility

- The avatar is a real `<button>` in the tab order with accessible name "Ask Div, chat with me".
- Fact bubbles are decorative and `aria-hidden`; they do not steal focus.
- Popup has `role="dialog"`, a label, and returns focus on close.
- Reduced-motion users get no moving animation at all.
- Contrast for text in bubbles and the popup follows the existing vCard palette rules.

## Testing

- Unit tests (node:test) for the reducer (every row of the table plus illegal events being ignored), and the fact picker (no repeats until exhausted, handles a one-item list, empty list).
- Manual browser check of each state: intro, mount, ride, hover to dismount, hover away to remount, click to chat, close to ride away, and Esc.
- Manual checks: 390 px width (popup full width, avatar above the tab bar, no tab covered), reduced motion emulation, and the AI chat still answering.
- `npm test`, `npm run lint`, `npm run build` clean.

## Out of scope

Background music or sound effects beyond the single opt-in intro clip, drag-to-move, multiple characters, photo-real or hand-drawn art, removing `/api/explain`, changing the AI model or prompts, and any change to the other tabs.

## Risks

- Art quality: drawn in code, so it will be simple and charming, not polished. The art lives in one file so it can be replaced later.
- Content overlap: a moving element on the bottom strip can cover content near the page bottom. Mitigated by keeping him small, adding bottom padding to the page, and stopping on hover.
- Timers: all timers must be cleaned up on unmount and when the tab is hidden, so he does not drift after a hot reload or in a background tab.
