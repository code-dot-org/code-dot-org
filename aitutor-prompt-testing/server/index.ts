import 'dotenv/config';
import express from 'express';
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {runExperiment, RunProgress} from './runner';
import {evaluateRun} from './evaluator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const DIST_DIR = join(ROOT, 'dist');
const RESULTS_DIR = join(ROOT, 'results');

const app = express();
app.use(express.json({limit: '10mb'}));

// ─── Static UI ────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.sendFile(join(DIST_DIR, 'index.html')));

// ─── Data API ─────────────────────────────────────────────────────────────────

const ALLOWED = new Set(['levels', 'studioData', 'evalData', 'templates', 'videoFiles']);

app.get('/api/data/:file', (req, res) => {
  const {file} = req.params;
  if (!ALLOWED.has(file)) return void res.status(404).json({error: 'Not found'});
  try {
    res.type('json').send(readFileSync(join(DATA_DIR, `${file}.json`), 'utf8'));
  } catch {
    res.status(404).json({error: `${file}.json not found`});
  }
});

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

// ─── Experiment API ───────────────────────────────────────────────────────────

// List completed runs
app.get('/api/runs', (_req, res) => {
  try {
    const files = existsSync(RESULTS_DIR)
      ? readdirSync(RESULTS_DIR).filter(f => f.endsWith('.jsonl')).map(f => f.replace('.jsonl', ''))
      : [];
    res.json(files.sort().reverse());
  } catch (e) {
    res.status(500).json({error: String(e)});
  }
});

// Download raw JSONL for a run
app.get('/api/runs/:runId/raw', (req, res) => {
  const path = join(RESULTS_DIR, `${req.params.runId}.jsonl`);
  if (!existsSync(path)) return void res.status(404).json({error: 'Run not found'});
  res.download(path);
});

// Evaluate a completed run
app.get('/api/runs/:runId/evaluate', async (req, res) => {
  const path = join(RESULTS_DIR, `${req.params.runId}.jsonl`);
  if (!existsSync(path)) return void res.status(404).json({error: 'Run not found'});
  try {
    const result = await evaluateRun(path, req.params.runId);
    res.json(result);
  } catch (e) {
    res.status(500).json({error: String(e)});
  }
});

// Start an experiment run — streams progress via SSE
app.post('/api/runs/start', async (req, res) => {
  // Load current data from disk
  const load = (file: string) => JSON.parse(readFileSync(join(DATA_DIR, `${file}.json`), 'utf8'));
  const levels = load('levels');
  const studioData = load('studioData');
  const evalData = load('evalData');
  const templates = load('templates');
  const videoFileData = load('videoFiles');

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: RunProgress) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runExperiment(
      {levels, studioData, evalData, templates, videoFileData},
      send
    );
  } catch (e) {
    send({type: 'error', runId: '', completed: 0, total: 0, message: String(e)});
  }

  res.end();
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3456);
app.listen(PORT, () =>
  console.log(`AI Tutor test server → http://localhost:${PORT}`)
);
