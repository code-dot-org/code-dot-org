/**
 * Blockly Demo: Calc Graphics
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
 * @fileoverview Demonstration of Blockly: Calc Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('../../locale/current/calc');
var commonMsg = require('../../locale/current/common');

var mathBlocks = require('../mathBlocks');

var functionalBlockUtils = require('../functionalBlockUtils');
var initTitledFunctionalBlock = functionalBlockUtils.initTitledFunctionalBlock;

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  mathBlocks.install(blockly, generator, gensym);

  // change generation code for Calc version of math blocks
  modifyCalcGenerationCode(generator, 'functional_plus', '+');
  modifyCalcGenerationCode(generator, 'functional_minus', '-');
  modifyCalcGenerationCode(generator, 'functional_times', '*');
  modifyCalcGenerationCode(generator, 'functional_dividedby', '/');

  installCompute(blockly, generator, gensym);

};

function modifyCalcGenerationCode(generator, blockType, operator) {
  generator[blockType] = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return "Calc.expression('" + operator + "', " + arg1 + ", " + arg2 + ")";
  };
}

function initFunctionalBlock(block, title, numArgs) {
  block.setHSV(184, 1.00, 0.74);
  block.setFunctional(true, {
    headerHeight: 30,
  });

  var options = {
    fixedSize: { height: 35 },
    fontSize: 25 // in pixels
  };

  block.appendDummyInput()
      .appendTitle(new Blockly.FieldLabel(title, options))
      .setAlign(Blockly.ALIGN_CENTRE);
  for (var i = 1; i <= numArgs; i++) {
    block.appendFunctionalInput('ARG' + i)
         .setInline(i > 1)
         .setHSV(184, 1.00, 0.74)
         .setCheck('Number');
  }

  block.setFunctionalOutput(true, 'Number');
}

function installCompute(blockly, generator, gensym) {
  blockly.Blocks.functional_compute = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, msg.compute(), 'none', [
        { name: 'ARG1', type: 'Number' }
      ]);
    }
  };

  generator.functional_compute = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return "Calc.compute(" + arg1 +", 'block_id_" + this.id + "');\n";
  };
}
