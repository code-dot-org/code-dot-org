import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';
import type {LevelProperties} from '@code-dot-org/core/api';

//import {START_SOURCES, TOOLBOX_BLOCKS} from '../constants';
import type {BlocklyLevelProperties, ProjectSources} from '../types';

// TODO: get app_options instead and do this dynamically
/*const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();
const isViewingExemplar = getAppOptionsViewingExemplar();*/
const isStartMode = false;
const isToolboxMode = false;
const isEditingExemplar = false;
const isViewingExemplar = false;

/**
 * Computes which initial sources to present based on level and project information
 */
export function getInitialSources<
  T extends LevelProperties = LevelProperties,
  U = string,
>(
  levelProperties: T,
  projectSources?: ProjectSources<U>,
): ProjectSources<U> | undefined {
  const startSources = levelProperties.startSources as
    | ProjectSources<U>
    | undefined;
  const templateSources = levelProperties.templateSources as
    | ProjectSources<U>
    | undefined;
  const exemplarSources = levelProperties.exemplarSources as
    | ProjectSources<U>
    | undefined;
  const predictSettings = levelProperties.predictSettings;

  if (isStartMode) {
    return startSources;
  }

  if (isToolboxMode) {
    return {
      source: toolboxToWorkspaceBlocks(
        (levelProperties as BlocklyLevelProperties).toolboxDefinition,
      ),
    } as ProjectSources<U>;
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
