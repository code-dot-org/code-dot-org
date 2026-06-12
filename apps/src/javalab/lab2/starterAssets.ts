// Bridges legacy Java Lab starter assets into the codebridge file tree.
// Legacy levels store assets only as a level property mapping
// {friendlyName => uuidName}, where the uuidName is the filename of an S3 asset in level_starter_assets.
// Lab2 represents each asset as a ProjectFile with a`url`, so we synthesize those
// entries from the mapping when converting the level's sources. Projects loaded
// from S3 are never merged: like any other start-source change, assets reach a student's
// project only when it is seeded from the level (fresh load or start over).

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

// Append one STARTER file per mapping entry not already present by name.
// Locking starter assets against student edits will arrive with the broader
// locked-starter-files support.
export function mergeStarterAssets(
  source: MultiFileSource,
  starterAssets: Record<string, string> | undefined,
  levelName: string
): MultiFileSource {
  if (!starterAssets || Object.keys(starterAssets).length === 0) {
    return source;
  }

  const existingFiles = Object.values(source.files);
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
      type: ProjectFileType.STARTER,
      url: starterAssetUrl(levelName, uuidName),
    };
  }

  return {...source, files};
}
