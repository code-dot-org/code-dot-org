import * as BlocklyCore from 'blockly/core';

import {
  BlocklyWrapperType,
  JsonBlockConfig,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';

export function applyBlockIdOverrides(
  workspaceJson: WorkspaceSerialization,
  overrides: BlocklyWrapperType['blockIdOverrides']
) {
  function walkBlocks(block: JsonBlockConfig) {
    if (block.id && overrides[block.id]) {
      block.id = overrides[block.id];
    }
    if (block.next?.block) {
      walkBlocks(block.next.block);
    }
    if (block.inputs) {
      for (const stmt of Object.values(block.inputs)) {
        if (stmt?.block) {
          walkBlocks(stmt.block);
        }
      }
    }
  }

  if (Array.isArray(workspaceJson.blocks?.blocks)) {
    workspaceJson.blocks.blocks.forEach(walkBlocks);
  }
}

/**
 * Determines whether the hidden procedure definition workspace should be skipped during serialization.
 * The hidden workspace is a counter-part to the main workspace containing blocks for functions and behaviors.
 *
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to be checked for serialization as hidden.
 * @returns {boolean} Returns `true` if the hidden workspace should be skipped, otherwise `false`.
 */
export function shouldSkipHiddenWorkspace(workspace: BlocklyCore.WorkspaceSvg) {
  return (
    !Blockly.getHiddenDefinitionWorkspace ||
    Blockly.getMainWorkspace().id !== workspace.id ||
    Blockly.isToolboxMode
  );
}
