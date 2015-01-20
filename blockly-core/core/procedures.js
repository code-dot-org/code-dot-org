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
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Procedures');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Names');
goog.require('Blockly.BlockSpace');
goog.require('goog.events');


/** Flyout category to separate procedure names from variables and generated functions. */
Blockly.Procedures.NAME_TYPE = 'PROCEDURE';

/** Flyout category type for functional variables, which are procedures under the covers */
Blockly.Procedures.NAME_TYPE_FUNCTIONAL_VARIABLE = 'FUNCTIONAL_VARIABLE';

Blockly.Procedures.DEFINITION_BLOCK_TYPES = [
  'procedures_defnoreturn', 'procedures_defreturn', 'functional_definition'
];

Blockly.Procedures.PROCEDURAL_TO_FUNCTIONAL_CALL_TYPE = 'procedural_to_functional_call';

/**
 * Find all user-created procedure definitions.
 * @return {!Array.<!Object>} Array of procedure definitions.
 *     Each procedure is defined by a procedure info object.
 */
Blockly.Procedures.allProcedures = function() {
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  var proceduresFunctional = [];

  Blockly.mainBlockSpace.getAllBlocks().forEach(function(block) {
    if (!block.getProcedureInfo) {
      return;
    }

    var procedureInfo = block.getProcedureInfo();
    switch (block.type) {
      case 'functional_definition':
        proceduresFunctional.push(procedureInfo);
        if (Blockly.editBlocks === 'start_blocks') {
          // Make extra procedural calls available for functional definitions in edit mode
          var proceduralCallProcedureInfo = goog.object.clone(procedureInfo);
          proceduralCallProcedureInfo.callType = Blockly.Procedures.PROCEDURAL_TO_FUNCTIONAL_CALL_TYPE;
          proceduresFunctional.push(proceduralCallProcedureInfo);
        }
        break;
      case 'procedures_defreturn':
        proceduresReturn.push(procedureInfo);
        break;
      case 'procedures_defnoreturn':
        proceduresNoReturn.push(procedureInfo);
        break;
    }
  });

  proceduresNoReturn.sort(Blockly.Procedures.procedureInfoSort_);
  proceduresReturn.sort(Blockly.Procedures.procedureInfoSort_);
  proceduresFunctional.sort(Blockly.Procedures.procedureInfoSort_);
  return goog.array.concat(proceduresNoReturn, proceduresReturn, proceduresFunctional);
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First procedure info.
 * @param {!Array} tb Second procedure info.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Procedures.procedureInfoSort_ = function(ta, tb) {
  var a = ta.name.toLowerCase();
  var b = tb.name.toLowerCase();
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'procedure'.
    return name;
  }
  var newName = name;
  while (!Blockly.Procedures.isLegalName(newName, block.blockSpace, block)) {
    // Collision with another procedure.
    var matchResult = newName.match(/^(.*?)(\d+)$/);
    if (!matchResult) {
      newName += '2';
    } else {
      newName = matchResult[1] + (parseInt(matchResult[2], 10) + 1);
    }
  }
  return newName;
};

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to scan for collisions.
 * @param {Blockly.Block} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
Blockly.Procedures.isLegalName = function(name, blockSpace, opt_exclude) {
  var blockExistsWithName = blockSpace.getAllBlocks()
    .filter(function(block){ return block !== opt_exclude })
    .some(function(block) {
      return block.getProcedureInfo && Blockly.Names.equals(block.getProcedureInfo().name, name)
    });
  return !blockExistsWithName;
};

/**
 * Rename a procedure.  Called by the editable field.
 * NOTE: Requires `this` scope to be a blockly field
 * @param {string} text The proposed new name.
 * @return {string} The accepted name.
 * @this {!Blockly.FieldVariable}
 */
Blockly.Procedures.rename = function(text) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  text = text.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

  // Ensure two identically-named procedures don't exist.
  text = Blockly.Procedures.findLegalName(text, this.sourceBlock_);
  // Rename any callers.
  var blocks = this.sourceBlock_.blockSpace.getAllBlocks();
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].renameProcedure;
    if (func) {
      func.call(blocks[x], this.text_, text);
    }
  }
  return text;
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.BlockSpace} blockSpace The flyout's blockSpace.
 * @param {?Function.<Object>} opt_definitionCallFilter Optional filter with which to restrict
 *  the procedure definitions that get used to populate the call list. Takes one parameter
 *  of procedureInfo. Returning "true" means calls of this procedure definition
 *  will be included in the category.
 */
Blockly.Procedures.flyoutCategory = function(blocks, gaps, margin, blockSpace, opt_procedureInfoFilter) {
  if (!Blockly.functionEditor) {
    if (Blockly.Blocks.procedures_defnoreturn) {
      var block = new Blockly.Block(blockSpace, 'procedures_defnoreturn');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
    if (Blockly.Blocks.procedures_defreturn) {
      var block = new Blockly.Block(blockSpace, 'procedures_defreturn');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
    if (Blockly.Blocks.procedures_ifreturn) {
      var block = new Blockly.Block(blockSpace, 'procedures_ifreturn');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
    if (gaps.length) {
      // Add slightly larger gap between system blocks and user calls.
      gaps[gaps.length - 1] = margin * 3;
    }
  }

  // Add available procedure call blocks
  Blockly.Procedures.allProcedures().forEach(function(procedureDefinitionInfo) {
    if (opt_procedureInfoFilter && !opt_procedureInfoFilter(procedureDefinitionInfo)) {
      return;
    }
    var newCallBlock = Blockly.Procedures.createCallerBlock(blockSpace, procedureDefinitionInfo);
    blocks.push(newCallBlock);
    gaps.push(margin * 2);
  });
};

Blockly.Procedures.createCallerFromDefinition = function(blockSpace, definitionBlock) {
  return Blockly.Procedures.createCallerBlock(blockSpace, definitionBlock.getProcedureInfo());
};

Blockly.Procedures.createCallerBlock = function(blockSpace, procedureDefinitionInfo) {
  var newCallBlock = new Blockly.Block(blockSpace, procedureDefinitionInfo.callType);
  newCallBlock.setTitleValue(procedureDefinitionInfo.name, 'NAME');
  var tempIds = [];
  for (var t = 0; t < procedureDefinitionInfo.parameterNames.length; t++) {
    tempIds[t] = 'ARG' + t;
  }
  newCallBlock.setProcedureParameters(
    procedureDefinitionInfo.parameterNames,
    tempIds,
    procedureDefinitionInfo.parameterTypes);
  newCallBlock.initSvg();
  return newCallBlock;
};

/**
 * Find all the callers of a named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to find callers in.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 */
Blockly.Procedures.getCallers = function(name, blockSpace) {
  return blockSpace.getAllBlocks().filter(function(block) {
    return block.getCallName && Blockly.Names.equals(name, block.getCallName());
  });
};

/**
 * When a procedure definition is disposed of, find and dispose of all its
 *     callers.
 * @param {string} name Name of deleted procedure definition.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to delete callers from.
 */
Blockly.Procedures.disposeCallers = function(name, blockSpace) {
  Blockly.Procedures.getCallers(name, blockSpace).forEach(function(caller) {
    caller.dispose(true, false);
  });
};

/**
 * When a procedure definition changes its parameters, find and edit all its
 * callers.
 * @param {string} name Name of edited procedure definition.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to delete callers from.
 * @param {!Array.<string>} paramNames Array of new parameter names.
 * @param {!Array.<string>} paramIds Array of unique parameter IDs.
 * @param {?Array.<string>} opt_typeNames Array of types for parameters
 */
Blockly.Procedures.mutateCallers = function(name, blockSpace,
                                            paramNames, paramIds, opt_typeNames) {
  Blockly.Procedures.getCallers(name, blockSpace).forEach(function(caller) {
    caller.setProcedureParameters(paramNames, paramIds, opt_typeNames);
  }, this);
};

/**
 * Find the definition block for the named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to search.
 * @return {Blockly.Block} The procedure definition block, or null not found.
 */
Blockly.Procedures.getDefinition = function(name, blockSpace) {
  return goog.array.find(blockSpace.getAllBlocks(), function(block) {
    return block.getProcedureInfo && Blockly.Names.equals(block.getProcedureInfo().name, name);
  });
};
