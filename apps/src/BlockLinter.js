/* jshint
strict: true,
curly: true,
funcscope: true,
newcap: true,
nonew: true,
shadow: false,
unused: true,

maxlen: 80,
maxparams: 3,
maxstatements: 200
*/
/* global -Blockly */
'use strict';

var constants = require('./constants');
var TestResults = constants.TestResults;

/**
 * @class BlockLinter
 *
 * Answers questions about a user's solution within a particular blockSpace
 *
 * @param {Blockly} blockly The blockly instance being examined
 */
var BlockLinter = function ( blockly ) {
  this.blockly_ = blockly;

  /**
   * @member {boolean} Whether the analyzer will check for empty container
   * blocks
   */
  this.isCheckForEmptyBlocksEnabled_ = true;

  /**
   * @member {boolean} Disables extra top-level block failures during static
   * analysis check.
   */
  this.areExtraTopBlocksAllowed_ = false;

  /**
   * @member {number} The number of 'countable' blocks used in
   *   an ideal solution to the current level.
   */
  this.idealBlockCount_ = 0;

  /**
   * @member {!Array} The blocks that are required to be used in
   *   the solution to this level.
   */
  this.requiredBlocks_ = [];
};
module.exports = BlockLinter;

/**
* Get blocks that the user intends in the program. These are the blocks that
* are used when checking for required blocks and when determining lines of code
* written.
* @return {Array<Object>} The blocks.
*/
BlockLinter.prototype.getUserBlocks = function() {
  var allBlocks = this.blockly_.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled && block.isEditable() && block.type !== 'when_run';
  });
  return blocks;
};

/**
* Get countable blocks in the program, namely any that are not disabled.
* These are used when determined the number of blocks relative to the ideal
* block count.
* @return {Array<Object>} The blocks.
*/
BlockLinter.prototype.getCountableBlocks = function() {
  var allBlocks = this.blockly_.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
* Get an empty container block, if any are present.
* @return {Blockly.Block} an empty container block, or null if none exist.
*/
BlockLinter.prototype.getEmptyContainerBlock = function() {
  var blocks = this.blockly_.mainBlockSpace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    for (var j = 0; j < block.inputList.length; j++) {
      var input = block.inputList[j];
      if (input.type == this.blockly_.NEXT_STATEMENT &&
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
 * @return {boolean}
 */
BlockLinter.prototype.hasExtraTopBlocks = function () {
  var topBlocks = this.blockly_.mainBlockSpace.getTopBlocks();
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
 * @return {boolean}
 */
BlockLinter.prototype.hasQuestionMarksInNumberField = function () {
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.text_ === '???';
    });
  });
};

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 * @return {boolean}
 */
BlockLinter.prototype.hasUnusedParam = function () {
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !BlockLinter.hasMatchingDescendant(userBlock, function(block) {
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
 * @return {boolean}
 */
BlockLinter.prototype.hasParamInputUnattached = function () {
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(userBlock) {
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
 * @return {boolean}
 */
BlockLinter.prototype.hasUnusedFunction = function () {
  var userDefs = [];
  var callBlocks = {};
  this.blockly_.mainBlockSpace.getAllBlocks().forEach(function (block) {
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
 * @return {boolean}
 */
BlockLinter.prototype.hasIncompleteBlockInFunction = function () {
  var self = this;
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return BlockLinter.hasMatchingDescendant(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return input.type === self.blockly_.INPUT_VALUE &&
        !input.connection.targetConnection;
      });
    });
  });
};

/**
 * Returns true if any descendant (inclusive) of the given blockly node matches
 * the given filter.
 * @param {??? - Blockly node} node
 * @param {??? - predicate} filter
 * @return {boolean}
 * @static
 */
BlockLinter.hasMatchingDescendant = function (node, filter) {
  if (filter(node)) {
    return true;
  }
  return node.childBlocks_.some(function (child) {
    return BlockLinter.hasMatchingDescendant(child, filter);
  });
};


/**
 * Check for empty container blocks, and return an appropriate failure
 * code if any are found.
 * @return {TestResults} ALL_PASS if no empty blocks are present, or
 *   EMPTY_BLOCK_FAIL or EMPTY_FUNCTION_BLOCK_FAIL if empty blocks
 *   are found.
 */
BlockLinter.prototype.checkForEmptyContainerBlockFailure = function() {
  var emptyBlock = this.getEmptyContainerBlock();
  if (!emptyBlock) {
    return TestResults.ALL_PASS;
  }

  var type = emptyBlock.type;
  if (type === 'procedures_defnoreturn' || type === 'procedures_defreturn') {
    return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
  }

  // Block is assumed to be "if" or "repeat" if we reach here.
  // This is where to add checks if you want a different TestResult
  // for "controls_for_counter" blocks, for example.
  return TestResults.EMPTY_BLOCK_FAIL;
};


/**
 * Check to see if the user's code contains the required blocks for a level.
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @param {number} maxBlocksToFlag The maximum number of blocks to return.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 *   array of array of strings where each array of strings is a set of blocks
 *   that at least one of them should be used. Each block is represented as the
 *   prefix of an id in the corresponding template.soy. 'message' is an
 *   optional message to override the default error text.
 */
BlockLinter.prototype.getMissingRequiredBlocks = function (requiredBlocks,
    maxBlocksToFlag) {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  if (requiredBlocks && requiredBlocks.length) {
    var userBlocks = this.getUserBlocks();
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
          code = code || this.blockly_.Generator.blockSpaceToCode('JavaScript');
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
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 * @return {boolean} true if all blocks are present, false otherwise.
 */
BlockLinter.prototype.hasAllRequiredBlocks = function(requiredBlocks) {
  // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
  // we want to check that there are zero blocks missing.
  var maxBlocksToFlag = 1;
  return this.getMissingRequiredBlocks(requiredBlocks,
      maxBlocksToFlag).blocksToDisplay.length === 0;
};

/**
 * Enables empty block failures during static analysis check.
 */
BlockLinter.prototype.setShouldCheckForEmptyBlocks = function (isCheckEnabled) {
  this.isCheckForEmptyBlocksEnabled_ = isCheckEnabled;
};

/**
 * Disables extra top-level block failures during static analysis check.
 */
BlockLinter.prototype.setAllowExtraTopBlocks = function (areExtrasAllowed) {
  this.areExtraTopBlocksAllowed_ = areExtrasAllowed;
};

/**
 * @param {number} idealBlockCount - The number of 'countable' blocks used in
 *   an ideal solution to the current level.
 */
BlockLinter.prototype.setIdealBlockCount = function (idealBlockCount) {
  this.idealBlockCount_ = idealBlockCount;
};

/**
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 */
BlockLinter.prototype.setRequiredBlocks = function (requiredBlocks) {
  this.requiredBlocks_ = requiredBlocks;
};

/**
 * @param {boolean} isLevelComplete - Whether the level's basic success/fail
 *   condition has been met, regardless of the exact solution.
 * @return {number} The appropriate TestResults error code, or ALL_PASS if
 *   no static analysis errors are found.
 */
BlockLinter.prototype.runStaticAnalysis = function (isLevelComplete) {
  // TODO (bbuchanan) : There should be UI tests around every one of these
  //   failure types!
  if (this.isCheckForEmptyBlocksEnabled_) {
    var emptyBlockFailure = this.checkForEmptyContainerBlockFailure();
    if (emptyBlockFailure !== TestResults.ALL_PASS) {
      return emptyBlockFailure;
    }
  }

  if (!this.areExtraTopBlocksAllowed_ && this.hasExtraTopBlocks()) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }

  if (this.blockly_.useContractEditor || this.blockly_.useModalFunctionEditor) {
    if (this.hasUnusedParam()) {
      return TestResults.UNUSED_PARAM;
    } else if (this.hasUnusedFunction()) {
      return TestResults.UNUSED_FUNCTION;
    } else if (this.hasParamInputUnattached()) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    } else if (this.hasIncompleteBlockInFunction()) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }

  if (this.hasQuestionMarksInNumberField()) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }

  if (!this.hasAllRequiredBlocks(this.requiredBlocks_)) {
    return isLevelComplete ?
        TestResults.MISSING_BLOCK_FINISHED :
        TestResults.MISSING_BLOCK_UNFINISHED;
  }

  var numEnabledBlocks = this.getCountableBlocks().length;
  if (!isLevelComplete) {
    if (this.idealBlockCount_ && this.idealBlockCount_ !== Infinity &&
        numEnabledBlocks < this.idealBlockCount_) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }

  if (this.idealBlockCount_ && numEnabledBlocks > this.idealBlockCount_) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  }

  // Found nothing wrong
  return TestResults.ALL_PASS;
};
