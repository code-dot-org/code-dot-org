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
 * @fileoverview Scroll-BlockSpace-on-mousewheel interaction handler.
 */
'use strict';

goog.provide('Blockly.ScrollOnWheelHandler');

/**
 * @param {!Blockly.BlockSpace} blockSpace
 * @constructor
 */
Blockly.ScrollOnWheelHandler = function (blockSpace) {
  /**
   * @private {Blockly.BlockSpace}
   */
  this.blockSpace_ = blockSpace;

  /**
   * @private {BindData}
   */
  this.wheelEventBindData_ = null;

  /**
   * (for Safari)
   * @private {BindData}
   */
  this.mousewheelEventBindData_ = null;
};

/**
 * Establish a mousewheel handler on the given wheelTarget that will
 * @param {!EventTarget} wheelTarget
 */
Blockly.ScrollOnWheelHandler.prototype.bindTo = function (wheelTarget) {
  this.unbindWheelScrollHandler();

  this.wheelEventBindData_ = Blockly.bindEvent_(wheelTarget,
      'wheel', this, this.onWheel_);

  // Safari uses 'mousewheel'
  this.mousewheelEventBindData_ = Blockly.bindEvent_(
      wheelTarget, 'mousewheel', this, this.onWheel_);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.ScrollOnWheelHandler.prototype.unbindWheelScrollHandler = function () {
  if (this.wheelEventBindData_) {
    Blockly.unbindEvent_(this.wheelEventBindData_);
    this.wheelEventBindData_ = null;
  }

  if (this.mousewheelEventBindData_) {
    Blockly.unbindEvent_(this.mousewheelEventBindData_);
    this.mousewheelEventBindData_ = null;
  }
};

/**
 * Scroll the BlockSpace up or down based on wheel scrolling.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.ScrollOnWheelHandler.prototype.onWheel_ = function(e) {
  if (!this.blockSpace_.scrollbarPair) {
    return;
  }

  // + is down
  var wheelDelta = Blockly.getNormalizedWheelDeltaY(e);
  if (wheelDelta) {
    this.blockSpace_.scrollWithAnySelectedBlock(
      this.blockSpace_.getScrollOffsetX(),
      this.blockSpace_.getScrollOffsetY() + wheelDelta,
      e.clientX, e.clientY);

    // Don't scroll the page.
    e.stopPropagation();
    e.preventDefault();
  }
};
