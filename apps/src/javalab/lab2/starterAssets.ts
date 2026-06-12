// Bridges legacy Java Lab starter assets into the codebridge file tree.
// Legacy levels store assets only as a level property mapping
// {friendlyName => uuidName}, where the uuidName is the filename of an S3 asset in level_starter_assets.
// Lab2 represents each asset as a ProjectFile with a`url`, so we synthesize those
// entries from the mapping when converting the level's sources. Projects loaded
// from S3 are never merged: like any other start-source change, assets reach a student's
// project only when it is seeded from the level (fresh load or start over).

import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import HttpClient from '@cdo/apps/util/HttpClient';

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

// Start-mode delete or rename of a starter-asset file: remove the file's
// (old) friendly-name entry from the level's starter_assets mapping.
// Otherwise mergeStarterAssets re-appends the stale name from the mapping
// on the next load. The DELETE endpoint leaves the S3 object alone (other
// levels may reference it) and is a no-op for names not in the mapping.
// Renamed files keep working: their url is the mapping-independent uuid
// route, and the run path derives assetUrls from the source entries.
export async function removeStarterAssetMapping(
  file: ProjectFile,
  levelName: string,
  isStartMode: boolean
): Promise<void> {
  if (!isStartMode || !file.url || !isStarterAssetUrl(file.url)) {
    return;
  }
  try {
    await HttpClient.delete(
      `${STARTER_ASSETS_PATH}${encodeURIComponent(
        levelName
      )}/${encodeURIComponent(file.name)}`
    );
  } catch (error) {
    // On failure the mapping entry goes stale and the asset re-appears in
    // fresh seeds; nothing breaks, so just report it.
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error removing starter asset mapping', error as Error);
  }
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
