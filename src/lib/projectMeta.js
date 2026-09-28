const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function projectMeta(project) {
  const g = project?.github;
  if (!g) return '';
  const pushed = g.pushedAt ? new Date(g.pushedAt) : null;
  return [
    g.language,
    typeof g.stars === 'number' ? `★ ${g.stars}` : null,
    pushed && !Number.isNaN(pushed.getTime()) ? monthYear.format(pushed) : null,
  ].filter(Boolean).join(' · ');
}

export function liveDemoUrl(project) {
  const h = project?.github?.homepage;
  return typeof h === 'string' && /^https?:\/\//i.test(h.trim()) ? h.trim() : null;
}

export function extraTopics(project, limit = 3) {
  const topics = project?.github?.topics;
  if (!Array.isArray(topics)) return [];
  const seen = new Set((project.tech ?? []).map((t) => String(t).toLowerCase()));
  const out = [];
  for (const t of topics) {
    const key = String(t).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length === limit) break;
  }
  return out;
}
