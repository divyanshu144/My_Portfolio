// Local development server only. Production runs the same `api/` handlers as Vercel functions.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import blogHandler from '../api/blog.js';
import healthHandler from '../api/health.js';
import assistantHandler from '../api/assistant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', healthHandler);
app.get('/api/blog', blogHandler);
app.post('/api/assistant', assistantHandler);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`API dev server running on http://localhost:${port}`);
});
