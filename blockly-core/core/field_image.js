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
 * @fileoverview Image field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldImage');

goog.require('Blockly.Field');
goog.require('goog.userAgent');
goog.require('Blockly.ImageDimensionCache');

/**
 * Class for an image.
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function(src, width, height) {
  if (!width && !height) {
    var self = this;
    var dimensions = Blockly.ImageDimensionCache.getCachedDimensionsOrDefaultAndUpdate(src, function(updatedWidth, updatedHeight) {
      if (!self.isDestroyed_()) {
        self.updateDimensions_(updatedWidth, updatedHeight);
      }
    });
    width = dimensions.width;
    height = dimensions.height;
  }
  this.initializeWithImage_(src, width, height);
};
goog.inherits(Blockly.FieldImage, Blockly.Field);

Blockly.FieldImage.prototype.isDestroyed_ = function() {
  return !this.imageElement_;
};

Blockly.FieldImage.IMAGE_LOADING_WIDTH = 40;
Blockly.FieldImage.IMAGE_LOADING_HEIGHT = 40;
Blockly.FieldImage.IMAGE_OFFSET_Y = 6 - Blockly.BlockSvg.TITLE_HEIGHT;
Blockly.FieldImage.BELOW_IMAGE_PADDING = 10;

Blockly.FieldImage.prototype.initializeWithImage_ = function(src, width, height) {
  this.sourceBlock_ = null;
  // Ensure height and width are numbers.  Strings are bad at math.
  height = Number(height);
  width = Number(width);
  this.size_ = {height: height + Blockly.FieldImage.BELOW_IMAGE_PADDING, width: width};
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  this.imageElement_ = Blockly.createSvgElement('image',
      {'height': height + 'px',
       'width': width + 'px',
       'y': Blockly.FieldImage.IMAGE_OFFSET_Y}, this.fieldGroup_);
  this.setText(src);
  if (goog.userAgent.GECKO) {
    // Due to a Firefox bug which eats mouse events on image elements,
    // a transparent rectangle needs to be placed on top of the image.
    this.clickRectElement_ = Blockly.createSvgElement('rect',
        {'height': height + 'px',
         'width': width + 'px',
         'y': Blockly.FieldImage.IMAGE_OFFSET_Y,
         'fill-opacity': 0}, this.fieldGroup_);
  }
};

Blockly.FieldImage.prototype.updateDimensions_ = function(width, height) {
  this.size_ = {height: height + Blockly.FieldImage.BELOW_IMAGE_PADDING, width: width};
  this.imageElement_.setAttribute('width', width + 'px');
  this.imageElement_.setAttribute('height', height + 'px');
  if (this.clickRectElement_) {
    this.clickRectElement_.setAttribute('width', width + 'px');
    this.clickRectElement_.setAttribute('height', height + 'px');
  }
  this.refreshRender();
};

/**
 * Rectangular mask used by Firefox.
 * @type {Element}
 * @private
 */
Blockly.FieldImage.prototype.clickRectElement_ = null;

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldImage.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Image has already been initialized once.';
  }
  this.sourceBlock_ = block;
  block.getSvgRoot().appendChild(this.fieldGroup_);

  // Configure the field to be transparent with respect to tooltips.
  var topElement = this.getClickTarget();
  topElement.tooltip = this.sourceBlock_;
  Blockly.Tooltip && Blockly.Tooltip.bindMouseEvents(topElement);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldImage.prototype.dispose = function() {
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.imageElement_ = null;
  this.clickRectElement_ = null;
};

/**
 * Sets the image's preserveAspectRatio attribute
 * @param {string} value Value for preserveAspectRatio
 */
Blockly.FieldImage.prototype.setPreserveAspectRatio = function(value) {
  this.imageElement_.setAttribute('preserveAspectRatio', value);
};

/**
 * Returns the click target for this image
 * @returns {Element}
 */
Blockly.FieldImage.prototype.getClickTarget = function () {
  return this.clickRectElement_ || this.imageElement_;
};
/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldImage.prototype.setTooltip = function(newTip) {
  this.getClickTarget().tooltip = newTip;
};

/**
 * Get the source URL of this image.
 * @return {string} Current text.
 * @override
 */
Blockly.FieldImage.prototype.getText = function() {
  return this.src_;
};

/**
 * Set the source URL of this image.
 * @param {?string} src New source.
 * @override
 */
Blockly.FieldImage.prototype.setText = function(src) {
  if (src === null) {
    // No change if null.
    return;
  }
  this.src_ = src;
  this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', goog.isString(src) ? src : '');
};

/**
 * Update the image and recalculate its size
 * @param {?string} src New source.
 * @override
 */
Blockly.FieldImage.prototype.setTextAndRefreshSize = function(src) {
  this.setText(src);
  this.getDimensionsThenUpdate_(src);
};
