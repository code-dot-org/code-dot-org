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
 * @fileoverview Colour blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.colour');

goog.require('Blockly.Blocks');


Blockly.Blocks.colour_picker = {
  // Colour picker.
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
    this.setHSV(196, 1.0, 0.79);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldColour('#ff0000'), 'COLOUR');
    this.setOutput(true, Blockly.BlockValueType.COLOUR);
    this.setTooltip(Blockly.Msg.COLOUR_PICKER_TOOLTIP);
  }
};

Blockly.Blocks.colour_random = {
  // Random colour.
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_RANDOM_HELPURL);
    this.setHSV(196, 1.0, 0.79);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.COLOUR_RANDOM_TITLE);
    this.setOutput(true, Blockly.BlockValueType.COLOUR);
    this.setTooltip(Blockly.Msg.COLOUR_RANDOM_TOOLTIP);
  }
};

Blockly.Blocks.colour_rgb = {
  // Compose a colour from RGB components.
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_RGB_HELPURL);
    this.setHSV(42, 0.89, 0.99);
    this.appendValueInput('RED')
        .setCheck(Blockly.BlockValueType.NUMBER)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_RGB_TITLE)
        .appendTitle(Blockly.Msg.COLOUR_RGB_RED);
    this.appendValueInput('GREEN')
        .setCheck(Blockly.BlockValueType.NUMBER)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_RGB_GREEN);
    this.appendValueInput('BLUE')
        .setCheck(Blockly.BlockValueType.NUMBER)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_RGB_BLUE);
    this.setOutput(true, Blockly.BlockValueType.COLOUR);
    this.setTooltip(Blockly.Msg.COLOUR_RGB_TOOLTIP);
  }
};

Blockly.Blocks.colour_blend = {
  // Blend two colours together.
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_BLEND_HELPURL);
    this.setHSV(42, 0.89, 0.99);
    this.appendValueInput('COLOUR1')
        .setCheck(Blockly.BlockValueType.COLOUR)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_BLEND_TITLE)
        .appendTitle(Blockly.Msg.COLOUR_BLEND_COLOUR1);
    this.appendValueInput('COLOUR2')
        .setCheck(Blockly.BlockValueType.COLOUR)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_BLEND_COLOUR2);
    this.appendValueInput('RATIO')
        .setCheck(Blockly.BlockValueType.NUMBER)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.COLOUR_BLEND_RATIO);
    this.setOutput(true, Blockly.BlockValueType.COLOUR);
    this.setTooltip(Blockly.Msg.COLOUR_BLEND_TOOLTIP);
  }
};
