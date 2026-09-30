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
