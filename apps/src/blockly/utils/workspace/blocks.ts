import * as BlocklyCore from 'blockly/core';

type BlockList = Array<BlocklyCore.Block | BlocklyCore.BlockSvg>;
/**
 * Retrieves the top-level Blockly blocks from the students Blockly workspace and
 * potentially includes the top-level blocks from the hidden definition workspace.
 *
 * @returns {BlockList} An array of the top-level blocks.
 */
export function getCodeBlocks(): BlockList {
  let codeBlocks: BlockList = [];
  let hiddenBlocks: BlockList = [];
  const mainBlocks = Blockly.mainBlockSpace.getTopBlocks(true) as BlockList;

  // The hidden workspace is only present in Blockly labs where the modal
  // function editor is enabled.
  if (Blockly.getHiddenDefinitionWorkspace()) {
    hiddenBlocks = Blockly.getHiddenDefinitionWorkspace().getTopBlocks(
      true
    ) as BlockList;
  }

  // Hidden blocks need to be listed first in case they would set the
  // value of global variables.
  codeBlocks = [...hiddenBlocks, ...mainBlocks];

  return codeBlocks;
}

/**
 * Retrieves all Blockly blocks from the student's Blockly workspaces.
 * This is useful for providing the student with feedback about the total
 * number of blocks they have used or added.
 *
 * @returns {BlockList} An array of all blocks.
 */
export function getAllBlocks(): BlockList {
  return [
    ...Blockly.mainBlockSpace.getAllUsedBlocks(),
    ...(Blockly.getHiddenDefinitionWorkspace()
      ? Blockly.getHiddenDefinitionWorkspace().getAllBlocks()
      : []),
  ];
}
