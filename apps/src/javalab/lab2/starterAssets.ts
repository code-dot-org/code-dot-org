// Synthesize ProjectFile asset entries from a legacy level's
// {friendlyName => uuidName} starter_assets mapping. Lab2 never writes the
// mapping, so it's consulted only when seeding a level's sources.

import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

const STARTER_ASSETS_PATH = '/level_starter_assets/';

// Return the full url for a starter asset based on the level name and asset uuidName.
export function starterAssetUrl(levelName: string, uuidName: string): string {
  return `${STARTER_ASSETS_PATH}${encodeURIComponent(
    levelName
  )}/uuid/${uuidName}`;
}

// Levelbuilder-owned assets live under level_starter_assets; student uploads
// live under /v3/assets/<channelId>/.
export function isStarterAssetUrl(url: string): boolean {
  return url.startsWith(STARTER_ASSETS_PATH);
}

// Append one LOCKED_STARTER file per mapping entry not already present by
// name — but only when the source has no url-backed files at all (a source
// never touched by lab2 asset editing). Locked matches legacy, where
// level-owned starter assets are not student-editable.
export function mergeStarterAssets(
  source: MultiFileSource,
  starterAssets: Record<string, string> | undefined,
  levelName: string
): MultiFileSource {
  if (!starterAssets || Object.keys(starterAssets).length === 0) {
    return source;
  }

  const existingFiles = Object.values(source.files);
  if (existingFiles.some(file => file.url)) {
    return source;
  }

  const existingNames = new Set(existingFiles.map(file => file.name));
  const files = {...source.files};
  let nextId = Number(getNextFileId(existingFiles));
  for (const [friendlyName, uuidName] of Object.entries(starterAssets)) {
    if (existingNames.has(friendlyName)) continue;
    const id = String(nextId++);
    files[id] = {
      id,
      name: friendlyName,
      contents: '',
      folderId: DEFAULT_FOLDER_ID,
      type: ProjectFileType.LOCKED_STARTER,
      url: starterAssetUrl(levelName, uuidName),
    };
  }

  return {...source, files};
}
