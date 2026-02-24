import * as BlocklyCore from 'blockly/core';

import {
  JsonBlockConfig,
  SerializedFields,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';

type FlyoutItemInfo = BlocklyCore.utils.toolbox.FlyoutItemInfo;
type FlyoutItemInfoArray = BlocklyCore.utils.toolbox.FlyoutItemInfoArray;

/**
 * Simplifies the state of blocks for a flyout by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the serialied variable map.
 * @param {object} serialization The serialized block state.
 * @returns {Array<object>} An array of simplified block objects.
 */
export function getSimplifiedStateForFlyout(
  serialization: WorkspaceSerialization
): FlyoutItemInfoArray {
  const blocksList: FlyoutItemInfoArray = [];

  const {variables, blocks} = serialization;

  // Create a map of variable ids and names from the serialization.
  const serializedVariableMap: Map<string, string> = new Map();
  variables?.forEach(variable => {
    serializedVariableMap.set(variable.id, variable.name);
  });

  // Create a copy of the blocks list to avoid modifying the original
  const blocksCopy = {...blocks};

  // Replace variable ids with names and simplify state for flyout.
  blocksCopy.blocks?.forEach(block => {
    updateVariableFields(
      block as {fields: SerializedFields},
      serializedVariableMap
    );
    blocksList.push(simplifyBlockState(block) as FlyoutItemInfo);
  });

  return blocksList;
}

// Function for updating field values
function updateVariableFields(
  block: {fields: SerializedFields},
  serializedVariableMap: Map<string, string>
): void {
  const fields = block.fields;
  for (const key in fields) {
    const field = fields[key];
    if (field?.id && serializedVariableMap.has(field.id)) {
      field.name = serializedVariableMap.get(field.id)!;
      delete field.id;
    }
  }
}
/**
 * Simplifies the state of a block by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the specified variable map.
 * @param {object} block The block to process.
 * @returns {object} The processed block with variable names.
 */
function simplifyBlockState(block: JsonBlockConfig) {
  // Create a copy of the block so we can modify certain fields.
  const result = {...block};

  // Recursively check nested blocks.
  if (block.inputs?.block) {
    for (const inputKey in block.inputs) {
      result.inputs![inputKey].block = simplifyBlockState(
        block.inputs[inputKey].block
      );
    }
  }
  // Recursively check next block, if present.
  if (block.next?.block) {
    result.next!.block = simplifyBlockState(block.next.block);
  }
  // Remove unnecessary properties
  delete result.id;
  delete result.x;
  delete result.y;

  // Add 'kind' property
  result.kind = 'block';

  return result;
}
