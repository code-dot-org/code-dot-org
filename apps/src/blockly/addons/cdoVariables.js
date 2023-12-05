import {caseInsensitiveCompare} from '../utils';

export default function initializeVariables(blocklyWrapper) {
  // Functionality pulled from https://github.com/code-dot-org/blockly/blob/main/core/utils/variables.js
  // Omits the following functions from the original file: 1. renameVariable, 2. deleteVariable,
  // 3. flyoutCategory, 4. getGetter, 5. getSetter

  blocklyWrapper.Variables.NAME_TYPE = 'VARIABLE';
  blocklyWrapper.Variables.DEFAULT_CATEGORY = 'Default';
  blocklyWrapper.Variables.getters = {
    Default: 'variables_get',
  };
  blocklyWrapper.Variables.setters = {
    Default: 'variables_set',
  };

  blocklyWrapper.Variables.registerGetter = function (category, blockName) {
    Blockly.Variables.getters[category] = blockName;
  };

  blocklyWrapper.Variables.registerSetter = function (category, blockName) {
    Blockly.Variables.setters[category] = blockName;
  };

  /**
   * Find all the variables used in the provided block.
   * @param {Blockly.Block} block Block to check for variables
   * @returns {string[]} Array of all the variables used.
   */
  blocklyWrapper.Variables.allVariablesFromBlock = function (block) {
    if (!block.getVars) {
      return [];
    }
    var varsByCategory = block.getVars();
    return Object.keys(varsByCategory).reduce(function (vars, category) {
      return vars.concat(varsByCategory[category]);
    }, []);
  };

  /**
   * Standard implementation of getVars for blocks with a single 'VAR' title
   * @param {string=} opt_category Variable category, defaults to 'Default'
   */
  blocklyWrapper.Variables.getVars = function (opt_category) {
    var category = opt_category || Blockly.Variables.DEFAULT_CATEGORY;
    var vars = {};
    vars[category] = [this.getTitleValue('VAR')];
    return vars;
  };

  /**
   * Find all user-created variables.
   * Currently searches the main blockspace only
   * @param {Array.<Blockly.Block>=} opt_blocks Optional root blocks.
   * @param {string=} opt_category only return variables in this category, or all
   *   variables if not specified
   * @return {!Array.<string>} Array of variable names.
   */
  blocklyWrapper.Variables.allVariables = function (opt_blocks, opt_category) {
    if (
      opt_category &&
      opt_category !== Blockly.Variables.DEFAULT_CATEGORY &&
      Blockly.valueTypeTabShapeMap &&
      Blockly.valueTypeTabShapeMap[opt_category] === undefined
    ) {
      throw new Error('Variable category must be "Default" or a strict type');
    }
    var blocks;
    if (opt_blocks) {
      opt_blocks = Array.isArray(opt_blocks) ? opt_blocks : [opt_blocks];
      blocks = opt_blocks.reduce(function (blocks, block) {
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
      if (!blocks[x].getVars) {
        continue;
      }
      var blockVariables;
      if (opt_category) {
        blockVariables = blocks[x].getVars()[opt_category] || [];
      } else {
        blockVariables = Blockly.Variables.allVariablesFromBlock(blocks[x]);
      }
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          variableHash[Blockly.Names.PREFIX_ + varName.toLowerCase()] = varName;
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
   * Return a new variable name that is not yet being used. This will try to
   * generate single letter variable names in the range 'i' to 'z' to start with.
   * If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
   * @return {string} New variable name.
   */
  blocklyWrapper.Variables.generateUniqueName = function (baseName) {
    if (baseName) {
      return Blockly.Variables.generateUniqueNameFromBase_(baseName);
    }

    var variableList = Blockly.Variables.allVariables();
    var newName = '';
    if (variableList.length) {
      variableList.sort(caseInsensitiveCompare);
      var nameSuffix = 0,
        potName = 'i',
        i = 0,
        inUse = false;
      while (!newName) {
        i = 0;
        inUse = false;
        while (i < variableList.length && !inUse) {
          if (variableList[i].toLowerCase() === potName) {
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
            if (potName[0] === 'l') {
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
  blocklyWrapper.Variables.generateUniqueNameFromBase_ = function (baseName) {
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
    } while (num++);
  };
}
