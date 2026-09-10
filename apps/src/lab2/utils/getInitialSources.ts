import {cloneDeep} from 'lodash';

import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();
const isViewingExemplar = getAppOptionsViewingExemplar();

/**
 * Deep copy for sources handed to labs. Sources read off levelProperties are
 * references into the immer-frozen redux state, and defaultSources is a
 * shared module constant serving every re-initialization: hand each consumer
 * its own mutable copy. Labs migrate and edit sources in place, which throws
 * on a frozen object in the production bundle's strict mode — and silently
 * does nothing in the dev bundle, whose react-refresh wrapping drops
 * 'use strict', so the throw only ever shows in production. Server-loaded
 * project sources are already the consumer's own and need no copy.
 */
export function copySources<T extends object>(sources: T): T;
export function copySources<T extends object>(
  sources: T | undefined
): T | undefined;
export function copySources<T extends object>(
  sources: T | undefined
): T | undefined {
  return sources && cloneDeep(sources);
}

/**
 * Computes which initial sources to present based on level and project information
 */
export default function <T extends ProjectSources>(
  levelProperties: LevelProperties,
  projectSources?: T,
  toolboxEditSources?: T
): T | undefined {
  const startSources = levelProperties.startSources as T | undefined;
  const templateSources = levelProperties.templateSources as T | undefined;
  const exemplarSources = levelProperties.exemplarSources as T | undefined;
  const predictSettings = levelProperties.predictSettings;

  if (isStartMode) {
    return copySources(startSources);
  }

  if (isToolboxMode) {
    return toolboxEditSources;
  }

  if (isEditingExemplar || isViewingExemplar) {
    return copySources(exemplarSources);
  }

  if (
    predictSettings?.isPredictLevel &&
    !predictSettings?.codeEditableAfterSubmit
  ) {
    // Predict levels only use sources loaded from the server if the code is
    // editable after submit, otherwise use the start sources.
    return copySources(templateSources || startSources);
  }

  // Project sources arrive freshly parsed from the server and are already
  // this consumer's own; only the level-derived fallbacks need copying.
  return projectSources || copySources(templateSources || startSources);
}
