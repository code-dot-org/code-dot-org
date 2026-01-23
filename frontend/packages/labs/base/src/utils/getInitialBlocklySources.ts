import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';

import {START_SOURCES, TOOLBOX_BLOCKS} from '../constants';
import type {
  BlocklyLevelProperties,
  LevelProperties,
  ProjectSources,
} from '../types';

import {getInitialSources} from './getInitialSources';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

/**
 * Computes which initial sources to present based on level and project information
 */
export function getInitialBlocklySources<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>(levelProperties: T, projectSources?: U): U | undefined {
  const startSources = levelProperties.startSources as U | undefined;

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

  return getInitialSources<T, U>(levelProperties, projectSources);
}
