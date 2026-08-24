import * as BlocklyCore from 'blockly/core';
import {useCallback} from 'react';

import {BlockDefinition} from '@cdo/apps/blockly/types';
import useLab2BlocklyWorkspace, {
  UseBlocklyWorkspaceResult,
} from '@cdo/apps/lab2/views/useBlocklyWorkspace';

import {
  ensureInjectedCategories,
  ensurePredefinedBehaviors,
  ensureSceneBlocks,
  filterToolboxToRegisteredBlocks,
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

interface UseBlocklyWorkspaceOptions {
  enabled: boolean;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // XML string toolbox format. TODO: switch new levels over to JSON.
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
}

/**
 * A Sprite Lab Blockly workspace rendered into the BLOCKLY_DIV_ID div the caller mounts.
 */
export default function useBlocklyWorkspace({
  enabled,
  toolboxDefinition,
  toolboxXml,
  sharedBlocks,
  theme,
}: UseBlocklyWorkspaceOptions): UseBlocklyWorkspaceResult {
  const setupBlockly = useCallback(() => {
    setupSpriteLab2BlocklyEnvironment();
    installSharedBlocks(sharedBlocks || []);
  }, [sharedBlocks]);

  const prepareToolbox = useCallback(
    (toolbox: BlocklyCore.utils.toolbox.ToolboxDefinition | string) => {
      if (typeof toolbox !== 'string') {
        return toolbox;
      }

      // Add the full behavior set, scene blocks, and injected categories,
      // then drop unregistered block references so opening a category never
      // throws.
      return filterToolboxToRegisteredBlocks(
        ensureInjectedCategories(
          ensureSceneBlocks(ensurePredefinedBehaviors(toolbox))
        )
      );
    },
    []
  );

  return useLab2BlocklyWorkspace({
    blocklyDivId: BLOCKLY_DIV_ID,
    enabled,
    toolboxDefinition,
    toolboxXml,
    theme,
    setupBlockly,
    prepareToolbox,
  });
}
