import fs from 'node:fs';
import path from 'node:path';

import type {
  ExistingLevelExperience,
  ParsedLevel,
  ParseLevelXml,
} from '../authoring/model.js';

export interface LevelCatalogEntry {
  levelKey: string;
  levelType: string;
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

  searchLevels(query: string, limit = 20): LevelCatalogEntry[] {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return this.entries.slice(0, limit);
    }
    const matches: LevelCatalogEntry[] = [];
    for (const entry of this.entries) {
      if (entry.levelKey.toLowerCase().includes(needle)) {
        matches.push(entry);
        if (matches.length >= limit) {
          break;
        }
      }
    }
    return matches;
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

/**
 * LevelProperties wire shape for a lazily-attached level. Fish and Music
 * reach the real LabHost, whose client-side zod schema requires
 * `appName: z.enum(ProjectTypes)` — so those two types get the full shape
 * the importer builds at course-import time, not a raw properties passthrough.
 *
 * Mirrors buildFishLevelProperties/buildMusicLevelProperties in
 * frontend/packages/authoring/src/importer/buildCourse.ts, the source of
 * truth for this shape. Not imported from there because that package doesn't
 * export those two helpers (only the whole-course `buildCourse`); duplicated
 * here rather than changing authoring's public API for this fix.
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

function buildFishLevelProperties(
  id: number,
  levelKey: string,
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    appName: 'fish',
    type: 'Oceans',
    name: levelKey,
    appMode: properties.mode,
    isProjectLevel: false,
    usesProjects: false,
    hideShareAndRemix: true,
    offerBrowserTts: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
  };
}

function buildMusicLevelProperties(
  id: number,
  levelKey: string,
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    appName: 'music',
    type: 'Music',
    name: levelKey,
    isProjectLevel: false,
    usesProjects: false,
    encrypted: false,
    levelData: properties.level_data ?? null,
    hideShareAndRemix: true,
    instructionsImportant: false,
    offerBrowserTts: false,
    useSecondaryFinishButton: false,
    preloadAssetList: false,
    containedLevelNames: [],
    helpVideos: [],
    useRestrictedSongs: true,
    baseAssetUrl: '/blockly/',
    isAssessment: false,
    enableBlocklyKeyboardNavigation: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    sharedBlocks: [],
  };
}

/**
 * LevelProperties for a Maze/Karel-family level. Mirrors
 * buildMazeLevelProperties in
 * frontend/packages/authoring/src/importer/buildCourse.ts — see that
 * function's comment for why blocks stay raw XML here (converted client-side
 * by the maze-lab studio adapter, which has a browser DOMParser).
 */
export function buildMazeLevelProperties(
  id: number,
  levelKey: string,
  levelType: string,
  parsed: ParsedLevel,
): Record<string, unknown> {
  const properties = parsed.properties ?? {};
  return {
    ...properties,
    id,
    appName: 'maze',
    type: levelType,
    name: levelKey,
    isProjectLevel: false,
    usesProjects: false,
    hideShareAndRemix: true,
    offerBrowserTts: false,
    showExemplarLink: false,
    parentLevelLink: null,
    exemplarSources: null,
    longInstructions: properties.long_instructions,
    shortInstructions: properties.short_instructions,
    skin: properties.skin,
    ideal: properties.ideal,
    startDirection: properties.start_direction,
    startBlocksXml: parsed.startBlocksXml,
    toolboxBlocksXml: parsed.toolboxBlocksXml,
    solutionBlocksXml: parsed.solutionBlocksXml,
    recommendedBlocksXml: parsed.recommendedBlocksXml,
  };
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
