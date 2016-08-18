/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.CodeGenerator');
goog.provide('Blockly.Generator');

goog.require('Blockly.Block');


/**
 * Name space for the generator singleton.
 */
Blockly.Generator = {};

/**
 * Category to separate generated function names from variables and procedures.
 */
Blockly.Generator.NAME_TYPE = 'generated_function';

/**
 * Database of code generators, one for each language.
 */
Blockly.Generator.languages = {};

/**
 * Return the code generator for the specified language.  Create one if needed.
 * @param {string} name The language's name.
 * @return {!Blockly.CodeGenerator} Generator for this language.
 */
Blockly.Generator.get = function(name) {
  if (!(name in Blockly.Generator.languages)) {
    var generator = new Blockly.CodeGenerator(name);
    Blockly.Generator.languages[name] = generator;
  }
  return Blockly.Generator.languages[name];
};

/**
 * Generate code for all blocks in the blockSpace to the specified language.
 * @param {string} name Language name (e.g. 'JavaScript').
 * @param {array} blocks Return code under blocks in this array.
 * @param {boolean} opt_showHidden Whether or not to show non-user visible
 *   blocks, defaults to true. Nested blocks always inherit visibility.
 * @return {string} Generated code.
 */
Blockly.Generator.blocksToCode = function(name, blocks, opt_showHidden) {
  var code = [];
  var generator = Blockly.Generator.get(name);
  generator.init(blocks);
  for (var x = 0, block; block = blocks[x]; x++) {
    var line = generator.blockToCode(block, opt_showHidden);
    if (line instanceof Array) {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0];
    }
    if (line) {
      if (block.outputConnection && generator.scrubNakedValue) {
        // This block is a naked value.  Ask the language's code generator if
        // it wants to append a semicolon, or something.
        line = generator.scrubNakedValue(line);
      }

      if (block.isUnused()) {
        line = "/*\n" + line + "*/\n";
      }
      code.push(line);
    }
  }
  code = code.join('\n');  // Blank line between each section.
  code = generator.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

/**
 * Generate code for all blocks defined by the given xml. Creates a
 * temporary readOnly BlockSpace to load the blocks into.
 * @param {string} name Language name (e.g. 'JavaScript').
 * @param {!Element} xml XML block
 *   blocks, defaults to true. Nested blocks always inherit visibility.
 * @return {string} Generated code.
 */
Blockly.Generator.xmlToCode = function(name, xml) {
  var div = document.createElement('div');
  var blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(div, xml);
  var blocks = blockSpace.getTopBlocks(true);
  return Blockly.Generator.blocksToCode(name, blocks);
}

/**
 * Generate code for all blocks in the blockSpace to the specified language.
 * @param {string} name Language name (e.g. 'JavaScript').
 * @param {?string|Array.<string>} opt_typeFilter Only return code under top
 *   blocks of this type (or list of types).
 * @param {boolean} opt_showHidden Whether or not to show non-user visible
 *   blocks, defaults to true. Nested blocks always inherit visibility.
 * @return {string} Generated code.
 */
Blockly.Generator.blockSpaceToCode = function(name, opt_typeFilter, opt_showHidden) {
  var blocksToGenerate;
  if (opt_typeFilter) {
    if (typeof opt_typeFilter == 'string') {
      opt_typeFilter = [opt_typeFilter];
    }
    blocksToGenerate =
      goog.array.filter(Blockly.mainBlockSpace.getTopBlocks(true), function(block) {
        return goog.array.contains(opt_typeFilter, block.type);
      }, this);
  } else {
    // Generate all top blocks.
    blocksToGenerate = Blockly.mainBlockSpace.getTopBlocks(true);
  }
  return Blockly.Generator.blocksToCode(name, blocksToGenerate, opt_showHidden);
};

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Generator.prefixLines = function(text, prefix) {
  return prefix + text.replace(/\n(.)/g, '\n' + prefix + '$1');
};

/**
 * Recursively spider a tree of blocks, returning all their comments.
 * @param {!Blockly.Block} block The block from which to start spidering.
 * @return {string} Concatenated list of comments.
 */
Blockly.Generator.allNestedComments = function(block) {
  var comments = [];
  var blocks = block.getDescendants();
  for (var x = 0; x < blocks.length; x++) {
    var comment = blocks[x].getCommentText();
    if (comment) {
      comments.push(comment);
    }
  }
  // Append an empty string to create a trailing line break when joined.
  if (comments.length) {
    comments.push('');
  }
  return comments.join('\n');
};

/**
 * Class for a code generator that translates the blocks into a language.
 * @param {string} name Language name of this generator.
 * @constructor
 */
Blockly.CodeGenerator = function(name) {
  this.name_ = name;
  this.RESERVED_WORDS_ = '';
};

/**
 * Generate code for the specified block (and attached blocks).
 * @param {Blockly.Block} block The block to generate code for.
 * @param {boolean} opt_showHidden Whether or not to show non-user visible
 *     blocks, defaults to true. Nested blocks always inherit visibility.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.CodeGenerator.prototype.blockToCode = function(block, opt_showHidden) {
  if (!block) {
    return '';
  }
  var showHidden = opt_showHidden == undefined ? true : opt_showHidden;
  if (block.disabled || (!showHidden && !block.isUserVisible())) {
    // Skip past this block if it is disabled or hidden.
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    return this.blockToCode(nextBlock, opt_showHidden);
  }

  var func = this[block.type];
  if (!func) {
    throw 'Language "' + this.name_ + '" does not know how to generate code ' +
        'for block type "' + block.type + '".';
  }
  var code = func.call(block);

  if (code instanceof Array) {
    // Value blocks return tuples of code and operator order.
    return [this.scrub_(block, code[0], opt_showHidden), code[1]];
  } else {
    return this.scrub_(block, code, opt_showHidden);
  }
};

/**
 * Generate code representing the specified value input.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} order The maximum binding strength (minimum order value)
 *     of any operators adjacent to "block".
 * @return {string} Generated code or '' if no blocks are connected or the
 *     specified input does not exist.
 */
Blockly.CodeGenerator.prototype.valueToCode = function(block, name, order) {
  if (isNaN(order)) {
    throw 'Expecting valid order from block "' + block.type + '".';
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var tuple = this.blockToCode(targetBlock);
  if (tuple === '') {
    // Disabled block.
    return '';
  }
  if (!(tuple instanceof Array)) {
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    throw 'Expecting tuple from value block "' + targetBlock.type + '".';
  }
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (isNaN(innerOrder)) {
    throw 'Expecting valid order from value block "' + targetBlock.type + '".';
  }
  if (code && order <= innerOrder) {
    // The operators outside this code are stonger than the operators
    // inside this code.  To prevent the code from being pulled apart,
    // wrap the code in parentheses.
    // Technically, this should be handled on a language-by-language basis.
    // However all known (sane) languages use parentheses for grouping.
    code = '(' + code + ')';
  }
  return code;
};

/**
 * Generate code representing the statement.  Indent the code.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @return {string} Generated code or '' if no blocks are connected.
 */
Blockly.CodeGenerator.prototype.statementToCode = function(block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = this.blockToCode(targetBlock);
  if (!goog.isString(code)) {
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    throw 'Expecting code from statement block "' + targetBlock.type + '".';
  }
  if (code) {
    code = Blockly.Generator.prefixLines(/** @type {string} */ (code), '  ');
  }
  return code;
};

/**
 * Add one or more words to the list of reserved words for this language.
 * @param {string} words Comma-separated list of words to add to the list.
 *     No spaces.  Duplicates are ok.
 */
Blockly.CodeGenerator.prototype.addReservedWords = function(words) {
  this.RESERVED_WORDS_ += words + ',';
};
