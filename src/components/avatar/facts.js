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
