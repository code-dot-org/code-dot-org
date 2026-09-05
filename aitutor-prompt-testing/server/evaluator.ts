import {createReadStream, readFileSync} from 'fs';
import {createInterface} from 'readline';
import {join} from 'path';
import {RunItem} from './runner';

const VIDEO_STEMS = [
  'Variables_V1',
  'Functions_V1',
  'While_Loops_V1',
  'Conditionals_V1',
  'Painter_Object_V1',
  'Functions_With_Parameters_V1',
  'If_Else_V1',
];

const STEM_PATTERN = new RegExp(VIDEO_STEMS.join('|'));

// Build the set of valid URLs from videoFiles.json — used as fallback for
// runs created before validVideoUrls was added to RunItem.
function loadFallbackValidUrls(): string[] {
  try {
    const videoFiles = JSON.parse(
      readFileSync(join(process.cwd(), 'data', 'videoFiles.json'), 'utf8')
    ) as Array<{filename: string; hash: string}>;
    return videoFiles.map(v => `/assets/js/json/${v.filename.replace('.json', '')}${v.hash}.json`);
  } catch {
    return [];
  }
}

// Map a valid URL to its base filename e.g. "Conditionals_V1.json"
function urlToFilename(url: string): string | null {
  const match = url.match(/\/([^/]+)\.json$/);
  if (!match) return null;
  const stem = VIDEO_STEMS.find(s => match[1].startsWith(s));
  return stem ? `${stem}.json` : null;
}

// A video attempt is any markdown link whose URL contains 'assets/js/json'
// OR contains one of the 7 known video stems.
function extractVideoAttempts(response: string): string[] {
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  const attempts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(response)) !== null) {
    const url = m[1];
    if (url.includes('assets/js/json') || STEM_PATTERN.test(url)) {
      attempts.push(url);
    }
  }
  return attempts;
}

export interface ItemScore {
  itemIndex: number;
  levelId: string;
  state: string;
  videoRequested: boolean;
  expectedVideos: string[];
  validVideos: string[];       // base filenames of valid video attempts
  hallucinated: string[];      // attempted video URLs that didn't match any known URL
  possibleVideos: (string | null)[];  // parallel to hallucinated: correct URL if stem matched, else null
  missingExpected: string[];   // expected videos not found in response
  unexpectedPresent: string[]; // valid videos found but not in expectedVideos
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

const fallbackValidUrls = loadFallbackValidUrls();

function scoreItem(item: RunItem): ItemScore {
  const validUrls = item.validVideoUrls ?? fallbackValidUrls;
  const validUrlSet = new Set(validUrls);

  const attempts = item.response ? extractVideoAttempts(item.response) : [];

  const validVideos: string[] = [];
  const hallucinated: string[] = [];
  const possibleVideos: (string | null)[] = []; // parallel to hallucinated

  for (const url of attempts) {
    if (validUrlSet.has(url)) {
      const filename = urlToFilename(url);
      if (filename) validVideos.push(filename);
    } else {
      hallucinated.push(url);
      const matchedStem = VIDEO_STEMS.find(s => url.includes(s));
      const correctUrl = matchedStem ? (validUrls.find(u => u.includes(matchedStem)) ?? null) : null;
      possibleVideos.push(correctUrl);
    }
  }

  const foundSet = new Set(validVideos);
  const expectedSet = new Set(item.expectedVideos);

  const missingExpected = item.expectedVideos.filter(v => !foundSet.has(v));
  const unexpectedPresent = validVideos.filter(v => !expectedSet.has(v));

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
    validVideos,
    hallucinated,
    possibleVideos,
    missingExpected,
    unexpectedPresent,
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
