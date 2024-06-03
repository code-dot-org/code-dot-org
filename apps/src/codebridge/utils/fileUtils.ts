import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';

import {ProjectFile} from '../types';

export function shouldShowFile(file: ProjectFile) {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  // If we are in start mode, show all files. If we are not in start mode,
  // hide files that are hidden or are validation.
  return isStartMode ? true : !file.hidden && !file.validation;
}
