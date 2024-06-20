import {Block} from 'blockly';

import {VARIABLE_BLOCK_TYPES} from '../constants';
import {BlocklyWrapperType} from '../types';

export default function initializeVariables(
  blocklyWrapper: BlocklyWrapperType
) {
  // Re-use the variable getter block's generator function for paramters.
  blocklyWrapper.JavaScript.forBlock.parameters_get =
    blocklyWrapper.JavaScript.forBlock.variables_get;
  blocklyWrapper.Variables.DEFAULT_CATEGORY = 'Default';

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
   * Standard implementation of getVars for blocks with a single 'VAR' title
   * @param {string=} opt_category Variable category, defaults to 'Default'
   */
  blocklyWrapper.Variables.getVars = function (this: Block, opt_category) {
    const category = opt_category || blocklyWrapper.Variables.DEFAULT_CATEGORY;
    const vars: {[key: string]: string[]} = {};
    vars[category] = [this.getFieldValue('VAR')];
    return vars;
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
