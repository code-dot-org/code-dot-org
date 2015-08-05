/**
 * Visual Blocks Language
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
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.JavaScript.functionalExamples');

goog.require('Blockly.JavaScript');

/**
 * Generates javascript for a functional example
 * with expected and actual code blocks
 */
Blockly.JavaScript.functional_example = function() {
  var expectedValue = Blockly.JavaScript.statementToCode(this, 'EXPECTED', Blockly.JavaScript.ORDER_NONE) || 'null';
  var actualValue = Blockly.JavaScript.statementToCode(this, 'ACTUAL', Blockly.JavaScript.ORDER_NONE) || 'null';
  return ['(' + expectedValue + " == " + actualValue + ')', 0];
};
