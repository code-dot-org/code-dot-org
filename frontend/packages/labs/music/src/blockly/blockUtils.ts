import {isProcedureBlock} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';

import {BLOCK_TYPES} from '@code-dot-org/blockly-workspace';
import type {
  JavascriptBlockGenerator,
  BlocklySerialization,
  ProcedureBlock,
} from '@code-dot-org/blockly-workspace';

import {BlockMode, MAX_FUNCTION_CALLS_COUNT} from '../constants';

import {BlockTypes} from './blockTypes';
import {DOCS_BASE_URL} from './constants';

type BlockDefinitions = {
  [key in BLOCK_TYPES]?: Blockly.Block;
};

type BlockGenerators = {
  [key in BLOCK_TYPES]?: JavascriptBlockGenerator;
};

// Cache for storing Music Lab specific block definitions and generators.
const BlockCache: {
  blockDefinitions: BlockDefinitions;
  blockGenerators: BlockGenerators;
} = {
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
export function getCodeForSingleBlock(
  block: Blockly.Block | null,
  javascriptGenerator: JavascriptGenerator,
) {
  if (!block) {
    return '';
  }

  if (!block.isEnabled()) {
    // Skip past this block if it is disabled.
    return getCodeForSingleBlock(block.getNextBlock(), javascriptGenerator);
  }

  const func = javascriptGenerator.forBlock[block.type];
  if (typeof func !== 'function') {
    throw Error(
      'Language "JavaScript" does not know how to generate ' +
        'code for block type: ' +
        block.type,
    );
  }
  // First argument to func.call is the value of 'this' in the generator.
  // Prior to 24 September 2013 'this' was the only way to access the block.
  // The current preferred method of accessing the block is through the second
  // argument to func.call, which becomes the first parameter to the generator.
  const code = func.call(block, block, javascriptGenerator);
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
export const isBlockInsideWhenRun: (
  block: Blockly.Block,
) => boolean = block => {
  return [
    BlockTypes.WHEN_RUN as string,
    BlockTypes.WHEN_RUN_SIMPLE2 as string,
  ].includes(block.getRootBlock().type);
};

// Override default function block implementation for the current block mode.
export function installFunctionBlocks(
  blockMode: (typeof BlockMode)[keyof typeof BlockMode],
  javascriptGenerator: JavascriptGenerator,
) {
  if (blockMode === BlockMode.ADVANCED) {
    // TODO: just add the advanced procedure blocks to the blocks array for BlocklyWorkspace
    //Blockly.cdoUtils.registerCustomAdvancedProcedureBlocks();
    // Re-define blocks from core, in case they were deleted for Simple2 mode.
    restoreBlockDefinitions(javascriptGenerator);
    // Copies the generator function for variables to our function argument reporters.
    javascriptGenerator.forBlock.argument_reporter =
      javascriptGenerator.forBlock.variables_get;
  } else {
    // TODO: just add the normal procedure blocks or whatever you need
    //Blockly.cdoUtils.registerCustomProcedureBlocks();
    // Remove two advanced blocks in the toolbox's Functions category that
    // we don't want.
    delete Blockly.Blocks.procedures_defreturn;
    delete Blockly.Blocks.procedures_ifreturn;
    // Override the function call generator in Simple2.
    javascriptGenerator.forBlock['procedures_callnoreturn'] = (
      block: Blockly.Block,
      generator: JavascriptGenerator,
    ) => {
      if (isProcedureBlock(block)) {
        const procedureBlock = block as ProcedureBlock;
        return simple2FunctionCallGenerator(
          generator.getProcedureName(procedureBlock.getFieldValue('NAME')),
          procedureBlock.getProcedureModel().getId(),
        );
      }
      return '';
    };
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
export function backupFunctionDefinitons(
  javascriptGenerator: JavascriptGenerator,
) {
  const backupBlockDefinitionTypes = [
    // Can potentially be overwritten by Simple2
    BLOCK_TYPES.procedureCall,
    // Can potentially be deleted by Simple2
    BLOCK_TYPES.procedureIfReturn,
  ];
  backupBlockDefinitionTypes.forEach(type => {
    BlockCache.blockDefinitions[type] = {...Blockly.Blocks[type as string]};
    BlockCache.blockGenerators[type] =
      javascriptGenerator.forBlock[type as string];
  });
}

// Re-defines blocks using previously stored definitions and generators.
// These definitions and overwritten by Simple2 but needed for advanced mode.
// This makes it possible for us to switch block modes without a page reload.
// See also: installFunctionBlocks
function restoreBlockDefinitions(javascriptGenerator: JavascriptGenerator) {
  const blockDefinitions: BlockDefinitions = {};
  Object.keys(BlockCache.blockDefinitions).forEach(type => {
    blockDefinitions[type as keyof BlockDefinitions] =
      BlockCache.blockDefinitions[type as keyof BlockDefinitions];
  });
  Blockly.common.defineBlocks(blockDefinitions);

  Object.keys(BlockCache.blockGenerators).forEach(type => {
    const generator = BlockCache.blockGenerators[type as keyof BlockGenerators];
    if (generator) {
      javascriptGenerator.forBlock[type as string] = generator;
    }
  });
}

// A helper function to generate the code for a function call to play sounds sequentially.
function simple2FunctionCallGenerator(
  functionName: string,
  functionCallBlockId: string,
) {
  return `
    if (__functionCallsCount++ < ${MAX_FUNCTION_CALLS_COUNT}) {
      Sequencer.startFunctionContext('${functionName}', '${functionCallBlockId}');
      Sequencer.playSequential();
      ${functionName}();
      Sequencer.endSequential();
      Sequencer.endFunctionContext();
    }
  `;
}

// For a given block id, return a list of block types. These block types
// represent any C-shaped block between itself and the root (top) block
// which contains it. The returned list could include types for loop blocks,
// function definitions, conditionals, or other control structures.
// These blocks all have a "statement" input that contains other blocks.
export function findParentStatementInputTypes(id: string): string[] {
  if (id === 'preview') {
    return [];
  }

  // Ensure Blockly is defined for the sake of unit tests.
  const block = Blockly.getMainWorkspace()?.getBlockById(id);

  const parentTypes: string[] = [];
  function addParentBlockTypes(currentBlock?: Blockly.Block) {
    if (currentBlock) {
      const parentBlock = currentBlock.getParent();
      if (parentBlock) {
        const parentInput =
          currentBlock.previousConnection?.targetConnection?.getParentInput();
        if (parentInput?.type === Blockly.inputs.inputTypes.STATEMENT) {
          parentTypes.push(parentBlock.type);
        }
        addParentBlockTypes(parentBlock);
      }
    }
  }

  addParentBlockTypes(block || undefined);

  return parentTypes;
}

/**
 * Adds a warning to blocks that are not positioned under a static category block,
 * except when there are no categories at all. If warnings are ignored, we will
 * still save the blocks into a "DEFAULT" category.
 */
export function validateBlockCategories(workspace: Blockly.Workspace) {
  const topBlocks = workspace.getTopBlocks(true);

  const noCategoryBlocks =
    !workspace.getBlocksByType(BlockTypes.CATEGORY).length &&
    !workspace.getBlocksByType(BlockTypes.CUSTOM_CATEGORY).length;

  let currentCategoryBlock: Blockly.Block | null = null;
  let warningText = 'This block is not positioned under a category.';

  topBlocks.forEach(block => {
    // If there are no categories, remove all warnings.
    if (noCategoryBlocks) {
      block.setWarningText(null);
      return;
    }
    if (block.type === BlockTypes.CATEGORY) {
      // Update the current category to this block
      currentCategoryBlock = block;
    } else if (block.type === BlockTypes.CUSTOM_CATEGORY) {
      // Reset the current category since dynamic categories can't include static blocks
      currentCategoryBlock = null;
      warningText = 'Auto-populated categories cannot include static blocks.';
    } else {
      // All non-category blocks
      if (!currentCategoryBlock) {
        // No static category block above this block
        block.setWarningText(warningText);
      } else {
        // Valid placement under a static category block
        block.setWarningText(null);
      }
    }
  });
}

export function applyBlockIdOverrides(
  workspaceJson: BlocklySerialization,
  overrides: Record<string, string>,
) {
  function walkBlocks(block: Blockly.serialization.blocks.State) {
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
 * Recursively collects block IDs starting from the given block, following
 * both child connections and function calls/definitions. The result preserves traversal
 * order and avoids revisiting blocks (e.g., in case of shared or recursive procedures).
 *
 * @param block - The starting block to traverse from.
 * @param visited - Internal set to track visited block IDs and avoid cycles.
 * @param ordered - Internal array accumulating block IDs in traversal order.
 * @returns An array of block IDs representing execution order from the starting block.
 */
export function collectBlockIdsRecursively(
  block: Blockly.Block,
  visited: Set<string> = new Set(),
  ordered: string[] = [],
) {
  if (!block || visited.has(block.id)) {
    return ordered;
  }

  visited.add(block.id);
  ordered.push(block.id);

  // Handle procedure calls by traversing blocks inside its definition
  if (block.type === BlockTypes.FUNCTION_CALL) {
    const procedureBlock = block as ProcedureBlock;
    const procModel = procedureBlock.getProcedureModel?.();
    if (procModel) {
      const defBlock = Blockly.Procedures.getDefinition(
        procModel.getName(),
        procedureBlock.workspace,
      );
      if (defBlock) {
        collectBlockIdsRecursively(defBlock, visited, ordered);
      }
    }
  }

  // Recurse through child blocks
  for (const child of block.getChildren(false)) {
    collectBlockIdsRecursively(child, visited, ordered);
  }

  return ordered;
}
