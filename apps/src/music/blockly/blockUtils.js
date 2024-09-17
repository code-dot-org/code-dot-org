import {PROCEDURES_IFRETURN} from '@cdo/apps/blockly/addons/plusMinusBlocks/advancedProcedures';

import {BlockMode} from '../constants';
import musicI18n from '../locale';

import {BlockTypes} from './blockTypes';
import {DOCS_BASE_URL} from './constants';

/**
 * Generate code for the specified block but not following blocks.
 * Adapted from this thread: https://groups.google.com/g/blockly/c/uXewhtr-mvM
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
export function getCodeForSingleBlock(block) {
  if (!block) {
    return '';
  }
  if (block.disabled) {
    // Skip past this block if it is disabled.
    return getCodeForSingleBlock(block.getNextBlock());
  }

  var func = Blockly.JavaScript[block.type];
  if (typeof func !== 'function') {
    throw Error(
      'Language "JavaScript" does not know how to generate ' +
        'code for block type: ' +
        block.type
    );
  }
  // First argument to func.call is the value of 'this' in the generator.
  // Prior to 24 September 2013 'this' was the only way to access the block.
  // The current preferred method of accessing the block is through the second
  // argument to func.call, which becomes the first parameter to the generator.
  var code = func.call(block, block);
  if (Array.isArray(code)) {
    // Value blocks return tuples of code and operator order.
    if (!block.outputConnection) {
      throw Error('Expecting string from statement block: ' + block.type);
    }
    return [code[0], code[1]];
  } else if (typeof code === 'string') {
    //var id = block.id.replace(/\$/g, '$$$$'); // Issue 251.
    //if (this.STATEMENT_PREFIX) {
    //  code = this.STATEMENT_PREFIX.replace(/%1/g, "'" + id + "'") + code;
    //}
    return code;
  } else if (code === null) {
    // Block has handled code generation itself.
    return '';
  } else {
    throw Error('Invalid code generated: ' + code);
  }
}

// Check if root block is 'when_run'.
export const isBlockInsideWhenRun = block => {
  return [BlockTypes.WHEN_RUN, BlockTypes.WHEN_RUN_SIMPLE2].includes(
    block.getRootBlock().type
  );
};

// Override default function block implementation for the current block mode.
export function installFunctionBlocks(blockMode) {
  if (blockMode === BlockMode.ADVANCED) {
    Blockly.cdoUtils.registerCustomAdvancedProcedureBlocks();
    // Re-define if-return, in case it was deleted by Simple2 mode, below.
    Blockly.common.defineBlocks({
      procedures_ifreturn: PROCEDURES_IFRETURN,
    });
    // Replaces "variable:" with "parameter:" for added parameters
    Blockly.Msg['PROCEDURE_VARIABLE'] = musicI18n.parameterLabel();
  } else {
    Blockly.cdoUtils.registerCustomProcedureBlocks();
    // Remove two advanced blocks in the toolbox's Functions category that
    // we don't want.
    delete Blockly.Blocks.procedures_defreturn;
    delete Blockly.Blocks.procedures_ifreturn;
  }
  // Sets the help URL for each function definiton block the appropriate
  // entry in the Music Lab docs.
  Blockly.Msg['PROCEDURES_DEFRETURN_HELPURL'] =
    DOCS_BASE_URL + 'create_function';
  Blockly.Msg['PROCEDURES_DEFNORETURN_HELPURL'] =
    DOCS_BASE_URL + 'create_function';
}
