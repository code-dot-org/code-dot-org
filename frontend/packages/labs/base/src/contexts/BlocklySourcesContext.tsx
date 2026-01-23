import type {PropsWithChildren} from 'react';
import {useMemo, useContext} from 'react';

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {toolboxToWorkspaceBlocks} from '@code-dot-org/blockly-workspace/utils';
import type {ProjectSources} from '@code-dot-org/projects';

import {TOOLBOX_BLOCKS} from '../constants';
import type {BlocklySource, BlocklyLevelProperties} from '../types';
import {getInitialBlocklySources} from '../utils';

import SourcesContext, {SourcesProvider} from './SourcesContext';
import type {SourcesContent, SourcesProviderProps} from './SourcesContext';

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

export type BlocklySourcesContent = SourcesContent<
  ProjectSources<BlocklySource>
>;

/**
 * This hook returns the current Blockly-based lab sources.
 */
export const useBlocklySources = () => {
  return useContext(SourcesContext) as unknown as BlocklySourcesContent;
};

/**
 * Holds the sources for a Blockly-based lab.
 */
export const BlocklySourcesProvider = <
  T extends BlocklyLevelProperties = BlocklyLevelProperties,
>({
  children,
  ...props
}: SourcesProviderProps<T, ProjectSources<BlocklySource>> &
  PropsWithChildren) => {
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
    <SourcesProvider<T, ProjectSources<BlocklySource>>
      getInitialSources={getInitialBlocklySources}
      startOverSources={props.startOverSources || memoizedStartOverSources}
      {...props}
    >
      {children}
    </SourcesProvider>
  );
};

export default SourcesContext;
