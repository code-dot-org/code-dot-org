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
 * @param {!goog.math.Vec2} startPanVector
 * @constructor
 */
Blockly.AutoScroll = function (blockSpace, startPanVector) {
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
  this.activePanVector_ = startPanVector;

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
Blockly.AutoScroll.DT = 1000 / 60; // 60 updates/sec

Blockly.AutoScroll.ACCEL_START_TIME = 600; // in ms
Blockly.AutoScroll.ACCELERATION = 1.1;

Blockly.AutoScroll.prototype.stopAndDestroy = function () {
  this.activePanVector_ = null;
  if (this.activePanningIntervalID_) {
    window.clearInterval(this.activePanningIntervalID_);
  }
  this.activePanningIntervalID_ = null;
  this.lastMouseX_ = null;
  this.lastMouseY_ = null;
  this.panStart_ = null;
};

Blockly.AutoScroll.prototype.scrollTick_ = function (dt) {
  //var currentTime = new Date().getTime();
  //var elapsedTime = currentTime - this.panStart_;
  //var velocity = this.activePanVector_.speed;
  //if (elapsedTime > Blockly.AutoScroll.ACCEL_START_TIME) {
  //  var t = elapsedTime - Blockly.AutoScroll.ACCEL_START_TIME;
  //  var sign = velocity > 0 ? 1 : -1;
  //  velocity += sign * Blockly.AutoScroll.ACCELERATION * t;
  //}

  //var panDy = velocity / dt;

  this.blockSpace_.scrollDeltaWithAnySelectedBlock(
    this.activePanVector_.x / dt,
    this.activePanVector_.y / dt,
    this.lastMouseX_, this.lastMouseY_);
};

/**
 * @param {goog.math.Vec2} scrollVector
 * @param {number} mouseClientX
 * @param {number} mouseClientY
 */
Blockly.AutoScroll.prototype.updateScroll = function (scrollVector,
                                                       mouseClientX,
                                                       mouseClientY) {
  this.activePanVector_ = scrollVector;
  this.lastMouseX_ = mouseClientX;
  this.lastMouseY_ = mouseClientY;
};

