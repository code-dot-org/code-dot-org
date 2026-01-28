import {getAppOptionsEditBlocks} from '../utils';

import {START_SOURCES} from './constants';
import type {MultiFileSource, ProjectFile} from './types';
import {ProjectFileType} from './types';

/**
 * Given a map of {fileId: ProjectFile}, return the first file with the given name.
 * @param files - Map of {fileId: ProjectFile}
 * @param name - Name of the file to find
 * @returns The ProjectFile with the given name, or null if not found.
 */
export function getFileByName(
  files: Record<string, ProjectFile>,
  name: string,
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
 * @param source - The MultiFileSource for a given project.
 * @returns The first non-hidden, active file, the first open file if no files are active,
 * or undefined if no files are open.
 */
export function getActiveFileForSource(source: MultiFileSource) {
  const files = Object.values(source.files);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  // Only system support files are hidden in start mode. In non-start mode, only show starter files
  // (or files without a type, which default to starter files).
  const visibleFiles = files.filter(
    f =>
      (isStartMode && f.type !== ProjectFileType.SYSTEM_SUPPORT) ||
      !f.type ||
      f.type === ProjectFileType.STARTER ||
      f.type === ProjectFileType.LOCKED_STARTER,
  );

  // Get the first active file, if no active file then the first open file,
  // or undefined if no files are open.
  return visibleFiles.find(f => f.active) || visibleFiles.find(f => f.open);
}
