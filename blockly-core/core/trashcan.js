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
 * @fileoverview Object representing a trash can icon.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Trashcan');


/**
 * Class for a trash can.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace to sit in.
 * @constructor
 */
Blockly.Trashcan = function(blockSpace) {
  this.blockSpace_ = blockSpace;
};

/**
 * URL of the trashcan image (minus lid).
 * @type {string}
 * @private
 */
Blockly.Trashcan.prototype.CLOSED_URL_ = 'media/canclosed.png';

/**
 * URL of the lid image.
 * @type {string}
 * @private
 */
Blockly.Trashcan.prototype.OPEN_URL_ = 'media/canopen.png';

/**
 * Width of both the trash can and lid images.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.WIDTH_ = 70;

/**
 * Height of the trashcan image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.HEIGHT_ = 70;

/**
 * Distance between trashcan and top edge of blockSpace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_TOP_ = 15;

/**
 * Distance between trashcan and right edge of blockSpace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_SIDE_ = 22;

/**
 * Current open/close state of the lid.
 * @type {boolean}
 */
Blockly.Trashcan.prototype.isOpen = false;

/**
 * Additional radius of the trashcan; used in determining the open/closed
 * state of the lid
 * @type {number}
 */
Blockly.Trashcan.prototype.radius = 50;

/**
 * The SVG group containing the trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgGroup_ = null;

/**
 * The SVG image element of the closed trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgClosedCan_ = null;

/**
 * The SVG image element of the open trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgOpenCan_ = null;

/**
 * Left coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.left_ = 0;

/**
 * Top coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.top_ = 0;

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
Blockly.Trashcan.prototype.createDom = function() {
  /*
  <g filter="url(#blocklyTrashcanShadowFilter)">
    <image width="100" height="100" href="media/canclosed.png"></image>
    <image width="100" height="100" visibility="hidden" href="media/canopen.png"></image>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'id': 'trashcan', 'filter': 'url(#blocklyTrashcanShadowFilter)'}, null);
  this.svgClosedCan_ = Blockly.createSvgElement('image',
      {'width': this.WIDTH_, 'height': this.HEIGHT_},
      this.svgGroup_);
  this.svgClosedCan_.setAttributeNS(
      'http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.assetUrl(this.CLOSED_URL_));
  this.svgOpenCan_ = Blockly.createSvgElement('image',
      {'width': this.WIDTH_, 'height': this.HEIGHT_},
      this.svgGroup_);
  this.svgOpenCan_.setAttribute('visibility', 'hidden');
  this.svgOpenCan_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.assetUrl(this.OPEN_URL_));
  return this.svgGroup_;
};

/**
 * Initialize the trash can.
 */
Blockly.Trashcan.prototype.init = function() {
  this.setOpen_(false);
  this.position_();
  // If the document resizes, reposition the trash can.
  Blockly.bindEvent_(window, 'resize', this, this.position_);
};

/**
 * Dispose of this trash can.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Trashcan.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgClosedCan_ = null;
  this.svgOpenCan_ = null;
  this.blockSpace_ = null;
};

/**
 * Move the trash can to the top-right corner.
 * @private
 */
Blockly.Trashcan.prototype.position_ = function() {
  var metrics = this.blockSpace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (blockSpace is probably not visible).
    return;
  }
  if (Blockly.RTL) {
    this.left_ = this.MARGIN_SIDE_;
  } else {
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_;
  }
  this.top_ = this.MARGIN_TOP_;
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Determines if the mouse is currently over the trash can.
 * Opens/closes the lid and sets the isOpen flag.
 * @param {!Event} e Mouse move event.
 */
Blockly.Trashcan.prototype.onMouseMove = function(e) {
  /*
  An alternative approach would be to use onMouseOver and onMouseOut events.
  However the selected block will be between the mouse and the trash can,
  thus these events won't fire.
  Another approach is to use HTML5's drag & drop API, but it's widely hated.
  Instead, we'll just have the block's drag_ function call us.
  */
  if (!this.svgGroup_) {
    return;
  }
  var mouseXY = Blockly.mouseToSvg(e);
  var trashXY = Blockly.getSvgXY_(this.svgGroup_);
  if (Blockly.ieVersion() && Blockly.ieVersion() <= 10) {
    // Revert to HTML coordinates since getScreenCTM is broken in IE <= 10.
    mouseXY = {
      'x': e.clientX,
      'y': e.clientY
    };
    var trashBB = document.getElementById('trashcan').getBoundingClientRect();
    trashXY = {
      'x': trashBB.left,
      'y': trashBB.top
    };
  }
  var over = ((mouseXY.x + this.radius) > trashXY.x) &&
             (mouseXY.x < (trashXY.x + this.WIDTH_ + this.radius)) &&
             ((mouseXY.y + this.radius) > trashXY.y) &&
             (mouseXY.y < (trashXY.y + this.HEIGHT_ + this.radius));
  // For bonus points we might want to match the trapezoidal outline.
  if (this.isOpen != over) {
    this.setOpen_(over);
  }
};

/**
 * Flip the lid open or shut.
 * @param {boolean} state True if open.
 * @private
 */
Blockly.Trashcan.prototype.setOpen_ = function(state) {
  if (this.isOpen == state) {
    return;
  }
  this.isOpen = state;
  this.animateLid_();
};

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @private
 */
Blockly.Trashcan.prototype.animateLid_ = function() {
  if (this.isOpen) {
    this.svgOpenCan_.setAttribute('visibility', 'visible');
  } else {
    this.svgOpenCan_.setAttribute('visibility', 'hidden');
  }
};

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
Blockly.Trashcan.prototype.close = function() {
  this.setOpen_(false);
};
