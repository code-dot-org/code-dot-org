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
var msg = require('./locale');

var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installCompute(blockly, generator, gensym);
};

function installCompute(blockly, generator, gensym) {
  blockly.Blocks.functional_compute = {
    helpUrl: '',
    init: function() {
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(
        this,
        msg.evaluate(),
        blockly.BlockValueType.NONE,
        [{name: 'ARG1', type: blockly.BlockValueType.NUMBER}]
      );
    }
  };

  generator.functional_compute = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return 'Calc.compute(' + arg1 + ", 'block_id_" + this.id + "');\n";
  };
}
