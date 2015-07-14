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
 * @fileoverview Panning (click-drag and mousewheel) scroll interaction handler
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
   * @type {BindData}
   * @private
   */
  this.mouseDownEventKey_ = null;

  /**
   * @type {BindData}
   * @private
   */
  this.wheelEventKey_ = null;

  /**
   * (for Safari)
   * @type {BindData}
   * @private
   */
  this.mousewheelEventKey_ = null;

  /**
   * @type {BindData}
   * @private
   */
  this.contextMenuBlockEventKey_ = null;

  /**
   * @type {BindData}
   * @private
   */
  this.mouseMoveEventKey_ = null;

  /**
   * @type {BindData}
   * @private
   */
  this.mouseUpEventKey_ = null;

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
  this.mouseDownEventKey_ = Blockly.bindEvent_(
      target, 'mousedown', this, this.onPanDragTargetMouseDown_);

  this.wheelEventKey_ = Blockly.bindEvent_(target, 'wheel', this, this.onWheel_);

  // Safari uses 'mousewheel'
  this.mousewheelEventKey_ = Blockly.bindEvent_(
      target, 'mousewheel', this, this.onWheel_);

  // Also block the context menu on the pan-drag target element
  this.contextMenuBlockEventKey_ = Blockly.bindEvent_(
      target, 'contextmenu', null, Blockly.blockContextMenu);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.PanDragHandler.prototype.unbindBeginPanDragHandler = function () {
  if (this.mouseDownEventKey_) {
    Blockly.unbindEvent_(this.mouseDownEventKey_);
    this.mouseDownEventKey_ = null;
  }

  if (this.wheelEventKey_) {
    Blockly.unbindEvent_(this.wheelEventKey_);
    this.wheelEventKey_ = null;
  }

  if (this.mousewheelEventKey_) {
    Blockly.unbindEvent_(this.mousewheelEventKey_);
    this.mousewheelEventKey_ = null;
  }

  if (this.contextMenuBlockEventKey_) {
    Blockly.unbindEvent_(this.contextMenuBlockEventKey_);
    this.contextMenuBlockEventKey_ = null;
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
  this.mouseMoveEventKey_ = Blockly.bindEvent_(
      window, 'mousemove', this, this.onPanDragMouseMove_, onCapture);
  this.mouseUpEventKey_ = Blockly.bindEvent_(
      window, 'mouseup', this, this.onPanDragMouseUp_, onCapture);
};

/**
 * Unbinds mousemove and mouseup handlers that only apply during pan-drag mode.
 * @private
 */
Blockly.PanDragHandler.prototype.unbindDuringPanDragHandlers_ = function () {
  if (this.mouseMoveEventKey_) {
    Blockly.unbindEvent_(this.mouseMoveEventKey_);
    this.mouseMoveEventKey_ = null;
  }

  if (this.mouseUpEventKey_) {
    Blockly.unbindEvent_(this.mouseUpEventKey_);
    this.mouseUpEventKey_ = null;
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

  // Clicking on the flyout background clears the global selection
  if (Blockly.selected && !Blockly.readOnly) {
    Blockly.selected.unselect();
  }

  // On left-click on scrollable area, begin scroll-drag
  // In readonly mode, we scroll-drag when clicking through a block, too.
  if (this.blockSpace_.scrollbarPair && !Blockly.isRightButton(e)) {
    this.beginDragScroll_(e);

    // Don't click through to the workspace drag handler, or the browser
    // default drag/scroll handlers
    e.stopPropagation();
    e.preventDefault();
  }
};

/**
 * Scroll the blockspace up or down based on wheel scrolling.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.PanDragHandler.prototype.onWheel_ = function(e) {
  if (!this.blockSpace_.scrollbarPair) {
    return;
  }

  // + is down
  var wheelDelta = Blockly.getNormalizedWheelDeltaY(e);
  if (wheelDelta) {
    var yOffsetBefore = this.blockSpace_.scrollbarOffsetY();
    this.blockSpace_.scrollTo(this.blockSpace_.scrollbarOffsetX(),
       + this.blockSpace_.scrollbarOffsetY() + wheelDelta);

    // If dragging a block too, move the "mouse start position" as if it
    // had scrolled along with any blockspace scrolling, and add the scroll event
    // delta to the block's movement.
    if (Blockly.Block.isFreelyDragging() && Blockly.selected) {
      var scrolledY = this.blockSpace_.scrollbarOffsetY() - yOffsetBefore;
      Blockly.selected.startDragMouseY -= scrolledY;
      // Moves block to stay under cursor with e.clientY
      Blockly.selected.onMouseMove_(e);
    }

    // Don't scroll the page.
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
  this.startScrollX_ = this.blockSpace_.scrollbarOffsetX();
  this.startScrollY_ = this.blockSpace_.scrollbarOffsetY();

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
