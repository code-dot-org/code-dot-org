import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {ProjectFile} from '../types';

export function shouldShowFile(file?: ProjectFile) {
  // We could have an undefined file if the file referenced is a validation file.
  if (!file) {
    return false;
  }
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  // If we are in start mode, show all files except system support files.
  // If we are not in start mode, show starter files, locked starter files,
  // and files without a type.
  return isStartMode
    ? file.type !== ProjectFileType.SYSTEM_SUPPORT
    : file.type === ProjectFileType.STARTER ||
        file.type === ProjectFileType.LOCKED_STARTER ||
        !file.type;
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
    return {iconName: 'file', iconStyle: 'regular'};
  }
  if (file.type === ProjectFileType.VALIDATION) {
    return {iconName: 'flask', iconStyle: 'solid'};
  } else if (file.type === ProjectFileType.SUPPORT) {
    return {iconName: 'eye-slash', iconStyle: 'regular'};
  } else if (file.type === ProjectFileType.LOCKED_STARTER) {
    return {iconName: 'lock', iconStyle: 'solid'};
  } else {
    // Starter files or files without a type, which default to starter.
    return {iconName: 'eye', iconStyle: 'regular'};
  }
}

/**
 * Prepare the source for saving in levelbuilder. This moves the validation file
 * into a separate field and removes it from the files and list of open files, if
 * it was open. It also removes system support files, which are included in the sources
 * from the other level properties and therefore don't also need to be in the start sources
 * (for example, the maze grid).
 *
 * We split out the validation file because it is handled differently from start sources
 * in user code. The validation file is not saved to the user's project, and we always use
 * the validation file from the level, even if the level is template backed (and we are using
 * start code from the template).
 * @param source: MultiFileSource
 * @returns {parsedSource: MultiFileSource, validationFile: ProjectFile}
 */
export function prepareSourceForLevelbuilderSave(source?: MultiFileSource) {
  if (!source) {
    return {parsedSource: null, validationFile: null};
  }

  // We skip validation and system support files when saving to levelbuilder.
  // The validation file is split out into a separate field, and system support
  // files are not part of level start sources.
  const newFiles = Object.fromEntries(
    Object.entries(source.files).filter(
      ([_, file]) =>
        file.type !== ProjectFileType.VALIDATION &&
        file.type !== ProjectFileType.SYSTEM_SUPPORT
    )
  );
  let validationFile = getValidationFromSource(source) || null;
  let openFiles = source.openFiles;
  if (validationFile && source.openFiles?.includes(validationFile.id)) {
    openFiles = source.openFiles.filter(id => id !== validationFile?.id);
    validationFile = {...validationFile, open: false, active: false};
  }
  return {
    parsedSource: {...source, files: newFiles, openFiles: openFiles},
    validationFile,
  };
}

/**
 * In start mode we combine the start sources with the validation file
 * so levelbuilders can edit the validation file. Automatically open
 * the validation file if it exists.
 * @param source: MultiFileSource | undefined
 * @param validationFile: ProjectFile | undefined
 * @returns: MultiFileSource with the validation file added to the files, if it exists.
 */
export function combineStartSourcesAndValidation(
  source: MultiFileSource,
  validationFile?: ProjectFile
) {
  let returnValue = source;
  if (source && validationFile) {
    returnValue = {
      ...source,
      files: {
        ...source.files,
        [validationFile.id]: {...validationFile, open: true},
      },
      openFiles: source.openFiles
        ? [...source.openFiles, validationFile.id]
        : [validationFile.id],
    };
  }
  return returnValue;
}

export function getValidationFromSource(source: MultiFileSource) {
  return Object.values(source.files).find(
    f => f.type === ProjectFileType.VALIDATION
  );
}
