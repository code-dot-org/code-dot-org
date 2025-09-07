import {toolboxToWorkspaceBlocks} from '@cdo/apps/blockly/utils/toolbox';
import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  BlocklyLevelProperties,
  LevelProperties,
  ProjectSources,
} from '@cdo/apps/lab2/types';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();
const isViewingExemplar = getAppOptionsViewingExemplar();

/**
 * Computes which initial sources to present based on level and project information
 */
export default function <T extends ProjectSources>(
  levelProperties: LevelProperties,
  projectSources?: T
) {
  const startSources = levelProperties.startSources as T | undefined;
  const templateSources = levelProperties.templateSources as T | undefined;
  const exemplarSources = levelProperties.exemplarSources as T | undefined;
  const predictSettings = levelProperties.predictSettings;

  if (isStartMode) {
    return startSources;
  }

  if (isToolboxMode) {
    return {
      source: toolboxToWorkspaceBlocks(
        (levelProperties as BlocklyLevelProperties).toolboxDefinition
      ),
    };
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
