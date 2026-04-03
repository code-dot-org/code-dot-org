import express from 'express';
import {readFileSync, writeFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const DIST_DIR = join(ROOT, 'dist');

const app = express();
app.use(express.json({limit: '10mb'}));

// Serve built UI
app.get('/', (_req, res) => res.sendFile(join(DIST_DIR, 'index.html')));

// Data API — read
const ALLOWED = new Set(['levels', 'studioData', 'evalData', 'templates', 'videoFiles']);

app.get('/api/data/:file', (req, res) => {
  const {file} = req.params;
  if (!ALLOWED.has(file)) return void res.status(404).json({error: 'Not found'});
  try {
    const raw = readFileSync(join(DATA_DIR, `${file}.json`), 'utf8');
    res.type('json').send(raw);
  } catch {
    res.status(404).json({error: `${file}.json not found`});
  }
});

// Data API — write (used by UI editors and experiment runner)
app.put('/api/data/:file', (req, res) => {
  const {file} = req.params;
  if (!ALLOWED.has(file)) return void res.status(404).json({error: 'Not found'});
  try {
    writeFileSync(join(DATA_DIR, `${file}.json`), JSON.stringify(req.body, null, 2));
    res.json({ok: true});
  } catch (e) {
    res.status(500).json({error: String(e)});
  }
});

const PORT = Number(process.env.PORT ?? 3456);
app.listen(PORT, () =>
  console.log(`AI Tutor test server → http://localhost:${PORT}`)
);
