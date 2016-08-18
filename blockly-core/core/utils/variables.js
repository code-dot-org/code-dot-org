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
 * @fileoverview Utility functions for handling variables and procedure names.
 * Note that variables and procedures share the same name space, meaning that
 * one can't have a variable and a procedure of the same name.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Variables');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Toolbox');
goog.require('Blockly.BlockSpace');


/**
 * Category to separate variable names from procedures and generated functions.
 */
Blockly.Variables.NAME_TYPE = 'VARIABLE';
Blockly.Variables.NAME_TYPE_LOCAL = 'LOCALVARIABLE';

/**
 * Find all user-created variables.
 * Currently searches the main blockspace only
 * @param {Array.<Blockly.Block>=} opt_blocks Optional root blocks.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allVariables = function(opt_blocks) {
  var blocks;
  if (opt_blocks) {
    opt_blocks = Array.isArray(opt_blocks) ? opt_blocks : [opt_blocks];
    blocks = opt_blocks.reduce(function(blocks, block) {
      return blocks.concat(block.getDescendants());
    }, []);
  } else if (Blockly.mainBlockSpace) {
    blocks = Blockly.mainBlockSpace.getAllBlocks();
  } else {
    return [];
  }
  var variableHash = {};
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getVars;
    if (func) {
      var blockVariables = func.call(blocks[x]);
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          variableHash[Blockly.Names.PREFIX_ +
              varName.toLowerCase()] = varName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var name in variableHash) {
    variableList.push(variableHash[name]);
  }
  return variableList;
};

/**
 * Find all instances of the specified variable in the current workspace and
 * rename them. Does not affect variables in other workspaces.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 * @param {Blockly.BlockSpace} blockSpace BlockSpace to rename child blocks of
 */
Blockly.Variables.renameVariable = function(oldName, newName, blockSpace) {
  if (newName === oldName) {
    return;
  }
  var blocks = blockSpace.getAllBlocks({shareMainModal: false});
  // Iterate through every block.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].renameVar;
    if (func) {
      func.call(blocks[x], oldName, newName);
    }
  }

  if (Blockly.functionEditor && Blockly.functionEditor.isOpen()) {
    Blockly.functionEditor.renameParameter(oldName, newName);
    Blockly.functionEditor.refreshParamsEverywhere();
  }
};

/**
 * Find all instances of the specified variable in the current workspace and
 * delete them. Does not affect variables in other workspaces.
 * @param {string} oldName Variable to rename.
 * @param {Blockly.BlockSpace} blockSpace blockspace context for variable
 */
Blockly.Variables.deleteVariable = function(nameToRemove, blockSpace) {
  var blocks = blockSpace.getAllBlocks({shareMainModal: false});
  // Iterate through every block.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].removeVar;
    if (func) {
      func.call(blocks[x], nameToRemove);
    }
  }
  // Notify the modal workspace to remove the parameter from its flyout
  if (Blockly.functionEditor && Blockly.functionEditor.isOpen()) {
    Blockly.functionEditor.removeParameter(nameToRemove);
    Blockly.functionEditor.refreshParamsEverywhere();
  }
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.BlockSpace} blockSpace The flyout's blockSpace.
 */
Blockly.Variables.flyoutCategory = function(blocks, gaps, margin, blockSpace) {
  var variableList = Blockly.Variables.allVariables();
  variableList.sort(goog.string.caseInsensitiveCompare);
  // In addition to the user's variables, we also want to display the default
  // variable name at the top.  We also don't want this duplicated if the
  // user has created a variable of the same name.
  variableList.unshift(null);
  var defaultVariable = undefined;
  for (var i = 0; i < variableList.length; i++) {
    if (variableList[i] === defaultVariable) {
      continue;
    }
    var getBlock = Blockly.Blocks.variables_get ?
        new Blockly.Block(blockSpace, 'variables_get') : null;
    getBlock && getBlock.initSvg();
    var setBlock = Blockly.Blocks.variables_set ?
        new Blockly.Block(blockSpace, 'variables_set') : null;
    setBlock && setBlock.initSvg();
    if (variableList[i] === null) {
      defaultVariable = (getBlock || setBlock).getVars()[0];
    } else {
      getBlock && getBlock.setTitleValue(variableList[i], 'VAR');
      setBlock && setBlock.setTitleValue(variableList[i], 'VAR');
    }
    setBlock && blocks.push(setBlock);
    getBlock && blocks.push(getBlock);
    if (getBlock && setBlock) {
      gaps.push(margin, margin * 3);
    } else {
      gaps.push(margin * 2);
    }
  }
};

/**
* Return a new variable name that is not yet being used. This will try to
* generate single letter variable names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
* @return {string} New variable name.
*/
Blockly.Variables.generateUniqueName = function(baseName) {
  if (baseName) {
    return Blockly.Variables.generateUniqueNameFromBase_(baseName);
  }

  var variableList = Blockly.Variables.allVariables();
  var newName = '';
  if (variableList.length) {
    variableList.sort(goog.string.caseInsensitiveCompare);
    var nameSuffix = 0, potName = 'i', i = 0, inUse = false;
    while (!newName) {
      i = 0;
      inUse = false;
      while (i < variableList.length && !inUse) {
        if (variableList[i].toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
        }
        i++;
      }
      if (inUse) {
        // Try the next potential name.
        if (potName[0] === 'z') {
          // Reached the end of the character sequence so back to 'a' but with
          // a new suffix.
          nameSuffix++;
          potName = 'a';
        } else {
          potName = String.fromCharCode(potName.charCodeAt(0) + 1);
          if (potName[0] == 'l') {
            // Avoid using variable 'l' because of ambiguity with '1'.
            potName = String.fromCharCode(potName.charCodeAt(0) + 1);
          }
        }
        if (nameSuffix > 0) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Given a base name, attempts to find an unused variable using that baseName
 * followed by an integer. For example, if given "counter1", it will look at
 * counter1, then counter2, then counter3, etc.
 * @param {string} baseName
 */
Blockly.Variables.generateUniqueNameFromBase_ = function(baseName) {
  var variableList = Blockly.Variables.allVariables();
  if (variableList.indexOf(baseName) === -1) {
    return baseName;
  }

  var num = 1;
  var match = /^([^\d]*)(\d+)$/.exec(baseName);
  if (match) {
    baseName = match[1];
    num = parseInt(match[2], 10) + 1;
  }

  // There are more efficient ways this could be done if we have large numbers
  // of variables, but since we expect on the order of 10s in the worst case,
  // I optimized for code simplicity
  do {
    var newName = baseName + num.toString();
    if (variableList.indexOf(newName) === -1) {
      return newName;
    }
  } while(num++);
};
