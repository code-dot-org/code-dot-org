import {isEmpty} from 'lodash';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import type {Sources} from './types';

/**
 * A project with scenes keeps its programs in them, so its top-level source
 * is left empty. A project with no scenes yet still reads its one program
 * from there. Returns the same object when there is nothing to empty.
 */
export function withoutTopLevelSource(sources: Sources): Sources {
  if (!sources.scenes?.length || isEmpty(sources.source)) {
    return sources;
  }
  // An empty object, not a missing key: a saved project must have a source.
  return {...sources, source: {} as WorkspaceSerialization};
}
