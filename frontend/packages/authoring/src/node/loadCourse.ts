import {
  closeSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
} from 'node:fs';
import path from 'node:path';

import {
  buildCourse,
  type BuildCourseResult,
  type LevelSource,
} from '../importer/buildCourse';
import {
  type DslExt,
  type ParsedDslLevel,
  parseDslLevel,
  unescapeRubyString,
} from '../importer/dslLevel';
import {parseScriptJson} from '../importer/scriptJson';

const DSL_EXTENSIONS: DslExt[] = [
  'multi',
  'match',
  'external',
  'bubble_choice',
  'level_group',
  'text_match',
];

interface RawCourseFile {
  script_names: string[];
  properties?: {family_name?: string};
}

/**
 * Reads one course's on-disk Levelbuilder serialization under
 * `<repoRoot>/dashboard/config/` and projects it into a CourseModel via
 * buildCourse. Read-only: never writes the source files.
 *
 * Indexes every DSL level file and every .level XML file once (a single
 * directory scan each), then resolves each level key referenced by the
 * script — recursing into level_group/bubble_choice sub-level references —
 * against those indexes.
 */
export function loadCourse(
  repoRoot: string,
  courseName: string,
): BuildCourseResult {
  const configDir = path.join(repoRoot, 'dashboard', 'config');
  const scriptsDir = path.join(configDir, 'scripts');
  const levelsCustomDir = path.join(configDir, 'levels', 'custom');

  const courseJson = readFileSync(
    path.join(configDir, 'courses', `${courseName}.course`),
    'utf8',
  );
  const courseRaw = JSON.parse(courseJson) as RawCourseFile;

  const familyName = courseRaw.properties?.family_name;
  if (!familyName) {
    throw new Error(
      `loadCourse: course '${courseName}' has no properties.family_name`,
    );
  }
  const offeringJson = readFileSync(
    path.join(configDir, 'course_offerings', `${familyName}.json`),
    'utf8',
  );

  // A .course file's script_names can list more than one script (a
  // multi-unit course); this importer builds one Unit from the first —
  // see the note in buildCourse.
  const scriptName = courseRaw.script_names[0];
  if (!scriptName) {
    throw new Error(`loadCourse: course '${courseName}' has no script_names`);
  }
  const scriptJson = readFileSync(
    path.join(configDir, 'scripts_json', `${scriptName}.script_json`),
    'utf8',
  );

  const videoCsv = readOptional(path.join(configDir, 'videos.csv'));

  const dslIndex = buildDslIndex(scriptsDir);
  const xmlIndex = buildXmlIndex(levelsCustomDir);

  const parsedScript = parseScriptJson(scriptJson);
  const seedKeys = parsedScript.scriptLevels.flatMap(sl => sl.levelKeys);

  const levelSources = new Map<string, LevelSource>();
  const seen = new Set<string>();
  const queue = [...seedKeys];

  while (queue.length > 0) {
    const key = queue.shift() as string;
    if (seen.has(key)) continue;
    seen.add(key);

    const dslEntry = dslIndex.get(key);
    if (dslEntry) {
      const content = readFileSync(dslEntry.path, 'utf8');
      levelSources.set(key, {kind: 'dsl', ext: dslEntry.ext, content});
      if (dslEntry.ext === 'bubble_choice' || dslEntry.ext === 'level_group') {
        const parsed = parseDslLevel(content, dslEntry.ext);
        for (const subKey of subLevelKeys(parsed)) {
          if (!seen.has(subKey)) queue.push(subKey);
        }
      }
      continue;
    }

    const xmlPath = xmlIndex.get(key);
    if (xmlPath) {
      levelSources.set(key, {
        kind: 'xml',
        content: readFileSync(xmlPath, 'utf8'),
      });
      continue;
    }

    // Unresolvable: buildCourse's own missing-source handling records this
    // as an opaque, unsupported experience and adds a warning.
  }

  return buildCourse({
    courseJson,
    offeringJson,
    scriptJson,
    levelSources,
    videoCsv,
  });
}

function subLevelKeys(parsed: ParsedDslLevel): string[] {
  if (parsed.kind === 'bubbleChoice') return parsed.levelKeys;
  if (parsed.kind === 'levelGroup') return parsed.pages.flat();
  return [];
}

function readOptional(filePath: string): string | undefined {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

interface DslIndexEntry {
  ext: DslExt;
  path: string;
}

// One pass over dashboard/config/scripts/: for every file whose extension
// is one of DSL_EXTENSIONS, read just enough of it to extract the `name`
// statement (always the first line in every file sampled) and index it —
// the filename slug is not a reliable key, so this reads content, not
// names.
function buildDslIndex(scriptsDir: string): Map<string, DslIndexEntry> {
  const index = new Map<string, DslIndexEntry>();
  const entries = readdirSync(scriptsDir, {withFileTypes: true});

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).slice(1);
    if (!DSL_EXTENSIONS.includes(ext as DslExt)) continue;

    const filePath = path.join(scriptsDir, entry.name);
    const key = readDslName(filePath);
    if (key === undefined) continue;
    // First file wins on a collision (pilot/prod-suffixed variants
    // occasionally share a natural key mid-rename).
    if (!index.has(key)) index.set(key, {ext: ext as DslExt, path: filePath});
  }

  return index;
}

const NAME_LINE_PATTERN = /^name\s+'((?:\\.|[^'\\])*)'/;
const NAME_ANYWHERE_PATTERN = /(?:^|\n)name\s+'((?:\\.|[^'\\])*)'/;
const NAME_PREFIX_BYTES = 512;

function readDslName(filePath: string): string | undefined {
  const prefix = readPrefix(filePath, NAME_PREFIX_BYTES);
  const firstLineMatch = prefix.match(NAME_LINE_PATTERN);
  if (firstLineMatch) return unescapeRubyString(firstLineMatch[1]);

  // Rare fallback: `name` wasn't in the first bytes of the file.
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(NAME_ANYWHERE_PATTERN);
  return match ? unescapeRubyString(match[1]) : undefined;
}

function readPrefix(filePath: string, length: number): string {
  const fd = openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = readSync(fd, buffer, 0, length, 0);
    return buffer.toString('utf8', 0, bytesRead);
  } finally {
    closeSync(fd);
  }
}

// One pass over dashboard/config/levels/custom/<type>/*.level: index every
// file by its basename (the level's natural key) — filenames are the exact
// case-sensitive level name, so no content read is needed here.
function buildXmlIndex(levelsCustomDir: string): Map<string, string> {
  const index = new Map<string, string>();
  const typeDirs = readdirSync(levelsCustomDir, {withFileTypes: true}).filter(
    e => e.isDirectory(),
  );

  for (const dir of typeDirs) {
    const dirPath = path.join(levelsCustomDir, dir.name);
    const files = readdirSync(dirPath, {withFileTypes: true});
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.level')) continue;
      const key = file.name.slice(0, -'.level'.length);
      if (!index.has(key)) index.set(key, path.join(dirPath, file.name));
    }
  }

  return index;
}
