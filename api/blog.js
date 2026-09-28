import { createPostsFetcher } from './_lib/substack.js';

const DEFAULT_SUBSTACK_URL = 'https://div1761180.substack.com';

export const makeBlogHandler = (getPosts) => async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const posts = await getPosts();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Blog error:', error?.message || error);
    res.status(502).json({ error: 'Could not load blog posts.' });
  }
};

let fetchPosts;
export default makeBlogHandler(() => {
  fetchPosts ??= createPostsFetcher({ baseUrl: process.env.SUBSTACK_URL || DEFAULT_SUBSTACK_URL });
  return fetchPosts();
});
