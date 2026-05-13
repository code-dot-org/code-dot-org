// Legacy Java Lab persisted user sources in shapes that codebridge does not
// understand. Rails-side `convert_legacy_start_sources` normalises level-
// defined sources at read time, but already-saved channel sources arrive
// directly from the SourcesStore in whatever shape they were written. This
// shim runs at lab2 load time and converts those legacy values to the
// MultiFileSource shape codebridge expects.
//
// Two legacy shapes are recognised:
//
//   1. Flat string hash (matches the on-disk levelbuilder start_sources):
//        { "Main.java": "class Main { ... }" }
//
//   2. Nested editor-state hash (what the old `getSources` selector wrote
//      out via `project.js` packSources for student projects):
//        { "Main.java": { text: "...", isVisible: true, tabOrder: 0 },
//          "Helper.java": { text: "...", isVisible: false, tabOrder: 1 } }
//
// In both cases the converter emits a MultiFileSource with a single 'src'
// folder, types every file as STARTER, and opens the first file (or the
// lowest-tabOrder file in shape 2).
import {DEFAULT_FOLDER_ID, MAZE_FILE_NAME} from '@codebridge/constants';

import {
  MazeCell,
  MultiFileSource,
  ProjectFileType,
  ProjectSources,
  Source,
} from '@cdo/apps/lab2/types';

const ROOT_FOLDER_ID = DEFAULT_FOLDER_ID;

type NestedFileEntry = {
  text?: string;
  isVisible?: boolean;
  tabOrder?: number;
  isValidation?: boolean;
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isMultiFileShape = (value: unknown): value is MultiFileSource =>
  isPlainObject(value) &&
  'files' in value &&
  typeof (value as unknown as MultiFileSource).files === 'object';

const isLegacyFlatHash = (value: unknown): value is Record<string, string> => {
  if (!isPlainObject(value)) return false;
  if ('files' in value || 'folders' in value) return false;
  const values = Object.values(value);
  if (values.length === 0) return false;
  return values.every(v => typeof v === 'string');
};

const isLegacyNestedHash = (
  value: unknown
): value is Record<string, NestedFileEntry> => {
  if (!isPlainObject(value)) return false;
  if ('files' in value || 'folders' in value) return false;
  const values = Object.values(value);
  if (values.length === 0) return false;
  return values.every(
    v => isPlainObject(v) && typeof (v as NestedFileEntry).text === 'string'
  );
};

const buildMultiFile = (
  entries: {name: string; contents: string; active: boolean}[]
): MultiFileSource => {
  const files: MultiFileSource['files'] = {};
  const openFiles: string[] = [];
  entries.forEach((entry, i) => {
    const id = `f${i}`;
    files[id] = {
      id,
      name: entry.name,
      contents: entry.contents,
      folderId: ROOT_FOLDER_ID,
      type: ProjectFileType.STARTER,
      active: entry.active,
    };
    if (entry.active) openFiles.push(id);
  });
  // Always open at least the first file, even if none were flagged active.
  if (openFiles.length === 0 && entries.length > 0) {
    openFiles.push('f0');
    files['f0'].active = true;
  }
  return {
    folders: {
      [ROOT_FOLDER_ID]: {id: ROOT_FOLDER_ID, name: 'src', parentId: ''},
    },
    files,
    openFiles,
  };
};

const convertFlatHash = (flat: Record<string, string>): MultiFileSource =>
  buildMultiFile(
    Object.entries(flat).map(([name, contents], i) => ({
      name,
      contents,
      active: i === 0,
    }))
  );

const convertNestedHash = (
  nested: Record<string, NestedFileEntry>
): MultiFileSource => {
  const sorted = Object.entries(nested)
    .filter(([, v]) => !v.isValidation)
    .sort(([, a], [, b]) => (a.tabOrder ?? 0) - (b.tabOrder ?? 0));
  return buildMultiFile(
    sorted.map(([name, v], i) => ({
      name,
      contents: v.text ?? '',
      // The legacy active file is the first visible tab; fall back to the
      // first entry if none were marked visible.
      active: v.isVisible ?? i === 0,
    }))
  );
};

// When labConfig is absent on the saved server source, fall back to the
// labConfig implied by the current level. Old Java Lab saves predate the
// labConfig concept, so a returning user on a neighborhood level otherwise
// has no `miniApp` flag in their loaded sources and the mini-app preview
// stays hidden.
const withLabConfigFallback = (
  sources: ProjectSources,
  miniApp: string | undefined
): ProjectSources => {
  if (sources.labConfig?.miniApp || !miniApp) return sources;
  return {
    ...sources,
    labConfig: {
      ...(sources.labConfig ?? {}),
      miniApp: {name: miniApp},
    },
  };
};

// `useInitialSources` injects the serialized maze as a SYSTEM_SUPPORT file
// only when it derives sources from level start_sources; it does not patch
// the maze into a pre-existing channel-saved source. Old Java Lab saves
// never wrote the maze file, so returning users on neighborhood levels need
// the maze stitched back in. `NeighborhoodPreview` reads the file by name +
// folder id from project sources.
const withMazeFile = (
  sources: ProjectSources,
  serializedMaze: MazeCell[][] | undefined
): ProjectSources => {
  if (!serializedMaze || !serializedMaze.length) return sources;
  const source = sources.source;
  if (typeof source !== 'object' || source === null) return sources;
  const multi = source as MultiFileSource;
  if (!multi.files) return sources;
  const existing = Object.values(multi.files).find(
    f => f.name === MAZE_FILE_NAME && f.folderId === ROOT_FOLDER_ID
  );
  if (existing) return sources;
  const mazeId = `maze-${Date.now()}`;
  return {
    ...sources,
    source: {
      ...multi,
      files: {
        ...multi.files,
        [mazeId]: {
          id: mazeId,
          name: MAZE_FILE_NAME,
          contents: JSON.stringify(serializedMaze),
          folderId: ROOT_FOLDER_ID,
          type: ProjectFileType.SYSTEM_SUPPORT,
        },
      },
    } as Source,
  };
};

export const migrateLegacyJavalabSources = (
  initial: ProjectSources | undefined,
  miniApp: string | undefined,
  serializedMaze: MazeCell[][] | undefined
): ProjectSources | undefined => {
  if (!initial) return initial;
  const source = initial.source as unknown;
  let migrated: ProjectSources;
  if (isMultiFileShape(source)) {
    migrated = initial;
  } else if (isLegacyNestedHash(source)) {
    migrated = {...initial, source: convertNestedHash(source) as Source};
  } else if (isLegacyFlatHash(source)) {
    migrated = {...initial, source: convertFlatHash(source) as Source};
  } else {
    migrated = initial;
  }
  migrated = withLabConfigFallback(migrated, miniApp);
  migrated = withMazeFile(migrated, serializedMaze);
  return migrated;
};
