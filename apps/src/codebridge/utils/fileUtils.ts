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

export function getFileIconNameAndStyle(file: ProjectFile): {
  iconName: string;
  iconStyle: 'solid' | 'regular';
  isBrand?: boolean;
} {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  if (!isStartMode) {
    if (file.name.endsWith('.py')) {
      return {iconName: 'python', iconStyle: 'regular', isBrand: true};
    }
    return {iconName: 'file', iconStyle: 'solid'};
  }
  if (file.type === ProjectFileType.VALIDATION) {
    return {iconName: 'flask', iconStyle: 'solid'};
  } else if (file.type === ProjectFileType.SUPPORT) {
    return {iconName: 'eye-slash', iconStyle: 'regular'};
  } else {
    // Starter files or files without a type, which default to starter.
    return {iconName: 'eye', iconStyle: 'regular'};
  }
}
