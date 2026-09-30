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
