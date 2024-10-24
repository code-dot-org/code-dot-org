import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

import {BlockMode} from '../constants';

import {BlockTypes} from './blockTypes';
import {DOCS_BASE_URL} from './constants';

// Cache for storing Music Lab specific block definitions and generators.
const BlockCache = {
  blockDefinitions: {},
  blockGenerators: {},
};

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
    // Re-define blocks from core, in case they were deleted for Simple2 mode.
    restoreBlockDefinitions();
    // Copies the generator function for variables to our function argument reporters.
    Blockly.JavaScript.forBlock.argument_reporter =
      Blockly.JavaScript.forBlock.variables_get;
  } else {
    Blockly.cdoUtils.registerCustomProcedureBlocks();
    // Remove two advanced blocks in the toolbox's Functions category that
    // we don't want.
    delete Blockly.Blocks.procedures_defreturn;
    delete Blockly.Blocks.procedures_ifreturn;
    // Override the function call generator in Simple2.
    Blockly.JavaScript.forBlock['procedures_callnoreturn'] = (
      block,
      generator
    ) =>
      simple2FunctionCallGenerator(
        generator.getProcedureName(block.getFieldValue('NAME'))
      );
  }
  // Sets the help URL for each function definiton block to the appropriate
  // entry in the Music Lab docs.
  Blockly.Msg['PROCEDURES_DEFRETURN_HELPURL'] =
    DOCS_BASE_URL + 'create_function';
  Blockly.Msg['PROCEDURES_DEFNORETURN_HELPURL'] =
    DOCS_BASE_URL + 'create_function';
}

// Creates shallow copies of block definitions and generators from core Blockly.
// These definitions and overwritten by Simple2 but needed for advanced mode.
// This makes it possible for us to switch block modes without a page reload.
// See also: installFunctionBlocks
export function backupFunctionDefinitons() {
  const backupBlockDefinitionTypes = [
    // Can potentially be overwritten by Simple2
    BLOCK_TYPES.procedureCall,
    // Can potentially be deleted by Simple2
    BLOCK_TYPES.procedureIfReturn,
  ];
  backupBlockDefinitionTypes.forEach(type => {
    BlockCache.blockDefinitions[type] = Object.assign({}, Blockly.Blocks[type]);
    BlockCache.blockGenerators[type] = Blockly.getGenerator().forBlock[type];
  });
}

// Re-defines blocks using previously stored definitions and generators.
// These definitions and overwritten by Simple2 but needed for advanced mode.
// This makes it possible for us to switch block modes without a page reload.
// See also: installFunctionBlocks
function restoreBlockDefinitions() {
  const blockDefinitions = {};
  Object.keys(BlockCache.blockDefinitions).forEach(type => {
    blockDefinitions[type] = BlockCache.blockDefinitions[type];
  });
  Blockly.common.defineBlocks(blockDefinitions);

  Object.keys(BlockCache.blockGenerators).forEach(type => {
    Blockly.getGenerator().forBlock[type] = BlockCache.blockGenerators[type];
  });
}

// A helper function to generate the code for a function call to play sounds sequentially.
function simple2FunctionCallGenerator(functionName) {
  return `
    Sequencer.startFunctionContext('${functionName}');
    Sequencer.playSequential();
    ${functionName}();
    Sequencer.endSequential();
    Sequencer.endFunctionContext();
  `;
}

// For a given block id, return a list of block types. These block types
// represent any C-shaped block between itself and the root (top) block
// which contains it. The returned list could include types for loop blocks,
// function definitions, conditionals, or other control structures.
// These blocks all have a "statement" input that contains other blocks.
export function findParentStatementInputTypes(id) {
  if (id === 'preview') {
    return [];
  }
  const block = Blockly.getMainWorkspace().getBlockById(id);
  const parentTypes = [];
  function addParentBlockTypes(currentBlock) {
    if (currentBlock) {
      const parentBlock = currentBlock.getParent();
      const parentInput =
        currentBlock.previousConnection?.targetConnection?.getParentInput();
      if (parentInput?.type === Blockly.inputTypes.STATEMENT) {
        parentTypes.push(parentBlock.type);
      }
      addParentBlockTypes(parentBlock);
    }
  }

  addParentBlockTypes(block);

  return parentTypes;
}
