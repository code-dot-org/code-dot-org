import fs from 'node:fs';
import path from 'node:path';

import type {
  ExistingLevelExperience,
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
const SCANNED_DIRECTORIES: Record<string, string> = {
  fish: 'Fish',
  music: 'Music',
  standalone_video: 'StandaloneVideo',
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

    let properties: Record<string, unknown>;
    let levelType: string;
    try {
      const parsed = this.parseLevelXml(fs.readFileSync(file, 'utf8'));
      properties = parsed.properties ?? {};
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
      ...projectRuntime(levelType, properties),
    };

    context.registerLevelProperties({
      [String(levelNumericId)]: {
        ...properties,
        id: levelNumericId,
        level_id: levelNumericId,
        name: levelKey,
        type: levelType,
      },
    });

    this.resolved.set(levelKey, experience);
    return experience;
  }
}

type RuntimeProjection = Pick<
  ExistingLevelExperience,
  'runtime' | 'labKey' | 'data'
>;

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
