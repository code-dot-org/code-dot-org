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
 * @fileoverview Click-drag panning interaction handler for BlockSpaces
 */
'use strict';

goog.provide('Blockly.PanDragHandler');

/**
 * @param {!Blockly.BlockSpace} blockSpace
 * @constructor
 */
Blockly.PanDragHandler = function (blockSpace) {
  /**
   * @private {Blockly.BlockSpace}
   */
  this.blockSpace_ = blockSpace;

  /**
   * Element which initiates pan-drag mode when clicked directly.
   * @private {EventTarget}
   */
  this.target_ = null;

  /**
   * @private {function}
   */
  this.onTargetMouseDown_ = null;

  /**
   * @private {BindData}
   */
  this.mouseDownEventBindData_ = null;

  /**
   * @private {BindData}
   */
  this.wheelEventBindData_ = null;

  /**
   * (for Safari)
   * @private {BindData}
   */
  this.mousewheelEventBindData_ = null;

  /**
   * @private {BindData}
   */
  this.contextMenuBlockEventBindData_ = null;

  /**
   * @private {BindData}
   */
  this.mouseMoveEventBindData_ = null;

  /**
   * @private {BindData}
   */
  this.mouseUpEventBindData_ = null;

  /**
   * @private {number}
   */
  this.startMouseX_ = null;

  /**
   * @private {number}
   */
  this.startMouseY_ = null;

  /**
   * @private {number}
   */
  this.startScrollX_ = null;

  /**
   * @private {number}
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
  this.mouseDownEventBindData_ = Blockly.bindEvent_(
      target, 'mousedown', this, this.onPanDragTargetMouseDown_);

  // Also block the context menu on the pan-drag target element
  this.contextMenuBlockEventBindData_ = Blockly.bindEvent_(
      target, 'contextmenu', null, Blockly.blockContextMenu);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.PanDragHandler.prototype.unbindBeginPanDragHandler = function () {
  if (this.mouseDownEventBindData_) {
    Blockly.unbindEvent_(this.mouseDownEventBindData_);
    this.mouseDownEventBindData_ = null;
  }

  if (this.contextMenuBlockEventBindData_) {
    Blockly.unbindEvent_(this.contextMenuBlockEventBindData_);
    this.contextMenuBlockEventBindData_ = null;
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
  this.mouseMoveEventBindData_ = Blockly.bindEvent_(
      window, 'mousemove', this, this.onPanDragMouseMove_, onCapture);
  this.mouseUpEventBindData_ = Blockly.bindEvent_(
      window, 'mouseup', this, this.onPanDragMouseUp_, onCapture);
};

/**
 * Unbinds mousemove and mouseup handlers that only apply during pan-drag mode.
 * @private
 */
Blockly.PanDragHandler.prototype.unbindDuringPanDragHandlers_ = function () {
  if (this.mouseMoveEventBindData_) {
    Blockly.unbindEvent_(this.mouseMoveEventBindData_);
    this.mouseMoveEventBindData_ = null;
  }

  if (this.mouseUpEventBindData_) {
    Blockly.unbindEvent_(this.mouseUpEventBindData_);
    this.mouseUpEventBindData_ = null;
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

  var clickIsOnTarget = e.target && e.target === this.target_;

  // Clicking on the flyout background clears the global selection
  if (Blockly.selected && !this.blockSpace_.isReadOnly() && clickIsOnTarget) {
    Blockly.selected.unselect();
  }

  var blockNonInteractive = Blockly.selected && !Blockly.selected.isMovable() &&
      !Blockly.selected.isEditable();

  // On left-click on scrollable area, begin scroll-drag
  // In readonly mode, we scroll-drag when clicking through a block, too.
  var shouldDrag = clickIsOnTarget || blockNonInteractive || this.blockSpace_.isReadOnly();
  var isLeftClick = !Blockly.isRightButton(e);

  if (this.blockSpace_.scrollbarPair && isLeftClick && shouldDrag) {
    this.beginDragScroll_(e);

    // Don't click through to the workspace drag handler, or the browser
    // default drag/scroll handlers
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
  this.startScrollX_ = this.blockSpace_.getScrollOffsetX();
  this.startScrollY_ = this.blockSpace_.getScrollOffsetY();

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

  // to pan, scroll opposite direction of drag
  var scrollDx = -mouseDx; // scroll - (down) if mouse up
  var scrollDy = -mouseDy; // scroll - (left) if mouse right

  this.blockSpace_.scrollTo(
    this.startScrollX_ + scrollDx,
    this.startScrollY_ + scrollDy);
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
