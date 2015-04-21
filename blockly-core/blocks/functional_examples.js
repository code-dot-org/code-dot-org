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
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.functionalExamples');

goog.require('Blockly.Blocks');

/**
 * Definition block for a custom functional block
 */
Blockly.Blocks.functional_example = {
  shouldHideIfInMainBlockSpace: function () {
    return true;
  },
  isCopyable: function () {
    return false;
  },
  init: function() {
    this.setHSV(94, 0.84, 0.60);
    this.setFunctional(true, { headerHeight: 0, rowBuffer: 3 });
    this.setFunctionalOutput(false);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.EXAMPLE)
        .appendTitle('(' + [Blockly.Msg.ACTUAL, Blockly.Msg.EXPECTED].join(', ') + ')');
    this.appendFunctionalInput('ACTUAL').setAlign(Blockly.ALIGN_CENTRE);
    this.appendFunctionalInput('EXPECTED').setAlign(Blockly.ALIGN_CENTRE).setInline(true);
    this.setTooltip(Blockly.Msg.EXAMPLE_DESCRIPTION);
  },
  mutationToDom: function() {
  },
  domToMutation: function(xmlElement) {
  },
  updateOutputType: function(outputType) {
    this.outputType_ = outputType;
    this.changeFunctionalOutput(this.outputType_);
  },
  /**
   * Updates the functional examples' usage types
   * @param {Blockly.BlockValueType} newType
   */
  updateInputsToType: function (newType) {
    this.updateInputType_(this.getInput('EXPECTED'), newType);
    this.updateInputType_(this.getInput('ACTUAL'), newType);
    this.render();
  },
  /**
   * Updates given input to match a given functional value type
   * @param {Blockly.Input} input
   * @param {Blockly.BlockValueType} newType
   */
  updateInputType_: function (input, newType) {
    input.setHSV.apply(input, Blockly.FunctionalTypeColors[newType]);
    input.setCheck(newType);
  }
};
