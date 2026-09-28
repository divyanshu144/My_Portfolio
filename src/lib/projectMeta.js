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
