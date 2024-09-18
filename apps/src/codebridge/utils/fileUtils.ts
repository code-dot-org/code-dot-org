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

export function getFileIconName(file: ProjectFile) {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  if (!isStartMode) {
    return 'file';
  }
  if (file.type === ProjectFileType.VALIDATION) {
    return 'flask';
  } else if (file.type === ProjectFileType.SUPPORT) {
    return 'eye-slash';
  } else {
    // Starter files or files without a type, which default to starter.
    return 'eye';
  }
}
