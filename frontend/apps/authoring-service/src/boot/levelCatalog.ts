import fs from 'node:fs';
import path from 'node:path';

import {
  buildFishLevelProperties,
  buildMazeLevelProperties,
  buildMusicLevelProperties,
} from '@code-dot-org/authoring';

import type {
  ExistingLevelExperience,
  ParsedLevel,
  ParseLevelXml,
} from '../authoring/model.js';

// mazeLevel.ts's draft-level path attaches through this same builder — see
// its import of buildMazeLevelProperties from this module.
export {buildMazeLevelProperties};

export interface LevelCatalogEntry {
  levelKey: string;
  levelType: string;
}

/**
 * One row of grouped search results: every catalog entry that shares a
 * family base name (see parseLevelFamilyKey), collapsed to a single default
 * variant plus the full variant list for a disclosure UI.
 */
export interface LevelFamily {
  familyKey: string;
  defaultVariant: LevelCatalogEntry;
  variantCount: number;
  /** Default variant first, remaining variants in catalog scan order. */
  variants: LevelCatalogEntry[];
}

/** What `resolveLevel` needs from the state it is attaching a level to. */
export interface LevelCatalogContext {
  nextLevelNumericId(): number;
  registerLevelProperties(map: Record<string, Record<string, unknown>>): void;
}

/** Level directory under `dashboard/config/levels/custom` -> Levelbuilder type. */
// `maze` holds both Maze and Karel-family (Bee/Farmer/Harvester/Collector)
// levels; the coarse label here is only the pre-parse browse hint — the
// actual per-level type is re-derived from the XML root tag in resolveLevel.
const SCANNED_DIRECTORIES: Record<string, string> = {
  fish: 'Fish',
  music: 'Music',
  standalone_video: 'StandaloneVideo',
  maze: 'Maze',
};

/**
 * Names-only index of the existing levels an author may attach.
 *
 * Boot scans filenames only — the three directories hold ~4900 files and
 * parsing them all would cost seconds for data almost none of which is used.
 * A level's XML is read and projected on first `resolveLevel`.
 */
export class LevelCatalog {
  private readonly entries: LevelCatalogEntry[];
  private readonly files = new Map<string, string>();
  private readonly resolved = new Map<string, ExistingLevelExperience>();
  private readonly parseLevelXml?: ParseLevelXml;

  private constructor(
    entries: LevelCatalogEntry[],
    files: Map<string, string>,
    parseLevelXml?: ParseLevelXml,
  ) {
    this.entries = entries;
    this.files = files;
    this.parseLevelXml = parseLevelXml;
  }

  static scan(repoRoot: string, parseLevelXml?: ParseLevelXml): LevelCatalog {
    const entries: LevelCatalogEntry[] = [];
    const files = new Map<string, string>();

    for (const [directory, levelType] of Object.entries(SCANNED_DIRECTORIES)) {
      const dir = path.join(
        repoRoot,
        'dashboard/config/levels/custom',
        directory,
      );
      let names: string[];
      try {
        names = fs.readdirSync(dir);
      } catch {
        continue;
      }
      for (const name of names) {
        if (!name.endsWith('.level')) {
          continue;
        }
        const levelKey = name.slice(0, -'.level'.length);
        entries.push({levelKey, levelType});
        files.set(levelKey, path.join(dir, name));
      }
    }

    return new LevelCatalog(entries, files, parseLevelXml);
  }

  get size(): number {
    return this.entries.length;
  }

  /**
   * Grouped by family (see parseLevelFamilyKey) so year/pilot/copy variants
   * of the same puzzle collapse to one row — the catalog holds ~4900 files
   * and an author searching "bee" or "ifStatement" would otherwise see a
   * dozen near-duplicates per real puzzle. Matching runs over the whole
   * catalog before the `limit` cut so a family isn't split across the page
   * boundary (`limit` bounds family rows, not raw entries).
   */
  searchLevels(query: string, limit = 20): LevelFamily[] {
    const needle = query.trim().toLowerCase();
    const matches =
      needle.length === 0
        ? this.entries
        : this.entries.filter(entry =>
            entry.levelKey.toLowerCase().includes(needle),
          );
    return groupLevelFamilies(matches).slice(0, limit);
  }

  resolveLevel(
    levelKey: string,
    context: LevelCatalogContext,
  ): ExistingLevelExperience | undefined {
    const cached = this.resolved.get(levelKey);
    if (cached) {
      return cached;
    }

    const file = this.files.get(levelKey);
    if (!file || !this.parseLevelXml) {
      return undefined;
    }

    let parsed: ParsedLevel;
    let levelType: string;
    try {
      parsed = this.parseLevelXml(fs.readFileSync(file, 'utf8'));
      levelType = parsed.levelType;
    } catch (error) {
      console.warn(
        `[authoring-service] could not parse level ${levelKey}: ${String(error)}`,
      );
      return undefined;
    }

    const levelNumericId = context.nextLevelNumericId();
    const experience: ExistingLevelExperience = {
      id: `lb:${levelKey}`,
      origin: 'levelbuilder',
      kind: 'existingLevel',
      levelKey,
      levelType,
      levelNumericId,
      ...projectRuntime(levelType, parsed.properties ?? {}),
    };

    context.registerLevelProperties({
      [String(levelNumericId)]: buildLevelProperties(
        levelType,
        levelNumericId,
        levelKey,
        parsed,
      ),
    });

    this.resolved.set(levelKey, experience);
    return experience;
  }
}

// Suffix inventory below is measured off the real catalog (9057 names across
// fish/music/standalone_video/maze as of this writing), not guessed:
//   - " (copy N)" / "_copy": 25 + 25 hits, always trailing.
//   - a trailing 4-digit year, underscore- or hyphen-delimited: 4001 + 152
//     hits, range 2018-2026 observed; Levelbuilder's copy-for-new-year-cycle
//     convention makes future years routine, so the match window is widened
//     to 2017-2029.
//   - explicit pilot/variant tags: _pilot (37), _v1/_v2/_v3 (213), _test (4),
//     _dev (1), _beta (1), plus _prod (seen stacked after a year, e.g.
//     "..._2023MB_prod"); _devtest doesn't occur yet but Levelbuilder uses it
//     elsewhere, so it's matched pre-emptively.
// Deliberately NOT stripped: bare trailing digits (`_1`, `_2`, "Params 3" vs
// "Params 4") are sibling exercises in a sequence, not variants of the same
// puzzle — collapsing those would merge distinct curriculum into one row.
// Ad hoc author tags like "_grade3", "_2023MB", "_k5-maker-2024" are left
// alone too: they're real but too idiosyncratic to generalize safely.
const COPY_PAREN_SUFFIX = /\s*\(copy\s*\d*\)$/i;
const COPY_BARE_SUFFIX = /[-_]copy$/i;
const YEAR_SUFFIX = /[-_](20(?:1[7-9]|2[0-9]))$/;
const VARIANT_SUFFIX = /[-_](pilot|devtest|dev|test|beta|prod|v\d+)$/i;

interface LevelKeyAnalysis {
  familyKey: string;
  /** Newest year suffix stripped while deriving familyKey, if any. */
  year?: number;
}

/**
 * Strips known trailing suffixes (copy markers, year stamps, pilot/variant
 * tags) off a level key to find the family it belongs to. Suffixes can
 * stack (e.g. "..._v2_2026_dev"), so this repeats until nothing more
 * matches; the year suffix, if any is found, is reported separately so the
 * caller can rank variants by recency.
 */
export function parseLevelFamilyKey(levelKey: string): LevelKeyAnalysis {
  let key = levelKey;
  let year: number | undefined;
  let stripped = true;
  while (stripped) {
    stripped = false;
    for (const pattern of [
      COPY_PAREN_SUFFIX,
      COPY_BARE_SUFFIX,
      YEAR_SUFFIX,
      VARIANT_SUFFIX,
    ]) {
      const match = key.match(pattern);
      if (!match || match[0].length >= key.length) {
        continue;
      }
      if (pattern === YEAR_SUFFIX) {
        const parsedYear = Number(match[1]);
        year = year === undefined ? parsedYear : Math.max(year, parsedYear);
      }
      key = key.slice(0, key.length - match[0].length);
      stripped = true;
      break;
    }
  }
  return {familyKey: key, year};
}

function pickDefaultVariant(
  familyKey: string,
  bucket: {entry: LevelCatalogEntry; year?: number}[],
): LevelCatalogEntry {
  let newest: {entry: LevelCatalogEntry; year: number} | undefined;
  for (const item of bucket) {
    if (item.year !== undefined && (!newest || item.year > newest.year)) {
      newest = {entry: item.entry, year: item.year};
    }
  }
  if (newest) {
    return newest.entry;
  }
  const bare = bucket.find(item => item.entry.levelKey === familyKey);
  return (bare ?? bucket[0]).entry;
}

/** Groups catalog entries by family, preserving first-seen family order. */
export function groupLevelFamilies(
  entries: LevelCatalogEntry[],
): LevelFamily[] {
  const familyOrder: string[] = [];
  const buckets = new Map<string, {entry: LevelCatalogEntry; year?: number}[]>();

  for (const entry of entries) {
    const {familyKey, year} = parseLevelFamilyKey(entry.levelKey);
    let bucket = buckets.get(familyKey);
    if (!bucket) {
      bucket = [];
      buckets.set(familyKey, bucket);
      familyOrder.push(familyKey);
    }
    bucket.push({entry, year});
  }

  return familyOrder.map(familyKey => {
    const bucket = buckets.get(familyKey) as {
      entry: LevelCatalogEntry;
      year?: number;
    }[];
    const defaultVariant = pickDefaultVariant(familyKey, bucket);
    const variants = [
      defaultVariant,
      ...bucket
        .map(item => item.entry)
        .filter(entry => entry !== defaultVariant),
    ];
    return {
      familyKey,
      defaultVariant,
      variantCount: bucket.length,
      variants,
    };
  });
}

/**
 * LevelProperties wire shape for a lazily-attached level. Fish and Music
 * reach the real LabHost, whose client-side zod schema requires
 * `appName: z.enum(ProjectTypes)` — so those two types get the full shape
 * `@code-dot-org/authoring`'s shared builders produce, not a raw properties
 * passthrough. Those builders are also what buildCourse.ts's eager
 * whole-course import uses, so a level attached lazily here and one imported
 * up front get byte-identical LevelProperties.
 */
function buildLevelProperties(
  levelType: string,
  id: number,
  levelKey: string,
  parsed: ParsedLevel,
): Record<string, unknown> {
  const properties = parsed.properties ?? {};
  switch (levelType) {
    case 'Fish':
      return buildFishLevelProperties(id, levelKey, properties);
    case 'Music':
      return buildMusicLevelProperties(id, levelKey, properties);
    case 'Maze':
    case 'Karel':
      return buildMazeLevelProperties(id, levelKey, levelType, parsed);
    default:
      return {
        ...properties,
        id,
        level_id: id,
        name: levelKey,
        type: levelType,
      };
  }
}

/**
 * Repairs LevelProperties persisted by the old lazy-catalog path, which
 * registered raw XML properties instead of the wire shape above — Music
 * entries in particular lack `appName`, which fails the client's zod
 * validation. Idempotent: entries that already carry `appName` pass through
 * untouched, so this is safe to run on every boot against the on-disk
 * session snapshot. `properties.level_data` survives the original
 * registration (see the `default` branch above), so `buildMusicLevelProperties`
 * can rebuild the full shape directly from the stale persisted entry.
 */
export function repairLevelProperties(
  levelProperties: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const repaired: Record<string, Record<string, unknown>> = {};
  for (const [numericId, entry] of Object.entries(levelProperties)) {
    if (typeof entry.appName === 'string') {
      continue;
    }
    const id = Number(numericId);
    const levelKey = typeof entry.name === 'string' ? entry.name : numericId;
    if (entry.type === 'Music') {
      repaired[numericId] = buildMusicLevelProperties(id, levelKey, entry);
    } else if (entry.type === 'Fish' || entry.type === 'Oceans') {
      repaired[numericId] = buildFishLevelProperties(id, levelKey, entry);
    }
  }
  return repaired;
}

type RuntimeProjection = Pick<
  ExistingLevelExperience,
  'runtime' | 'labKey' | 'data'
>;

/** Karel skins with an authored maze-lab block set; see projectRuntime. */
const SUPPORTED_KAREL_SKINS = new Set([
  'bee',
  'farmer',
  'harvester',
  'collector',
  'planter',
]);

/** Per-level projection of the runtime table in the Author Mode spec doc. */
function projectRuntime(
  levelType: string,
  properties: Record<string, unknown>,
): RuntimeProjection {
  switch (levelType) {
    case 'Fish':
      return {runtime: 'labhost', labKey: 'oceans'};
    case 'Music':
      return {runtime: 'labhost', labKey: 'music'};
    case 'Maze':
      return {runtime: 'labhost', labKey: 'maze'};
    // Karel-family (Bee/Farmer/Harvester/Collector/Planter) levels dispatch
    // to the same maze-lab engine as Maze, on `skin`. Each of these five
    // skins' action blocks (maze_nectar, maze_dig, harvester_corn,
    // collector_collect, planter_plant, ...) is now authored in maze-lab's
    // blocks.ts; any other Karel skin still throws "Invalid block
    // definition" in the toolbox flyout, so it's left unsupported (an
    // honest card).
    case 'Karel':
      return SUPPORTED_KAREL_SKINS.has(properties.skin as string)
        ? {runtime: 'labhost', labKey: 'maze'}
        : opaque(levelType, properties);
    // A video level with no key has nothing to play; report it as unsupported
    // rather than as a video card that renders empty.
    case 'StandaloneVideo':
      return typeof properties.video_key === 'string'
        ? {
            runtime: 'generic',
            data: {type: 'video', videoKey: properties.video_key},
          }
        : opaque(levelType, properties);
    default:
      return opaque(levelType, properties);
  }
}

function opaque(
  levelType: string,
  properties: Record<string, unknown>,
): RuntimeProjection {
  return {
    runtime: 'unsupported',
    data: {type: 'opaque', levelType, properties},
  };
}
