import * as BlocklyCore from 'blockly/core';

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
