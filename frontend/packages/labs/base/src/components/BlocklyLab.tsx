import {useCallback} from 'react';

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';
import type {ProjectSources, Source} from '@code-dot-org/projects';

import {TOOLBOX_BLOCKS} from '../constants';
import type {LevelProperties, BlocklyLevelProperties} from '../types';
import {getInitialBlocklySources} from '../utils';

import LabWithSources from './LabWithSources';
import type {LabWithSourcesProps} from './LabWithSources';

export type BlocklyLabProps<T extends LevelProperties = LevelProperties> =
  LabWithSourcesProps<T, BlocklySerialization>;

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

export const STARTOVER_WORKSPACE_BLOCKS_MESSAGE =
  "This will reset the workspace to its start state and remove all the blocks you've added or changed.";

/**
 * This wraps a lab that has a Blockly workspace and Blockly-based sources.
 *
 * Effectively, this is a special case of a LabWithSources that understands that
 * the sources are meant to be some kind of Blockly serialization.
 */
const BlocklyLab = <T extends LevelProperties = LevelProperties>({
  children,
  ...props
}: BlocklyLabProps<T>) => {
  const {startOverSources} = props;

  // Sources to reset to when starting over. Depends on the level edit mode.
  const memoizedStartOverSources = useCallback(
    (levelProperties: T) => {
      if (startOverSources) {
        return startOverSources(levelProperties);
      }

      return {
        source: toolboxToWorkspaceBlocks(
          (levelProperties as BlocklyLevelProperties).toolboxDefinition,
        ),
      } as ProjectSources<BlocklySerialization>;
    },
    [startOverSources],
  );

  const transform = (sources: ProjectSources<BlocklySerialization>) => {
    if (typeof sources.source === 'string') {
      sources = {
        ...sources,
        source: JSON.parse(sources.source) as Source<BlocklySerialization>,
      };
    }
    return sources;
  };

  return (
    <LabWithSources<T, BlocklySerialization>
      {...props}
      startOverMessage={
        props.startOverMessage || STARTOVER_WORKSPACE_BLOCKS_MESSAGE
      }
      getInitialSources={
        props.getInitialSources ||
        getInitialBlocklySources<T, BlocklySerialization>
      }
      startOverSources={
        isToolboxMode ? memoizedStartOverSources : props.startOverSources
      }
      transform={transform}
    >
      {children}
    </LabWithSources>
  );
};

export default BlocklyLab;
