import _ from 'lodash';

import {
  BlocklyWrapperType,
  JsonBlockConfig,
  WorkspaceSerialization,
  ExtendedBlockSvg,
} from '@cdo/apps/blockly/types';

export function hasBlocks(
  workspaceSerialization: WorkspaceSerialization | null
) {
  return (
    !_.isEmpty(workspaceSerialization) &&
    _.has(workspaceSerialization, 'blocks.blocks')
  );
}

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
 * Partitions JSON objects of the specified types to the front of the list.
 *
 * @param {Object[]} [blocks=[]] - An array of JSON blocks to be partitioned.
 * @param {string[]} [prioritizedBlockTypes=[]] - An array of strings representing block types to move to the front.
 * @returns {Object[]} A new array of JSON blocks partitioned based on their types.
 */
export function partitionJsonBlocksByType(
  blocks: ExtendedBlockSvg[] = [],
  prioritizedBlockTypes: string[] = []
) {
  const prioritizedBlocks: ExtendedBlockSvg[] = [];
  const remainingBlocks: ExtendedBlockSvg[] = [];

  blocks.forEach(block => {
    const blockType = block.type;
    prioritizedBlockTypes.includes(blockType)
      ? prioritizedBlocks.push(block)
      : remainingBlocks.push(block);
  });

  return [...prioritizedBlocks, ...remainingBlocks];
}
