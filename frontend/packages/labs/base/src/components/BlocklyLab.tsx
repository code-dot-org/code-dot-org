import {useMemo} from 'react';

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';
import type {ProjectSources} from '@code-dot-org/projects';

import {TOOLBOX_BLOCKS} from '../constants';
import type {
  BlocklySource,
  LevelProperties,
  BlocklyLevelProperties,
} from '../types';
import {getInitialBlocklySources} from '../utils';

import LabWithSources from './LabWithSources';
import type {LabWithSourcesProps} from './LabWithSources';

export type BlocklyLabProps<T extends LevelProperties = LevelProperties> =
  LabWithSourcesProps<T, ProjectSources<BlocklySource>>;

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

export const STARTOVER_WORKSPACE_BLOCKS_MESSAGE =
  "This will reset the workspace to its start state and remove all the blocks you've added or changed.";

const BlocklyLab = <T extends LevelProperties = LevelProperties>({
  children,
  ...props
}: BlocklyLabProps<T>) => {
  // Sources to reset to when starting over. Depends on the level edit mode.
  const memoizedStartOverSources: ProjectSources<BlocklySource> | undefined =
    useMemo(() => {
      const {levelProperties, startOverSources} = props;

      if (startOverSources) {
        return startOverSources;
      }

      if (isToolboxMode) {
        return {
          source: toolboxToWorkspaceBlocks(
            (levelProperties as BlocklyLevelProperties).toolboxDefinition,
          ),
        };
      }

      return undefined;
    }, [props]);

  return (
    <LabWithSources<T, ProjectSources<BlocklySource>>
      {...props}
      startOverMessage={props.startOverMessage || STARTOVER_WORKSPACE_BLOCKS_MESSAGE}
      getInitialSources={props.getInitialSources || getInitialBlocklySources}
      startOverSources={memoizedStartOverSources || props.startOverSources}
    >
      {children}
    </LabWithSources>
  );
};

export default BlocklyLab;
