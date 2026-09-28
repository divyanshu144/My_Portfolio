// Tiny in-memory TTL cache for serverless/Express handlers.
// - one upstream call at a time (in-flight dedupe)
// - if a refresh fails and we still hold an older value, keep serving it
export function withCache(ttlMs, fn, now = Date.now) {
  let entry = null;
  let inflight = null;

  return () => {
    if (entry && now() - entry.at < ttlMs) return Promise.resolve(entry.value);
    if (inflight) return inflight;

    inflight = (async () => {
      try {
        const value = await fn();
        entry = { at: now(), value };
        return value;
      } catch (err) {
        if (entry) {
          entry = { at: now(), value: entry.value };
          return entry.value;
        }
        throw err;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  };
}
