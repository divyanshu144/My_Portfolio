import { createRequire } from 'module';
import { createProjectsFetcher } from './_lib/github.js';

const require = createRequire(import.meta.url);
const portfolioData = require('../data/portfolioData.json');

export const makeProjectsHandler = (getProjects) => async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const projects = await getProjects();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Projects error:', error?.message || error);
    res.status(502).json({ error: 'Could not load projects.' });
  }
};

let fetchProjects;
export default makeProjectsHandler(() => {
  fetchProjects ??= createProjectsFetcher({
    getProjectList: () => portfolioData.projects,
    token: process.env.GITHUB_TOKEN,
  });
  return fetchProjects();
});
