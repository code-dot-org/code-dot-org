/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Class for caching image dimensions which have been dynamically determined
 */
'use strict';

goog.provide('Blockly.FunctionalBlockUtils');
goog.provide('Blockly.FunctionalTypeColors');
goog.require('Blockly.BlockValueType');

var typesToColors = {};
typesToColors[Blockly.BlockValueType.NONE] = [0, 0, 0.6];
typesToColors[Blockly.BlockValueType.NUMBER] = [192, 1.00, 0.99]; // 00ccff
typesToColors[Blockly.BlockValueType.STRING] = [180, 1.00, 0.60]; // 0099999
typesToColors[Blockly.BlockValueType.IMAGE] = [285, 1.00, 0.80]; // 9900cc
typesToColors[Blockly.BlockValueType.BOOLEAN] = [90, 1.00, 0.4]; // 336600

/**
 * Map of colors associated with given types
 * @type {Object.<Blockly.BlockValueType, Array>}
 */
Blockly.FunctionalTypeColors = typesToColors;

/**
 * Helper function to create the init section for a functional block.
 * @param {Blockly.Block} block The block to initialize.
 * @param {string} title Localized block title to display.
 * @param {string} type Block type which appears in xml.
 * @param {Array} args Arguments to this block.
 * @param {number=} wrapWidth Optional number of arguments after which
 *     to wrap the next argument onto a new line when rendering the
 *     block.
 */
Blockly.FunctionalBlockUtils.initTitledFunctionalBlock = function (block, title, type, args, wrapWidth) {
  block.setFunctional(true, {
    headerHeight: 30
  });
  block.setHSV.apply(block, Blockly.FunctionalTypeColors[type]);

  var options = {
    fixedSize: { height: 35 }
  };

  block.appendDummyInput()
    .appendTitle(new Blockly.FieldLabel(title, options))
    .setAlign(Blockly.ALIGN_CENTRE);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var input = block.appendFunctionalInput(arg.name);
    var wrapNextArg = wrapWidth && (i % wrapWidth) === 0;
    input.setInline(i > 0 && !wrapNextArg);
    if (arg.type === Blockly.BlockValueType.NONE) {
      input.setHSV(0, 0, 0.99);
    } else {
      input.setHSV.apply(input, Blockly.FunctionalTypeColors[arg.type]);
      input.setCheck(arg.type);
    }
    input.setAlign(Blockly.ALIGN_CENTRE);
  }

  if (type === Blockly.BlockValueType.NONE) {
    block.setFunctionalOutput(false);
  } else {
    block.setFunctionalOutput(true, type);
  }
};

/**
 * Installs a block which generates code that makes an API call, which
 * looks roughly like:
 *
 *     apiName(block_id, arg1 [,arg2 ...])
 *
 * where args with "constantValue" defined are pre-specified arguments,
 * and other args are read from functional inputs. For example:
 *
 *     options = {
 *       blockName: 'functional_setSpriteZeroSpeed',
 *       blockTitle: 'set sprite zero speed',
 *       apiName: 'Studio.setSpriteSpeed',
 *       args: [{constantValue: '0'}, // spriteIndex
 *              {name: 'SPEED', type: 'Number', default:'7'}]
 *     }
 *
 * creates a block which, with an id of '43' and an input of '12', would
 * generate the following code:
 *
 *     'Studio.setSpriteSpeed(block_id_43, 0, 12)'
 *
 * if no apiName is specified, a "dummy" block is generated which
 * accepts arguments but generates no code.
 */
Blockly.FunctionalBlockUtils.installFunctionalApiCallBlock = function(blockly, generator, options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;

  var blockArgs = args.filter(function(arg) {
    return arg.constantValue === undefined;
  });
  var blockType = 'none';
  blockly.Blocks[blockName] = {
    init: function () {
      Blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockTitle, blockType, blockArgs);
    }
  };

  // The generator function depends on "this" being the block object.
  generator[blockName] = function() {
    if (!apiName) {
      return '';
    }
    var apiArgs = [];
    apiArgs.push('\'block_id_' + this.id + '\'');
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var value = arg.constantValue !== undefined ?
        arg.constantValue :
      Blockly.JavaScript.statementToCode(this, arg.name, false) || arg['default'];
      apiArgs.push(value);
    }
    return apiName + '(' + apiArgs.join(',') + ');\n';
  };
};

Blockly.FunctionalBlockUtils.installStringPicker = function(blockly, generator, options) {
  var values = options.values;
  var blockName = options.blockName;
  blockly.Blocks[blockName] = {
    init: function () {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, Blockly.FunctionalTypeColors[Blockly.BlockValueType.STRING]);
      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('"'))
        .appendTitle(new blockly.FieldDropdown(values), 'VAL')
        .appendTitle(new Blockly.FieldLabel('"'))
        .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, blockly.BlockValueType.STRING);
    }
  };

  generator[blockName] = function() {
    return blockly.JavaScript.quote_(this.getTitleValue('VAL'));
  };
};
