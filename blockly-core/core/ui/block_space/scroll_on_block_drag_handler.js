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
 * @fileoverview Scrolling-on-block-drag interaction handler
 */
'use strict';

goog.provide('Blockly.ScrollOnBlockDragHandler');

goog.require('Blockly.AutoScroll');
goog.require('goog.math.Vec2');

/**
 * @param {!Blockly.BlockSpace} blockSpace
 * @constructor
 */
Blockly.ScrollOnBlockDragHandler = function (blockSpace) {
  /**
   * BlockSpace to scroll
   * @private {Blockly.BlockSpace}
   */
  this.blockSpace_ = blockSpace;

  /**
   * Direction names to Vec2 1/-1 representations
   * @type {{top: goog.math.Vec2, bottom: goog.math.Vec2,
   *         left: goog.math.Vec2, right: goog.math.Vec2}}
   */
  this.SCROLL_DIRECTION_VECTORS = {
    top: new goog.math.Vec2(0, -1),
    bottom: new goog.math.Vec2(0, 1),
    left: new goog.math.Vec2(-1, 0),
    right: new goog.math.Vec2(1, 0)
  };
};

Blockly.ScrollOnBlockDragHandler.prototype.stopAutoScrolling = function () {
  if (this.activeAutoScroll_) {
    this.activeAutoScroll_.stopAndDestroy();
  }
  this.activeAutoScroll_ = null;
};

var MS_PER_SEC = 1000;

/**
 * Pixels-per-millisecond scrolling speeds for mouse-location triggered scrolling
 * @type {number}
 */
var MOUSE_SPEED_SLOW = .5;
var MOUSE_SPEED_FAST = 1.6;

/**
 * Pixels-per-millisecond scrolling speeds for block-location triggered scrolling
 * @type {number}
 */
var BLOCK_SPEED_SLOW = .28;
var BLOCK_SPEED_FAST = 1.4;

/**
 * Mouse distance from side when to start slow scrolling
 * @type {number}
 */
var MOUSE_START_DISTANCE = 0;
/**
 * Mouse distance outside of viewport side when to start fast scrolling
 * @type {number}
 */
var MOUSE_START_FAST_DISTANCE = 35;

/**
 * Distance from block edge to side when to start slow scrolling
 * @type {number}
 */
var BLOCK_START_DISTANCE = 0;
/**
 * Distance from block edge to side when to start fast scrolling
 * @type {number}
 */
var BLOCK_START_FAST_DISTANCE = 50;

/**
 * A block is considered 'oversized' on a given dimension if it takes up more
 * than this percentage of the viewport size.
 * @type {number}
 */
var OVERSIZE_BLOCK_THRESHOLD = 0.85;

/**
 * Drag 'margin' around cursor to use instead of block bounds when the dragged
 * block is oversized. Given in block space units.
 * @type {number}
 */
var FALLBACK_DRAG_MARGIN = 15;

/**
 * Enables debug drawing of various block drag scrolling operations
 * @type {boolean}
 */
Blockly.ScrollOnBlockDragHandler.DEBUG = false;

/**
 * Pans the blockspace in the direction of a block if it's hanging off the
 * edge of the blockspace.
 *
 * - Will only expand the blockspace vertically if vertical scrollbars are
 * enabled
 * - Will only expand the blockspace horizontally if horizontal scrollbars are
 * enabled
 *
 * @see Scrolling behavior inspiration:
 *      {@url http://ux.stackexchange.com/a/73902}
 *
 * @param {Blockly.Block} block
 * @param {number} mouseClientX
 * @param {number} mouseClientY
 */
Blockly.ScrollOnBlockDragHandler.prototype.panIfOverEdge = function (block,
                                                                     mouseClientX,
                                                                     mouseClientY) {
  if (!this.blockSpace_.currentlyScrollable()) {
    // Don't perform potentially expensive panning calculations if not currently
    // scrollable
    return;
  }

  var SCROLLABLE_DIRECTIONS = [];

  if (this.blockSpace_.scrollbarPair &&
    this.blockSpace_.scrollbarPair.canScrollHorizontally()) {
    SCROLLABLE_DIRECTIONS.push('left', 'right');
  }

  if (this.blockSpace_.scrollbarPair &&
    this.blockSpace_.scrollbarPair.canScrollVertically()) {
    SCROLLABLE_DIRECTIONS.push('top', 'bottom');
  }

  if (SCROLLABLE_DIRECTIONS.length === 0) {
    return;
  }

  var mouseSvg = Blockly.mouseCoordinatesToSvg(
    mouseClientX, mouseClientY, this.blockSpace_.blockSpaceEditor.svg_);
  var mouseViewport = Blockly.svgCoordinatesToViewport(
    new goog.math.Coordinate(mouseSvg.x, mouseSvg.y), this.blockSpace_);
  var mouseBlockSpace = Blockly.viewportCoordinateToBlockSpace(
    mouseViewport, this.blockSpace_);

  var viewportBox = this.blockSpace_.getViewportBox();
  var blockBox = block.getBox();

  // When dragged block is almost as tall as the viewport, use a small bounding
  // region around the cursor instead of the whole block bounding box to trigger
  // autoscrolling.
  var blockHeight = Blockly.getBoxHeight(blockBox);
  var viewportHeight = Blockly.getBoxHeight(viewportBox);
  if (blockHeight > viewportHeight * OVERSIZE_BLOCK_THRESHOLD) {
    // Center box around cursor with fallback radius
    blockBox.top = Math.max(blockBox.top, mouseBlockSpace.y - FALLBACK_DRAG_MARGIN);
    blockBox.bottom = Math.min(blockBox.bottom, mouseBlockSpace.y + FALLBACK_DRAG_MARGIN);
  }

  // Same rule, but horizontal
  var blockWidth = Blockly.getBoxWidth(blockBox);
  var viewportWidth = Blockly.getBoxWidth(viewportBox);
  if (blockWidth > viewportWidth * OVERSIZE_BLOCK_THRESHOLD) {
    // Center box around cursor with fallback radius
    blockBox.left = Math.max(blockBox.left, mouseBlockSpace.x - FALLBACK_DRAG_MARGIN);
    blockBox.right = Math.min(blockBox.right, mouseBlockSpace.x + FALLBACK_DRAG_MARGIN);
  }

  // Calculate how far out-of-bounds the dragged block/cursor is.
  var blockOverflows = Blockly.getBoxOverflow(viewportBox, blockBox);
  var mouseOverflows = Blockly.getPointBoxOverflow(viewportBox,
    new goog.math.Coordinate(mouseBlockSpace.x, mouseBlockSpace.y));

  if (Blockly.ScrollOnBlockDragHandler.DEBUG) {
    this.blockSpace_.drawDebugCircle("mouse circle",
      new goog.math.Coordinate(mouseBlockSpace.x, mouseBlockSpace.y),
      "orange");
    this.blockSpace_.drawDebugBox("block box" + block.id, blockBox, "purple");
    this.blockSpace_.drawDebugBox("block space box", viewportBox, "blue");
  }

  var overallScrollVector = new goog.math.Vec2(0, 0);

  SCROLLABLE_DIRECTIONS.forEach(function (direction) {
    var mouseOverflow = mouseOverflows[direction];
    var blockOverflow = blockOverflows[direction];
    var scrollVector = this.SCROLL_DIRECTION_VECTORS[direction];

    var candidateScrolls = [];

    if (Blockly.numberWithin(blockOverflow,
        BLOCK_START_DISTANCE, BLOCK_START_FAST_DISTANCE, false)) {
      candidateScrolls.push(scrollVector.clone().scale(BLOCK_SPEED_SLOW));
    }

    if (blockOverflow > BLOCK_START_FAST_DISTANCE) {
      candidateScrolls.push(scrollVector.clone().scale(BLOCK_SPEED_FAST));
    }

    if (Blockly.numberWithin(mouseOverflow,
        MOUSE_START_DISTANCE, MOUSE_START_FAST_DISTANCE, false)) {
      candidateScrolls.push(scrollVector.clone().scale(MOUSE_SPEED_SLOW));
    }

    if (mouseOverflow > MOUSE_START_FAST_DISTANCE) {
      candidateScrolls.push(scrollVector.clone().scale(MOUSE_SPEED_FAST));
    }

    var greatestScrollVector = candidateScrolls.reduce(
      function (fastestScroll, candidateScroll) {
        if (!fastestScroll) {
          return candidateScroll;
        }

        return fastestScroll.magnitude() > candidateScroll.magnitude() ?
          fastestScroll : candidateScroll;
      }, null
    );

    if (greatestScrollVector) {
      overallScrollVector =
        goog.math.Vec2.sum(overallScrollVector, greatestScrollVector);
    }
  }, this);

  if (overallScrollVector.equals(new goog.math.Vec2(0, 0))) {
    this.stopAutoScrolling();
    return;
  }

  this.activeAutoScroll_ = this.activeAutoScroll_ ||
    new Blockly.AutoScroll(this.blockSpace_, overallScrollVector);

  this.activeAutoScroll_.updateProperties(overallScrollVector, mouseClientX,
    mouseClientY);
};
