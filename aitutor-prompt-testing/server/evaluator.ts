import {createReadStream} from 'fs';
import {createInterface} from 'readline';
import {VIDEO_OPTIONS} from '../src/aiTutorTestTypes';
import {RunItem} from './runner';

// Strip the hash suffix from a hashed video filename to recover the base name.
// e.g. "Conditionals_V1bcd2efg3hij4klm5nop678.json" → "Conditionals_V1.json"
const VIDEO_STEMS = VIDEO_OPTIONS.map(v => v.replace('.json', ''));

function baseFilename(hashed: string): string | null {
  const name = hashed.replace(/\.json$/, '');
  const stem = VIDEO_STEMS.find(s => name.startsWith(s));
  return stem ? `${stem}.json` : null;
}

// Extract all video filenames linked in a response string.
// Link format: [text](/assets/js/json/FILENAME.json)
function extractVideoLinks(response: string): string[] {
  const re = /\[[^\]]*\]\(\/assets\/js\/json\/([^)]+\.json)\)/g;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(response)) !== null) {
    found.push(m[1]);
  }
  return found;
}

export interface ItemScore {
  itemIndex: number;
  levelId: string;
  state: string;
  videoRequested: boolean;
  expectedVideos: string[];
  foundVideos: string[];       // base filenames recovered from response links
  hallucinated: string[];      // links that don't match any known video
  missingExpected: string[];   // expected videos not found in response
  unexpectedPresent: string[]; // found videos not in expectedVideos
  correctNoVideo: boolean;     // true when expected=[] and response has no links
  pass: boolean;
  error: string | null;
}

export interface EvalResult {
  runId: string;
  totalItems: number;
  passed: number;
  failedMissingVideo: number;
  failedUnexpectedVideo: number;
  failedHallucinated: number;
  items: ItemScore[];
}

function scoreItem(item: RunItem): ItemScore {
  const linkedFiles = item.response ? extractVideoLinks(item.response) : [];

  const hallucinated: string[] = [];
  const foundVideos: string[] = [];

  for (const hashed of linkedFiles) {
    const base = baseFilename(hashed);
    if (base) {
      foundVideos.push(base);
    } else {
      hallucinated.push(hashed);
    }
  }

  const expectedSet = new Set(item.expectedVideos);
  const foundSet = new Set(foundVideos);

  const missingExpected = item.expectedVideos.filter(v => !foundSet.has(v));
  const unexpectedPresent = foundVideos.filter(v => !expectedSet.has(v));
  const correctNoVideo = item.expectedVideos.length === 0 && foundVideos.length === 0;

  const pass =
    hallucinated.length === 0 &&
    missingExpected.length === 0 &&
    unexpectedPresent.length === 0;

  return {
    itemIndex: item.itemIndex,
    levelId: item.levelId,
    state: item.state,
    videoRequested: item.videoRequested,
    expectedVideos: item.expectedVideos,
    foundVideos,
    hallucinated,
    missingExpected,
    unexpectedPresent,
    correctNoVideo,
    pass,
    error: item.error,
  };
}

export async function evaluateRun(jsonlPath: string, runId: string): Promise<EvalResult> {
  const items: RunItem[] = await new Promise((resolve, reject) => {
    const lines: RunItem[] = [];
    const rl = createInterface({input: createReadStream(jsonlPath)});
    rl.on('line', line => {
      if (line.trim()) lines.push(JSON.parse(line) as RunItem);
    });
    rl.on('close', () => resolve(lines));
    rl.on('error', reject);
  });

  const scores = items.map(scoreItem);

  return {
    runId,
    totalItems: scores.length,
    passed: scores.filter(s => s.pass).length,
    failedMissingVideo: scores.filter(s => s.missingExpected.length > 0).length,
    failedUnexpectedVideo: scores.filter(s => s.unexpectedPresent.length > 0).length,
    failedHallucinated: scores.filter(s => s.hallucinated.length > 0).length,
    items: scores,
  };
}
