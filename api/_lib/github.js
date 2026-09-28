import { withCache } from './cache.js';

const REPO_URL = /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i;

export function parseRepoUrl(url) {
  const m = REPO_URL.exec(String(url ?? '').trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

export async function fetchRepoMeta(url, { token, fetchImpl } = {}) {
  const parsed = parseRepoUrl(url);
  if (!parsed) return null;
  const doFetch = fetchImpl || globalThis.fetch;
  try {
    const res = await doFetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-projects-fetch',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      stars: d.stargazers_count ?? 0,
      language: d.language ?? null,
      topics: Array.isArray(d.topics) ? d.topics : [],
      homepage: d.homepage || null,
      pushedAt: d.pushed_at ?? null,
      htmlUrl: d.html_url ?? url,
    };
  } catch {
    return null;
  }
}

export const mergeProjects = (projects, metas) =>
  projects.map((p, i) => ({ ...p, github: metas[i] ?? null }));

export function createProjectsFetcher({ getProjectList, token, fetchImpl, ttlMs = 30 * 60 * 1000, now } = {}) {
  return withCache(ttlMs, async () => {
    const projects = getProjectList();
    const metas = await Promise.all(projects.map((p) => fetchRepoMeta(p.repo, { token, fetchImpl })));
    if (projects.length > 0 && metas.every((m) => m === null)) {
      throw new Error('GitHub returned no data for any project');
    }
    return mergeProjects(projects, metas);
  }, now);
}
