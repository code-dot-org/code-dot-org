import {createReadStream} from 'fs';
import {createInterface} from 'readline';
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

const STEM_PATTERN = VIDEO_STEMS.join('|');

// A video attempt is any markdown link whose URL contains 'assets/js/json'
// OR contains one of the 7 known video stems.
function extractVideoAttempts(response: string): string[] {
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  const attempts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(response)) !== null) {
    const url = m[2];
    if (
      url.includes('assets/js/json') ||
      new RegExp(STEM_PATTERN).test(url)
    ) {
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
  validVideos: string[];         // attempts that matched a known injected URL
  hallucinated: string[];        // attempts that did not match any known URL
  missingExpected: string[];     // expected videos not found
  unexpectedPresent: string[];   // valid videos not in expectedVideos
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
  const validUrlSet = new Set(item.validVideoUrls);

  const attempts = item.response ? extractVideoAttempts(item.response) : [];

  const validVideos: string[] = [];
  const hallucinated: string[] = [];

  for (const url of attempts) {
    if (validUrlSet.has(url)) {
      // Map exact URL back to the base filename (e.g. "Conditionals_V1.json")
      const base = item.validVideoUrls.indexOf(url);
      validVideos.push(item.expectedVideos[base] ?? url);
    } else {
      hallucinated.push(url);
    }
  }

  // Map valid URLs to base filenames for comparison with expectedVideos
  const validUrlToFilename = new Map<string, string>();
  item.validVideoUrls.forEach((url, i) => {
    // validVideoUrls order matches VIDEO_STEMS order; expectedVideos uses filenames
    // We need the filename — derive from the URL's path segment
    const match = url.match(/\/([^/]+)\.json$/);
    if (match) {
      const stem = VIDEO_STEMS.find(s => match[1].startsWith(s));
      if (stem) validUrlToFilename.set(url, `${stem}.json`);
    }
  });

  const foundFilenames = attempts
    .filter(url => validUrlSet.has(url))
    .map(url => validUrlToFilename.get(url) ?? url);

  const foundSet = new Set(foundFilenames);
  const expectedSet = new Set(item.expectedVideos);

  const missingExpected = item.expectedVideos.filter(v => !foundSet.has(v));
  const unexpectedPresent = foundFilenames.filter(v => !expectedSet.has(v));

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
    validVideos: foundFilenames,
    hallucinated,
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
