import test from 'node:test';
import assert from 'node:assert/strict';
import { avatarReducer, poseFor, EVENT, PHASE } from './avatarMachine.js';

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

test('poseFor: seated phases and parked are seated', () => {
  [PHASE.MOUNTING, PHASE.RIDING, PHASE.BRAKING, PHASE.PARKED].forEach((p) => {
    assert.equal(poseFor(p, false), 'seated', p);
    assert.equal(poseFor(p, true), 'seated', p);
  });
});

test('poseFor: ground phases stand, with or without reduced motion', () => {
  [PHASE.ARRIVING, PHASE.WALKING_TO_BIKE, PHASE.DISMOUNTING, PHASE.WAITING].forEach((p) => {
    assert.equal(poseFor(p, false), 'ground', p);
    assert.equal(poseFor(p, true), 'ground', p);
  });
});

test('poseFor: chatting stands normally but stays seated in reduced motion', () => {
  assert.equal(poseFor(PHASE.CHATTING, false), 'ground');
  assert.equal(poseFor(PHASE.CHATTING, true), 'seated');
});
