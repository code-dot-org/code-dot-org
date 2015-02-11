/* jshint
strict: true,
curly: true,
funcscope: true,
newcap: true,
nonew: true,
shadow: false,
unused: true,

maxlen: 90,
maxparams: 3,
maxstatements: 200
*/
/* global -Blockly */
'use strict';

var constants = require('./constants');
var TestResults = constants.TestResults;

/**
 * blockAnalysis namespace
 * Tools that answer questions about the state of a blockly instance, most
 * frequently about a particular solution.
 */
var blockAnalysis = module.exports;

/**
 * Get blocks that the user intends in the program. These are the blocks that
 * are used when checking for required blocks and when determining lines of code
 * written.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {Array<Object>} The blocks.
 */
blockAnalysis.getUserBlocks = function(blockly) {
  var allBlocks = blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled && block.isEditable() && block.type !== 'when_run';
  });
  return blocks;
};

/**
 * Get countable blocks in the program, namely any that are not disabled.
 * These are used when determined the number of blocks relative to the ideal
 * block count.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {Array<Object>} The blocks.
 */
blockAnalysis.getCountableBlocks = function(blockly) {
  var allBlocks = blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
 * Get an empty container block, if any are present.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {Blockly.Block} an empty container block, or null if none exist.
 */
blockAnalysis.getEmptyContainerBlock_ = function(blockly) {
  var blocks = blockly.mainBlockSpace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    for (var j = 0; j < block.inputList.length; j++) {
      var input = block.inputList[j];
      if (input.type == blockly.NEXT_STATEMENT &&
          !input.connection.targetConnection) {
        return block;
      }
    }
  }
  return null;
};

/**
 * Do we have any floating blocks not attached to an event block or
 * function block?
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasExtraTopBlocks = function (blockly) {
  var topBlocks = blockly.mainBlockSpace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    // ignore disabled top blocks. we have a level turtle:2_7 that depends on
    // having disabled top level blocks
    if (topBlocks[i].disabled) {
      continue;
    }
    // Ignore top blocks which are functional definitions.
    if (topBlocks[i].type === 'functional_definition') {
      continue;
    }
    // None of our top level blocks should have a previous connection.
    if (topBlocks[i].previousConnection) {
      return true;
    }
  }
  return false;
};

/**
 * Check for '???' instead of a value in block fields.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasQuestionMarksInNumberField_ = function (blockly) {
  return blockly.mainBlockSpace.getAllBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.text_ === '???';
    });
  });
};

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasUnusedParam_ = function (blockly) {
  return blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !blockAnalysis.hasMatchingDescendant_(userBlock, function(block) {
        return (block.type === 'parameters_get' ||
        block.type === 'functional_parameters_get' ||
        block.type === 'variables_get') &&
        block.getTitleValue('VAR') === paramName;
      });
    });
  });
};

/**
 * Ensure that all procedure calls have each parameter input connected.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasParamInputUnattached_ = function (blockly) {
  return blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only check procedure_call* blocks
    if (!/^procedures_call/.test(userBlock.type)) {
      return false;
    }
    return userBlock.inputList.filter(function(input) {
      return (/^ARG/.test(input.name));
    }).some(function(argInput) {
      // Unattached param input if any ARG* connection target is null
      return !argInput.connection.targetConnection;
    });
  });
};

/**
 * Ensure that all user-declared procedures have associated call blocks.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasUnusedFunction_ = function (blockly) {
  var userDefs = [];
  var callBlocks = {};
  blockly.mainBlockSpace.getAllBlocks().forEach(function (block) {
    var name = block.getTitleValue('NAME');
    if (/^procedures_def/.test(block.type) && block.userCreated) {
      userDefs.push(name);
    } else if (/^procedures_call/.test(block.type)) {
      callBlocks[name] = true;
    }
  });
  // Unused function if some user def doesn't have a matching call
  return userDefs.some(function(name) { return !callBlocks[name]; });
};

/**
 * Ensure there are no incomplete blocks inside any function definitions.
 * @param {!Blockly} blockly - a Blockly instance
 * @return {boolean}
 */
blockAnalysis.hasIncompleteBlockInFunction_ = function (blockly) {
  return blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return blockAnalysis.hasMatchingDescendant_(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return input.type === blockly.INPUT_VALUE &&
        !input.connection.targetConnection;
      });
    });
  });
};

/**
 * @callback blockPredicate
 * @param {!Blockly.Block} block to check against condition
 * @return {boolean} whether the block fulfills the condition
 */
/**
 * Returns true if any descendant (inclusive) of the given blockly node matches
 * the given filter.
 * @param {!Blockly.Block} node
 * @param {blockPredicate} filter
 * @return {boolean}
 */
blockAnalysis.hasMatchingDescendant_ = function (node, filter) {
  if (filter(node)) {
    return true;
  }
  return node.childBlocks_.some(function (child) {
    return blockAnalysis.hasMatchingDescendant_(child, filter);
  });
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * @param {!Blockly.Block} node
 * @param {Array} requiredBlocks - The blocks that are required to
 *   be used in the solution to this level.
 * @param {number} maxBlocksToFlag The maximum number of blocks to return.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 *   array of array of strings where each array of strings is a set of blocks
 *   that at least one of them should be used. Each block is represented as the
 *   prefix of an id in the corresponding template.soy. 'message' is an
 *   optional message to override the default error text.
 */
blockAnalysis.getMissingRequiredBlocks = function (blockly,
    requiredBlocks, maxBlocksToFlag) {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  if (requiredBlocks.length) {
    var userBlocks = blockAnalysis.getUserBlocks(blockly);
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than the maxBlocksToFlag param.
    var missingBlockNum = 0;
    for (var i = 0; i < requiredBlocks.length &&
        missingBlockNum < maxBlocksToFlag; i++) {
      var requiredBlock = requiredBlocks[i];
      // For each of the test
      // If at least one of the tests succeeded, we consider the required block
      // is used
      var usedRequiredBlock = false;
      for (var testId = 0; testId < requiredBlock.length; testId++) {
        var test = requiredBlock[testId].test;
        if (typeof test === 'string') {
          code = code || blockly.Generator.blockSpaceToCode('JavaScript');
          if (code.indexOf(test) !== -1) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          }
        } else if (typeof test === 'function') {
          if (userBlocks.some(test)) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          } else {
            customMessage = requiredBlock[testId].message || customMessage;
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }
      if (!usedRequiredBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(requiredBlocks[i][0]);
      }
    }
  }
  return {
    blocksToDisplay: missingBlocks,
    message: customMessage
  };
};

/**
 * Check whether the user code has all the blocks required for the level.
 * @param {!Blockly.Block} node
 * @param {Array} requiredBlocks - The blocks that are required to
 *   be used in the solution to this level.
 * @return {boolean} true if all blocks are present, false otherwise.
 */
blockAnalysis.hasAllRequiredBlocks_ = function(blockly, requiredBlocks) {
  // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
  // we want to check that there are zero blocks missing.
  var maxBlocksToFlag = 1;
  var missingBlocksInfo = blockAnalysis.getMissingRequiredBlocks(
      blockly, requiredBlocks, maxBlocksToFlag);
  return missingBlocksInfo.blocksToDisplay.length === 0;
};

/**
 * @param {Object} options - Set the following parameters:
 *        shouldCheckForEmptyBlocks (boolean, default true) - Enables empty
 *          block failures during static analysis check.
 *        allowExtraTopBlocks (boolean, default false) - Disables extra
 *          top-level block failures during static analysis check.
 *        idealBlockCount (number, default 0) - The number of 'countable'
 *          blocks used in an ideal solution to the current level.
 *        requiredBlocks (Array, default []) - The blocks that are required to
 *          be used in the solution to this level.
 * @returns {Object} options object with defaults populated
 */
blockAnalysis.applyDefaultOptions_ = function (options) {
  if (options === undefined) {
    options = {};
  }

  /**
   * {boolean} Whether the analyzer will check for empty container blocks
   */
  options.shouldCheckForEmptyBlocks =
      (options.shouldCheckForEmptyBlocks !== undefined) ?
          options.shouldCheckForEmptyBlocks : true;

  /**
   * {boolean} Disables extra top-level block failures during static
   *   analysis check.
   */
  options.allowExtraTopBlocks =
      (options.allowExtraTopBlocks !== undefined) ?
          options.allowExtraTopBlocks : false;

  /**
   * {number} The number of 'countable' blocks used in
   *   an ideal solution to the current level.
   */
  options.idealBlockCount =
      (options.idealBlockCount !== undefined) ?
          options.idealBlockCount : 0;

  /**
   * {!Array} The blocks that are required to be used in
   *   the solution to this level.
   */
  options.requiredBlocks =
      (options.requiredBlocks !== undefined) ?
          options.requiredBlocks : [];

  return options;
};

/**
 * @param {Blockly} blockly The blockly instance being examined
 * @param {Object} options - Set the following parameters:
 *        shouldCheckForEmptyBlocks (boolean, default true) - Enables empty
 *          block failures during static analysis check.
 *        allowExtraTopBlocks (boolean, default false) - Disables extra
 *          top-level block failures during static analysis check.
 *        idealBlockCount (number, default 0) - The number of 'countable'
 *          blocks used in an ideal solution to the current level.
 *        requiredBlocks (Array, default []) - The blocks that are required to
 *          be used in the solution to this level.
 * @param {boolean} isLevelComplete - Whether the level's basic success/fail
 *   condition has been met, regardless of the exact solution.
 * @return {number} The appropriate TestResults error code, or ALL_PASS if
 *   no static analysis errors are found.
 */
blockAnalysis.runStaticAnalysis = function (blockly, options,
    isLevelComplete) {
  options = blockAnalysis.applyDefaultOptions_(options);

  // TODO (bbuchanan) : There should be tests around every one of these
  //   failure types!
  if (options.shouldCheckForEmptyBlocks) {
    var emptyBlock = blockAnalysis.getEmptyContainerBlock_(blockly);
    if (emptyBlock) {
      var type = emptyBlock.type;
      if (type === 'procedures_defnoreturn' ||
          type === 'procedures_defreturn') {
        return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
      }

      // Block is assumed to be "if" or "repeat" if we reach here.
      // This is where to add checks if you want a different TestResult
      // for "controls_for_counter" blocks, for example.
      return TestResults.EMPTY_BLOCK_FAIL;
    }
  }

  if (!options.allowExtraTopBlocks &&
      blockAnalysis.hasExtraTopBlocks(blockly)) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }

  if (blockly.useContractEditor || blockly.useModalFunctionEditor) {
    if (blockAnalysis.hasUnusedParam_(blockly)) {
      return TestResults.UNUSED_PARAM;
    } else if (blockAnalysis.hasUnusedFunction_(blockly)) {
      return TestResults.UNUSED_FUNCTION;
    } else if (blockAnalysis.hasParamInputUnattached_(blockly)) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    } else if (blockAnalysis.hasIncompleteBlockInFunction_(blockly)) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }

  if (blockAnalysis.hasQuestionMarksInNumberField_(blockly)) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }

  if (!blockAnalysis.hasAllRequiredBlocks_(blockly,
          options.requiredBlocks)) {
    return isLevelComplete ?
        TestResults.MISSING_BLOCK_FINISHED :
        TestResults.MISSING_BLOCK_UNFINISHED;
  }

  var numEnabledBlocks = blockAnalysis.getCountableBlocks(blockly).length;
  if (!isLevelComplete) {
    if (options.idealBlockCount && options.idealBlockCount !== Infinity &&
        numEnabledBlocks < options.idealBlockCount) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }

  if (options.idealBlockCount && numEnabledBlocks > options.idealBlockCount) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  }

  // Found nothing wrong
  return TestResults.ALL_PASS;
};
