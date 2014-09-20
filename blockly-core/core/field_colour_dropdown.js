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
 * @fileoverview Single column colour dropdown input field.
 */
'use strict';

goog.provide('Blockly.FieldColourDropdown');
goog.require('Blockly.Field');
goog.require('Blockly.FieldRectangularDropdown');

/**
 * Class for a rectangular colour choice dropdown field.
 * @param {!Array.<string>} choices An array of choices for the colour dropdown list, each choice is
 *                                  a hex colour value (e.g., '#000000')
 * @param width {number}
 * @param height {number}
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColourDropdown = function(choices, width, height) {
  var colourChoiceTuples = this.convertColourChoicesToTuples_(choices);
  Blockly.FieldColourDropdown.superClass_.constructor.call(this, colourChoiceTuples);
  this.updateDimensions_(width, height);
};
goog.inherits(Blockly.FieldColourDropdown, Blockly.FieldRectangularDropdown);

/**
 * Convert an array of colour choices ['#000000', '#FFFFFF'] to an array of those 
 * choices as preview data / value tuples for the superclass.
 * E.g., [['#000000', '#000000'], ['#FFFFFF', '#FFFFFF']]
 * @param choices
 * @returns {Array}
 * @private
 */
Blockly.FieldColourDropdown.prototype.convertColourChoicesToTuples_ = function (choices) {
  var previewDataValueTuples = [];
  for (var i = 0; i < choices.length; i++) {
    var choice = choices[i];
    var choiceTuple = [];
    choiceTuple[Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX] = choice;
    choiceTuple[Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX] = choice;
    previewDataValueTuples.push(choiceTuple);
  }
  return previewDataValueTuples;
};

Blockly.FieldColourDropdown.prototype.addPreviewElementTo_ = function(parentElement) {
  this.previewElement_ = Blockly.createSvgElement('rect', {
    'y': Blockly.FieldImage.IMAGE_OFFSET_Y,
    'height': Blockly.FieldImage.IMAGE_LOADING_HEIGHT + 'px',
    'width': Blockly.FieldImage.IMAGE_LOADING_WIDTH + 'px'
  }, parentElement);
};

Blockly.FieldColourDropdown.prototype.createDropdownPreviewElement_ = function(previewData) {
  var rect = document.createElement('div');
  rect.style.backgroundColor = previewData;
  rect.style.width = this.previewSize_.width + 'px';
  rect.style.height = this.previewSize_.height + 'px';
  return rect;
};

Blockly.FieldColourDropdown.prototype.updatePreviewData_ = function(previewData) {
  this.previewElement_.setAttribute('fill', previewData);
};

Blockly.FieldColourDropdown.prototype.updatePreviewDimensions_ = function(previewWidth, previewHeight) {
  this.previewElement_.setAttribute('width', previewWidth + 'px');
  this.previewElement_.setAttribute('height', previewHeight + 'px');
};
