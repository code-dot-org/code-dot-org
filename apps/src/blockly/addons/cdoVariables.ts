import GoogleBlockly, {Block} from 'blockly';

import {BLOCK_TYPES, VARIABLE_BLOCK_TYPES} from '../constants';
import {BlocklyWrapperType} from '../types';

export default function initializeVariables(
  blocklyWrapper: BlocklyWrapperType
) {
  // Re-use the variable getter block's generator function for paramters.
  blocklyWrapper.JavaScript.forBlock.parameters_get =
    blocklyWrapper.JavaScript.forBlock.variables_get;

  // TODO: Removing support for sprite variables as a separate variable type is
  // captured in https://codedotorg.atlassian.net/browse/CT-213
  blocklyWrapper.Variables.getters = {
    Default: 'variables_get',
  };
  blocklyWrapper.Variables.registerGetter = function (category, blockName) {
    blocklyWrapper.Variables.getters[category] = blockName;
  };

  /**
   * Find all the variables used in the provided block.
   * @param {Blockly.Block} block Block to check for variables.
   * @returns {string[]} Array of all the variable IDs used.
   */
  blocklyWrapper.Variables.allVariablesFromBlock = function (block) {
    return block.getVars();
  };

  /**
   * Standard implementation of getVars for blocks with a single 'VAR' field
   */
  blocklyWrapper.Variables.getVars = function (this: Block) {
    return [this.getFieldValue('VAR')];
  };

  // Add serialization hooks to allow these blocks to be hidden on the
  // hidden definition workspace. Previously they were used to pre-populate
  // variable dropdown blocks in the toolbox.
  VARIABLE_BLOCK_TYPES.forEach(blockType => {
    if (blocklyWrapper.Blocks[blockType]) {
      blocklyWrapper.customBlocks.addSerializationHooksToBlock(
        blocklyWrapper.Blocks[blockType]
      );
    }
  });
}

// Delete all variables except those that are in use in the workspace.
export function deleteUnusedVariables(workspace: GoogleBlockly.Workspace) {
  // Get all declared variables
  const allVariables = workspace.getAllVariables();

  // Get all used variables
  const usedVariables = Blockly.Variables.allUsedVarModels(workspace);

  // Convert used variables to a set for easy lookup
  const usedVariableIds = new Set(
    usedVariables.map(variable => variable.getId())
  );

  // Find unused variables
  const unusedVariables = allVariables.filter(
    variable => !usedVariableIds.has(variable.getId())
  );
  unusedVariables.forEach(varToDelete => {
    workspace.deleteVariableById(varToDelete.getId());
  });
}

export function getNonFunctionVariableIds(workspace: GoogleBlockly.Workspace) {
  const allVariableIds =
    workspace?.getVariablesOfType('').map(variable => variable.getId()) || [];
  const nonFunctionIds = allVariableIds.filter(id => {
    const varUses = workspace.getVariableUsesById(id);
    return (
      // Newly created variables will not have any uses.
      !varUses.length ||
      // Variables in use should have some non-function uses.
      varUses.some(block => {
        return ![
          BLOCK_TYPES.argumentReporter,
          BLOCK_TYPES.procedureCall,
          BLOCK_TYPES.procedureCallReturn,
          BLOCK_TYPES.procedureDefinition,
          BLOCK_TYPES.procedureDefinitionReturn,
        ].includes(block.type as BLOCK_TYPES);
      })
    );
  });
  return nonFunctionIds;
}
