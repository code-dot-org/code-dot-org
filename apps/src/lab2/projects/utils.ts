import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import {MultiFileSource, ProjectFile} from '../types';

import {START_SOURCES} from '@cdo/apps/lab2/constants';

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
 * Returns the edit mode provided by App Options, if available.
 * This can be used to tell if we are a levelbuilder mode (e.g. start_sources)
 */
export function getAppOptionsEditBlocks(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.editBlocks;
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

/**
 * Given a map of {fileId: ProjectFile}, return the first non-hidden, active file.
 * @param project - The folders and files for a given project.
 * @returns The first non-hidden, active file, or the first file.
 */
export function getActiveFileForProject(project: MultiFileSource) {
  const files = Object.values(project.files);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  // No files are hidden in start mode.
  const visibleFiles = files.filter(f => !f.hidden || isStartMode);

  // Get the first active file, or the first file.
  return visibleFiles.find(f => f.active) || visibleFiles[0];
}
