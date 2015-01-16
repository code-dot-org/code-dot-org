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

/**
 * @class BlockLinter
 *
 * Answers questions about a user's solution within a particular blockSpace
 *
 * @param {Blockly} blockly The blockly instance being examined
 */
var BlockLinter = function ( blockly ) {
  this.blockly_ = blockly;
};
module.exports = BlockLinter;

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
