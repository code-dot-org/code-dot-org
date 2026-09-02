// Refresh every dropdown registry from a project that has just been edited.
//
// Each importer does this before it hands a field its value: the dropdown
// rebuilds from the registry, and a value with no matching option is dropped by
// Blockly. It was six copies of the same three arguments in one editor; a
// fourth argument made that a list to keep in step, so it became one function —
// and it is a module function rather than a hook because two components need it
// now (`LibraryImports` writes the files, `BlocklyFileEditor` still writes some
// of its own).

import type {MultiFileSource} from '@code-dot-org/core/api';

import {refreshProjectDropdowns} from '../blockly/projectDropdowns';
import {projectImageSizes} from '../runtime/imageSize';
import {
  projectFiles,
  projectImagePaths,
  projectSoundPaths,
} from '../runtime/projectFiles';

export const refreshFor = (source: MultiFileSource): void => {
  refreshProjectDropdowns(
    projectFiles(source),
    projectImagePaths(source),
    projectImageSizes(source),
    projectSoundPaths(source),
  );
};
