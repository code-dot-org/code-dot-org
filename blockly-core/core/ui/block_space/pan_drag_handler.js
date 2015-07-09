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
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.PanDragHandler');

/**
 * @param {!Blockly.BlockSpace} blockSpace
 * @constructor
 */
Blockly.PanDragHandler = function (blockSpace) {
  /**
   * @type {Blockly.BlockSpace}
   * @private
   */
  this.blockSpace_ = blockSpace;

  /**
   * Element which initiates pan-drag mode when clicked directly.
   * @type {EventTarget}
   * @private
   */
  this.target_ = null;

  /**
   * @type {function}
   * @private
   */
  this.onTargetMouseDown_ = null;

  /**
   * @type {bindData}
   * @private
   */
  this.mouseDownKey_ = null;

  /**
   * @type {bindData}
   * @private
   */
  this.contextMenuBlockKey_ = null;

  /**
   * @type {bindData}
   * @private
   */
  this.mouseMoveKey_ = null;

  /**
   * @type {bindData}
   * @private
   */
  this.mouseUpKey_ = null;

  /**
   * @type {number}
   * @private
   */
  this.startMouseX_ = null;

  /**
   * @type {number}
   * @private
   */
  this.startMouseY_ = null;

  /**
   * @type {Object}
   * @private
   */
  this.startMetrics_ = null;

  /**
   * @type {number}
   * @private
   */
  this.startScrollX_ = null;

  /**
   * @type {number}
   * @private
   */
  this.startScrollY_ = null;
};

/**
 * Establish a mousedown handler on the given dragTarget that will put the
 * blockspace into a pan-drag mode as long as the mouse is down.
 * @param {!EventTarget} target - Element which initiates pan-drag mode when
 *        clicked directly.
 * @param {function} [onDragTargetMouseDown] - optional function called when
 *        click on the drag target begins (used for hideChaff by BSE)
 */
Blockly.PanDragHandler.prototype.bindBeginPanDragHandler = function (target,
    onDragTargetMouseDown) {
  this.unbindBeginPanDragHandler();
  this.target_ = target;
  this.onTargetMouseDown_ = onDragTargetMouseDown;
  this.mouseDownKey_ = Blockly.bindEvent_(
      target, 'mousedown', this, this.onPanDragTargetMouseDown_);

  // Also block the context menu on the pan-drag target element
  this.contextMenuBlockKey_ = Blockly.bindEvent_(
      target, 'contextmenu', null, Blockly.blockContextMenu);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.PanDragHandler.prototype.unbindBeginPanDragHandler = function () {
  if (this.mouseDownKey_) {
    Blockly.unbindEvent_(this.mouseDownKey_);
    this.mouseDownKey_ = null;
  }

  if (this.contextMenuBlockKey_) {
    Blockly.unbindEvent_(this.contextMenuBlockKey_);
    this.contextMenuBlockKey_ = null;
  }

  this.target_ = null;
};


/**
 * Binds temporary mousemove and mouseup handlers against window,
 * so that drag behavior and ending the drag work no matter where the cursor
 * goes after the initial mousedown.
 * @private
 */
Blockly.PanDragHandler.prototype.bindDuringPanDragHandlers_ = function () {
  this.unbindDuringPanDragHandlers_();

  // We bind against "capture" (instead of the default "bubble") so that we
  // receive the event before the actual event target - pan-drag mode should
  // pretty much override everything.
  var onCapture = true;
  this.mouseMoveKey_ = Blockly.bindEvent_(
      window, 'mousemove', this, this.onPanDragMouseMove_, onCapture);
  this.mouseUpKey_ = Blockly.bindEvent_(
      window, 'mouseup', this, this.onPanDragMouseUp_, onCapture);
};

/**
 * Unbinds mousemove and mouseup handlers that only apply during pan-drag mode.
 * @private
 */
Blockly.PanDragHandler.prototype.unbindDuringPanDragHandlers_ = function () {
  if (this.mouseMoveKey_) {
    Blockly.unbindEvent_(this.mouseMoveKey_);
    this.mouseMoveKey_ = null;
  }

  if (this.mouseUpKey_) {
    Blockly.unbindEvent_(this.mouseUpKey_);
    this.mouseUpKey_ = null;
  }
};

/**
 * When a mousedown event occurs over the pan-drag target, deselect blocks
 * and decide whether we can actually begin pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.PanDragHandler.prototype.onPanDragTargetMouseDown_ = function (e) {
  if (this.onTargetMouseDown_) {
    this.onTargetMouseDown_();
  }

  var isClickDirectlyOnDragTarget = e.target && e.target === this.target_;

  // Clicking on the flyout background clears the global selection
  if (Blockly.selected && !Blockly.readOnly && isClickDirectlyOnDragTarget) {
    Blockly.selected.unselect();
  }

  // On left-click on scrollable area, begin scroll-drag
  // In readonly mode, we scroll-drag when clicking through a block, too.
  if (this.blockSpace_.scrollbarPair && !Blockly.isRightButton(e) &&
      (Blockly.readOnly || isClickDirectlyOnDragTarget)) {
    this.beginDragScroll_(e);

    // Don't click through to the workspace drag handler, or the browser
    // default drag/scroll handlers.
    e.stopPropagation();
    e.preventDefault();
  }
};

/**
 * Actually begin pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.PanDragHandler.prototype.beginDragScroll_ = function (e) {
  // Record the current mouse position.
  this.startMouseX_ = e.clientX;
  this.startMouseY_ = e.clientY;
  this.startMetrics_ = this.blockSpace_.getMetrics();
  this.startScrollX_ = this.blockSpace_.xOffsetFromView;
  this.startScrollY_ = this.blockSpace_.yOffsetFromView;

  this.bindDuringPanDragHandlers_();
};

/**
 * Mouse-move handler that is only bound and active during pan-drag mode
 * for this blockspace.  Causes scroll and stops the event.
 * @param {!Event} e
 * @private
 */
Blockly.PanDragHandler.prototype.onPanDragMouseMove_ = function (e) {
  // Prevent text selection on page
  Blockly.removeAllRanges();

  var mouseDx = e.clientX - this.startMouseX_; // + if mouse right
  var mouseDy = e.clientY - this.startMouseY_; // + if mouse down
  var metrics = this.startMetrics_;
  var blockSpaceSize = this.blockSpace_.getScrollableSize(metrics);

  // New target scroll (x,y) offset
  var newScrollX = this.startScrollX_ + mouseDx; // new pan-right (+) position
  var newScrollY = this.startScrollY_ + mouseDy; // new pan-down (+) position

  // Don't allow panning past top left
  newScrollX = Math.min(newScrollX, 0);
  newScrollY = Math.min(newScrollY, 0);

  // Don't allow panning past bottom or right
  var furthestScrollAllowedX = -blockSpaceSize.width + metrics.viewWidth;
  var furthestScrollAllowedY = -blockSpaceSize.height + metrics.viewHeight;
  newScrollX = Math.max(newScrollX, furthestScrollAllowedX);
  newScrollY = Math.max(newScrollY, furthestScrollAllowedY);

  // Set the scrollbar position, which will auto-scroll the canvas
  this.blockSpace_.scrollbarPair.set(-newScrollX, -newScrollY);

  e.stopPropagation();
  e.preventDefault();
};

/**
 * Mouse-up handler that is only bound and active during pan-drag mode
 * for this flyout.  Ends pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.PanDragHandler.prototype.onPanDragMouseUp_ = function (e) {
  this.unbindDuringPanDragHandlers_();
  e.stopPropagation();
  e.preventDefault();
};
