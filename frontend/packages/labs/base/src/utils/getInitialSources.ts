import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@code-dot-org/api';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';

import {START_SOURCES, TOOLBOX_BLOCKS} from '../constants';
import type {
  BlocklyLevelProperties,
  LevelProperties,
  ProjectSources,
} from '../types';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();
const isViewingExemplar = getAppOptionsViewingExemplar();

/**
 * Computes which initial sources to present based on level and project information
 */
export function getInitialSources<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>(levelProperties: T, projectSources?: U): U | undefined {
  const startSources = levelProperties.startSources as U | undefined;
  const templateSources = levelProperties.templateSources as U | undefined;
  const exemplarSources = levelProperties.exemplarSources as U | undefined;
  const predictSettings = levelProperties.predictSettings;

  if (isStartMode) {
    return startSources;
  }

  if (isToolboxMode) {
    return {
      source: toolboxToWorkspaceBlocks(
        (levelProperties as BlocklyLevelProperties).toolboxDefinition,
      ),
    } as U;
  }

  if (isEditingExemplar || isViewingExemplar) {
    return exemplarSources;
  }

  if (
    predictSettings?.isPredictLevel &&
    !predictSettings?.codeEditableAfterSubmit
  ) {
    // Predict levels only use sources loaded from the server if the code is
    // editable after submit, otherwise use the start sources.
    return templateSources || startSources;
  }

  return projectSources || templateSources || startSources;
}
