import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';
import type {LevelProperties} from '@code-dot-org/core/api';

import {START_SOURCES, TOOLBOX_BLOCKS} from '../constants';
import type {BlocklyLevelProperties, ProjectSources} from '../types';

import {getInitialSources} from './getInitialSources';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

/**
 * Computes which initial sources to present based on level and project information
 */
export function getInitialBlocklySources<
  T extends LevelProperties = LevelProperties,
  U = string,
>(
  levelProperties: T,
  projectSources?: ProjectSources<U>,
): ProjectSources<U> | undefined {
  const startSources = levelProperties.startSources as
    | ProjectSources<U>
    | undefined;

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

  return getInitialSources<T, U>(levelProperties, projectSources);
}
