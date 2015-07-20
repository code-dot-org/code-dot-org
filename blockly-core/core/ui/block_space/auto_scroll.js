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
 * @fileoverview Represents an active, updateable automatic scroll
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.AutoScroll');

/**
 * @param {!Blockly.BlockSpace} blockSpace - blockspace to scroll
 * @param {!Blockly.AutoScroll} startingRule
 * @constructor
 */
Blockly.AutoScroll = function (blockSpace, startingRule) {
  /**
   * BlockSpace to scroll
   * @type {!Blockly.BlockSpace}
   * @private
   */
  this.blockSpace_ = blockSpace;

  /**
   * Time of most recent pan start in ms since epoch
   * @type {number}
   * @private
   */
  this.panStart_ = new Date().getTime();

  /**
   * Current active auto-pan rule
   * @type {number}
   * @private
   */
  this.activePanRule_ = startingRule;

  /**
   * ID of active window.startInterval callback key
   * @type {number}
   * @private
   */
  this.activePanningIntervalID_ =
    window.setInterval(
      this.scrollTick_.bind(this, Blockly.AutoScroll.DT),
      Blockly.AutoScroll.DT);

};

/**
 * dt for scrolling in ms
 * @type {number}
 */
Blockly.AutoScroll.DT = 1000 / 60;

Blockly.AutoScroll.prototype.stopAndDestroy = function () {
  this.activePanRule_ = null;
  if (this.activePanningIntervalID_) {
    window.clearInterval(this.activePanningIntervalID_);
  }
  this.activePanningIntervalID_ = null;
  this.lastMouseX_ = null;
  this.lastMouseY_ = null;
  this.panStart_ = null;
};

Blockly.AutoScroll.prototype.scrollTick_ = function (dt) {
  var panDy = this.activePanRule_.speed / dt;
  this.blockSpace_.scrollDeltaWithAnySelectedBlock(0, panDy,
    this.lastMouseX_, this.lastMouseY_);
};

Blockly.AutoScroll.prototype.updateScroll = function (rule,
                                                       mouseClientX,
                                                       mouseClientY) {
  this.activePanRule_ = rule;
  this.lastMouseX_ = mouseClientX;
  this.lastMouseY_ = mouseClientY;
};

