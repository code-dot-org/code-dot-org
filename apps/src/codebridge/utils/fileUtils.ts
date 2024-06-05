import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';

import {ProjectFile} from '../types';

export function shouldShowFile(file: ProjectFile) {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  // If we are in start mode, show all files. If we are not in start mode,
  // show starter files or files without a type.
  return isStartMode
    ? true
    : file.type === ProjectFileType.STARTER || !file.type;
}

export function getFileIcon(file: ProjectFile) {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  let icon = 'fa-solid ';
  if (isStartMode) {
    if (file.type === ProjectFileType.VALIDATION) {
      icon += 'fa-flask';
    } else if (file.type === ProjectFileType.SUPPORT) {
      icon += 'fa-eye-slash';
    } else {
      // Starter files or files without a type, which default to starter.
      icon += 'fa-eye';
    }
  } else {
    icon += 'fa-file';
  }
  return icon;
}
