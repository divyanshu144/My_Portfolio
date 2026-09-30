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
  const movingRef = useRef({ man: false, bike: false }); // last flags written by the loop, reused by the resize handler
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
    movingRef.current = { man: false, bike: false };
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
      if (phaseRef.current !== phase) return; // a frame queued before this phase ended: the next effect owns the loop
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
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
          if (target !== null) target = clamp(target, min, max); // the window may have shrunk since it was picked
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
        else target = clamp(target, min, max);
        p.bike = stepToward(p.bike, target, COAST_SPEED, dt);
        bikeMoving = p.bike !== target;
        if (!bikeMoving && !done) { done = true; dispatch({ type: EVENT.DISMOUNT_DONE }); }
      }

      movingRef.current = { man: manMoving, bike: bikeMoving };
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
      apply(movingRef.current.man, movingRef.current.bike);
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
