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

test('a rejected audio context resume does not cause an unhandled rejection', async () => {
  const ctx = fakeContext({ state: 'suspended' });
  ctx.resume = () => Promise.reject(new Error('NotAllowed'));
  assert.equal(make(ctx).playBell(), true);
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
});

test('a resume that returns nothing still works', () => {
  const ctx = fakeContext({ state: 'suspended' });
  ctx.resume = () => undefined;
  assert.equal(make(ctx).playBell(), true);
  assert.equal(ctx.started, 6);
});
