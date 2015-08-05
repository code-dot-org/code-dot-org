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
 * @fileoverview Represents an active, update-able automatic scroll behavior.
 */
'use strict';

goog.provide('Blockly.AutoScroll');

goog.require('goog.async.AnimationDelay');

/**
 * @param {!Blockly.BlockSpace} blockSpace - blockspace to scroll
 * @param {!goog.math.Vec2} startPanVector - pan vector to begin with, pixels
 *        per second in each direction
 * @constructor
 */
Blockly.AutoScroll = function (blockSpace, startPanVector) {
  /**
   * BlockSpace to scroll
   * @private {!Blockly.BlockSpace}
   */
  this.blockSpace_ = blockSpace;

  /**
   * Current active auto-pan vector in x/y pixels per millisecond
   * @private {goog.math.Vec2}
   */
  this.activePanVector_ = startPanVector;

  /**
   * ID of active window.startInterval callback key
   * @type {number}
   * @private
   */
  this.animationDelay_ = new goog.async.AnimationDelay(
    this.handleAnimationDelay_.bind(this), window);
  this.lastTime_ = Date.now();
  this.animationDelay_.start();
};

Blockly.AutoScroll.prototype.stopAndDestroy = function () {
  this.activePanVector_ = null;
  this.animationDelay_.dispose();
  this.lastMouseX_ = null;
  this.lastMouseY_ = null;
};

/**
 * AnimationDelay listener. Ticks scrolling behavior and triggers another
 * frame request.
 * @param {number} now - current time in ms
 * @private
 */
Blockly.AutoScroll.prototype.handleAnimationDelay_ = function (now) {
  var dt = now - this.lastTime_;
  this.lastTime_ = now;
  this.scrollTick_(dt);
  this.animationDelay_.start();
};

/**
 * Perform scroll given time passed
 * @param msPassed
 * @private
 */
Blockly.AutoScroll.prototype.scrollTick_ = function (msPassed) {
  var scrollDx = this.activePanVector_.x * msPassed;
  var scrollDy = this.activePanVector_.y * msPassed;
  this.blockSpace_.scrollDeltaWithAnySelectedBlock(scrollDx, scrollDy,
    this.lastMouseX_, this.lastMouseY_);
};

/**
 * Updates properties of the current scroll, e.g. changing movement vector
 * or updating mouse position.
 * @param {goog.math.Vec2} scrollVector
 * @param {number} mouseClientX
 * @param {number} mouseClientY
 */
Blockly.AutoScroll.prototype.updateProperties = function (scrollVector,
                                                          mouseClientX,
                                                          mouseClientY) {
  this.activePanVector_ = scrollVector;
  this.lastMouseX_ = mouseClientX;
  this.lastMouseY_ = mouseClientY;
};

