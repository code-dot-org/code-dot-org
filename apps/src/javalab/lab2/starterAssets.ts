// Bridges legacy Java Lab starter assets into the codebridge file tree.
// Legacy levels store assets only as a level property mapping
// {friendlyName => uuidName} with the bytes in S3; their start_sources have
// no url-backed entries. Lab2 represents each asset as a ProjectFile with a
// `url`, so on load we synthesize those entries from the mapping. Once a
// source has been saved by lab2 the url entries live in the source itself
// and the mapping is no longer consulted for tree contents.

import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

// The uuid route serves bytes straight from S3, independent of the level's
// friendly-name mapping and of project templates, and is public.
export function starterAssetUrl(levelName: string, uuidName: string): string {
  return `/level_starter_assets/${encodeURIComponent(
    levelName
  )}/uuid/${uuidName}`;
}

// Merge a level's starter-asset mapping into a MultiFileSource.
//
// Always: url-backed files whose name appears in the mapping are retyped —
// LOCKED_STARTER for students (no rename/move/delete, matching legacy where
// starter assets were read-only) or STARTER in start mode. This runs on
// every load because the flat S3 shape doesn't persist file types.
//
// Append: only when the incoming source has no url-backed files at all
// (a source never touched by lab2 asset editing) do we synthesize entries
// from the mapping. This is the ghost-file guard: once a save has persisted
// url entries, a levelbuilder's later delete/rename must not be undone by
// re-merging the (unchanged) mapping.
export function mergeStarterAssets(
  source: MultiFileSource,
  starterAssets: Record<string, string> | undefined,
  levelName: string,
  isStartMode: boolean
): MultiFileSource {
  if (!starterAssets || Object.keys(starterAssets).length === 0) {
    return source;
  }

  const existingFiles = Object.values(source.files);
  const starterAssetType = isStartMode
    ? ProjectFileType.STARTER
    : ProjectFileType.LOCKED_STARTER;

  const files: Record<string, ProjectFile> = {};
  let hasUrlBackedFile = false;
  for (const file of existingFiles) {
    files[file.id] =
      file.url && file.name in starterAssets
        ? {...file, type: starterAssetType}
        : file;
    if (file.url) hasUrlBackedFile = true;
  }

  if (!hasUrlBackedFile) {
    const existingNames = new Set(existingFiles.map(file => file.name));
    let nextId = Number(getNextFileId(existingFiles));
    for (const [friendlyName, uuidName] of Object.entries(starterAssets)) {
      if (existingNames.has(friendlyName)) continue;
      const id = String(nextId++);
      files[id] = {
        id,
        name: friendlyName,
        contents: '',
        folderId: DEFAULT_FOLDER_ID,
        type: starterAssetType,
        url: starterAssetUrl(levelName, uuidName),
      };
    }
  }

  return {...source, files};
}
