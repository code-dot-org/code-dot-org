import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import {ProjectFile} from '../types';

// Partial definition of the App Options structure, only defining the
// pieces we need in this component.
export interface PartialAppOptions {
  channel: string;
  editBlocks: string;
  levelId: number;
  share: boolean;
}

/**
 * Fetch the ID of the current project from the App Options object
 * if currently on a standalone project level (i.e. under /projects).
 *
 * @returns channel ID if on a standalone project level, null if not.
 *
 * Note: We are trying to use app options as little as possible.
 */
export function getStandaloneProjectId(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.channel;
  }
}

/**
 * Returns the level ID provided by App Options, if available.
 * This is specifically used in scenarios where the level ID is not provided
 * by other means (for example via header.js)
 */
export function getAppOptionsLevelId(): number | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.levelId;
  }
}

/**
 * Returns if the lab should presented in a share/play-only view,
 * if present in App Options. Only used in standalone project levels.
 */
export function getIsShareView(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.share;
  }
}

/**
 * Given a map of {fileId: ProjectFile}, return the first file with the given name.
 * @param files - Map of {fileId: ProjectFile}
 * @param name - Name of the file to find
 * @returns The ProjectFile with the given name, or null if not found.
 */
export function getFileByName(
  files: Record<string, ProjectFile>,
  name: string
) {
  for (const fileId in files) {
    if (files[fileId].name === name) {
      return files[fileId];
    }
  }
  return null;
}
