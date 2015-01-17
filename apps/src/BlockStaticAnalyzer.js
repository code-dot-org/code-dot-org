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
 * @class BlockStaticAnalyzer
 *
 * Answers questions about a user's solution within a particular blockSpace
 *
 * @param {Blockly} blockly The blockly instance being examined
 */
var BlockStaticAnalyzer = function ( blockly ) {
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
module.exports = BlockStaticAnalyzer;

/**
* Get blocks that the user intends in the program. These are the blocks that
* are used when checking for required blocks and when determining lines of code
* written.
* @return {Array<Object>} The blocks.
*/
BlockStaticAnalyzer.prototype.getUserBlocks = function() {
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
BlockStaticAnalyzer.prototype.getCountableBlocks = function() {
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
BlockStaticAnalyzer.prototype.getEmptyContainerBlock_ = function() {
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
BlockStaticAnalyzer.prototype.hasExtraTopBlocks = function () {
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
BlockStaticAnalyzer.prototype.hasQuestionMarksInNumberField_ = function () {
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
BlockStaticAnalyzer.prototype.hasUnusedParam_ = function () {
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !BlockStaticAnalyzer.hasMatchingDescendant_(userBlock, function(block) {
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
BlockStaticAnalyzer.prototype.hasParamInputUnattached_ = function () {
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
BlockStaticAnalyzer.prototype.hasUnusedFunction_ = function () {
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
BlockStaticAnalyzer.prototype.hasIncompleteBlockInFunction_ = function () {
  var self = this;
  return this.blockly_.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return BlockStaticAnalyzer.hasMatchingDescendant_(userBlock, function(block) {
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
BlockStaticAnalyzer.hasMatchingDescendant_ = function (node, filter) {
  if (filter(node)) {
    return true;
  }
  return node.childBlocks_.some(function (child) {
    return BlockStaticAnalyzer.hasMatchingDescendant_(child, filter);
  });
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * @param {number} maxBlocksToFlag The maximum number of blocks to return.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 *   array of array of strings where each array of strings is a set of blocks
 *   that at least one of them should be used. Each block is represented as the
 *   prefix of an id in the corresponding template.soy. 'message' is an
 *   optional message to override the default error text.
 */
BlockStaticAnalyzer.prototype.getMissingRequiredBlocks = function (maxBlocksToFlag) {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  if (this.requiredBlocks_.length) {
    var userBlocks = this.getUserBlocks();
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than the maxBlocksToFlag param.
    var missingBlockNum = 0;
    for (var i = 0; i < this.requiredBlocks_.length &&
        missingBlockNum < maxBlocksToFlag; i++) {
      var requiredBlock = this.requiredBlocks_[i];
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
        missingBlocks = missingBlocks.concat(this.requiredBlocks_[i][0]);
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
 * @return {boolean} true if all blocks are present, false otherwise.
 */
BlockStaticAnalyzer.prototype.hasAllRequiredBlocks_ = function() {
  // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
  // we want to check that there are zero blocks missing.
  var maxBlocksToFlag = 1;
  var missingBlocksInfo = this.getMissingRequiredBlocks(maxBlocksToFlag);
  return missingBlocksInfo.blocksToDisplay.length === 0;
};

/**
 * Enables empty block failures during static analysis check.
 */
BlockStaticAnalyzer.prototype.setShouldCheckForEmptyBlocks = function (isCheckEnabled) {
  this.isCheckForEmptyBlocksEnabled_ = isCheckEnabled;
};

/**
 * Disables extra top-level block failures during static analysis check.
 */
BlockStaticAnalyzer.prototype.setAllowExtraTopBlocks = function (areExtrasAllowed) {
  this.areExtraTopBlocksAllowed_ = areExtrasAllowed;
};

/**
 * @param {number} idealBlockCount - The number of 'countable' blocks used in
 *   an ideal solution to the current level.
 */
BlockStaticAnalyzer.prototype.setIdealBlockCount = function (idealBlockCount) {
  this.idealBlockCount_ = idealBlockCount;
};

/**
 * @param {!Array} requiredBlocks The blocks that are required to be used in
 *   the solution to this level.
 */
BlockStaticAnalyzer.prototype.setRequiredBlocks = function (requiredBlocks) {
  if (requiredBlocks && Array === requiredBlocks.constructor) {
    this.requiredBlocks_ = requiredBlocks;
  } else {
    throw new Error("setRequiredBlocks only accepts Array arguments.");
  }
};

/**
 * @param {boolean} isLevelComplete - Whether the level's basic success/fail
 *   condition has been met, regardless of the exact solution.
 * @return {number} The appropriate TestResults error code, or ALL_PASS if
 *   no static analysis errors are found.
 */
BlockStaticAnalyzer.prototype.runStaticAnalysis = function (isLevelComplete) {
  // TODO (bbuchanan) : There should be tests around every one of these
  //   failure types!
  if (this.isCheckForEmptyBlocksEnabled_) {
    var emptyBlock = this.getEmptyContainerBlock_();
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

  if (!this.areExtraTopBlocksAllowed_ && this.hasExtraTopBlocks()) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }

  if (this.blockly_.useContractEditor || this.blockly_.useModalFunctionEditor) {
    if (this.hasUnusedParam_()) {
      return TestResults.UNUSED_PARAM;
    } else if (this.hasUnusedFunction_()) {
      return TestResults.UNUSED_FUNCTION;
    } else if (this.hasParamInputUnattached_()) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    } else if (this.hasIncompleteBlockInFunction_()) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }

  if (this.hasQuestionMarksInNumberField_()) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }

  if (!this.hasAllRequiredBlocks_()) {
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
