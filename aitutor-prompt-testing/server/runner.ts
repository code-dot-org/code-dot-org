import {GoogleGenerativeAI} from '@google/generative-ai';
import {createWriteStream, mkdirSync} from 'fs';
import {join} from 'path';
import {assemblePrompt, Templates, VideoFileEntry, LevelEntry} from '../src/promptAssembler';
import {PythonLabStudioStateData, PythonLabEvalEntry} from '../src/aiTutorTestTypes';

export interface RunItem {
  runId: string;
  itemIndex: number;
  levelId: string;
  state: string;
  videoRequested: boolean;
  systemPrompt: string;
  studentMessage: string;
  expectedVideos: string[];
  validVideoUrls: string[];    // exact URLs injected into the system prompt
  response: string | null;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  error: string | null;
}

export interface RunProgress {
  type: 'progress' | 'done' | 'error';
  runId: string;
  completed: number;
  total: number;
  item?: RunItem;
  message?: string;
}

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
// Requests per minute — default 10 (free AI Studio tier)
const RPM = Number(process.env.RPM ?? 10);
const MIN_INTERVAL_MS = Math.ceil(60000 / RPM);
const RESULTS_DIR = join(process.cwd(), 'results');

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildRunItems(
  levels: Record<string, LevelEntry>,
  studioData: Record<string, PythonLabStudioStateData>,
  evalData: Record<string, PythonLabEvalEntry>,
  templates: Templates,
  videoFileData: VideoFileEntry[],
  runId: string
): RunItem[] {
  const items: RunItem[] = [];
  let index = 0;

  for (const dataKey of Object.keys(studioData)) {
    // dataKey format: ${levelId}_${state}
    // Find the last segment that matches a state name
    const states = ['START', 'STRUGGLING', 'SYNTAX_ERRORS', 'RUNTIME_ERRORS', 'GOOD_PROGRESS', 'ALMOST_THERE'];
    let levelId: string | null = null;
    let state: string | null = null;
    for (const s of states) {
      if (dataKey.endsWith(`_${s}`)) {
        levelId = dataKey.slice(0, -(s.length + 1));
        state = s;
        break;
      }
    }
    if (!levelId || !state || !levels[levelId]) continue;

    for (const videoRequested of [false, true]) {
      const assembled = assemblePrompt({
        levelId,
        stateKey: state,
        videoRequested,
        levels,
        studioData,
        templates,
        videoFileData,
      });
      if (!assembled) continue;

      const evalKey = `${levelId}_${state}_${videoRequested ? 'VIDEO' : 'NOVIDEO'}`;
      const expectedVideos = evalData[evalKey]?.expectedVideos ?? [];

      const validVideoUrls = videoFileData.map(
        v => `/assets/js/json/${v.filename.replace('.json', '')}${v.hash}.json`
      );

      items.push({
        runId,
        itemIndex: index++,
        levelId,
        state,
        videoRequested,
        systemPrompt: assembled.systemPrompt,
        studentMessage: assembled.studentMessage,
        expectedVideos,
        validVideoUrls,
        response: null,
        model: MODEL,
        inputTokens: null,
        outputTokens: null,
        latencyMs: null,
        error: null,
      });
    }
  }

  return items;
}

export async function runExperiment(
  data: {
    levels: Record<string, LevelEntry>;
    studioData: Record<string, PythonLabStudioStateData>;
    evalData: Record<string, PythonLabEvalEntry>;
    templates: Templates;
    videoFileData: VideoFileEntry[];
  },
  onProgress: (p: RunProgress) => void
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  mkdirSync(RESULTS_DIR, {recursive: true});
  const outPath = join(RESULTS_DIR, `${runId}.jsonl`);
  const stream = createWriteStream(outPath, {flags: 'a'});

  const items = buildRunItems(
    data.levels,
    data.studioData,
    data.evalData,
    data.templates,
    data.videoFileData,
    runId
  );

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastRequestStart = 0;

  for (let i = 0; i < items.length; i++) {
    const item = {...items[i]};

    // Wait only the remaining time since the last request started
    const elapsed = Date.now() - lastRequestStart;
    const wait = MIN_INTERVAL_MS - elapsed;
    if (wait > 0) await sleep(wait);

    let backoff = 30000;
    let success = false;

    while (!success) {
      lastRequestStart = Date.now();
      try {
        const model = genAI.getGenerativeModel({
          model: MODEL,
          systemInstruction: item.systemPrompt,
        });

        const result = await model.generateContent(item.studentMessage);
        item.latencyMs = Date.now() - lastRequestStart;
        item.response = result.response.text();
        const usage = result.response.usageMetadata;
        item.inputTokens = usage?.promptTokenCount ?? null;
        item.outputTokens = usage?.candidatesTokenCount ?? null;
        success = true;
      } catch (e: unknown) {
        const msg = String(e);
        const is429 = msg.includes('429') || msg.toLowerCase().includes('resource exhausted');
        if (is429) {
          onProgress({type: 'progress', runId, completed: i, total: items.length,
            message: `Rate limited — retrying in ${backoff / 1000}s`});
          await sleep(backoff);
          backoff = Math.min(backoff * 2, 120000);
          lastRequestStart = 0; // reset so next attempt doesn't skip the interval
        } else {
          item.error = msg;
          success = true;
        }
      }
    }

    stream.write(JSON.stringify(item) + '\n');
    onProgress({type: 'progress', runId, completed: i + 1, total: items.length, item});
  }

  stream.end();
  onProgress({type: 'done', runId, completed: items.length, total: items.length});
  return runId;
}
