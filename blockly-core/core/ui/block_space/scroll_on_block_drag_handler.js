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
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.ScrollOnBlockDragHandler');
goog.require('Blockly.AutoScroll');

/**
 * @param {!Blockly.ScrollOnBlockDragHandler} blockSpace
 * @constructor
 */
Blockly.ScrollOnBlockDragHandler = function (blockSpace) {
  /**
   * BlockSpace to scroll
   * @type {Blockly.BlockSpace}
   * @private
   */
  this.blockSpace_ = blockSpace;
};

Blockly.ScrollOnBlockDragHandler.prototype.stopAutoScrolling = function () {
  if (this.activeAutoScroll_) {
    this.activeAutoScroll_.stopAndDestroy();
  }
  this.activeAutoScroll_ = null;
};

Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_SLOW = 0;
Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_SLOW = 200;
Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_FAST = 20;
Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_FAST = 900;

Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_SLOW = 0;
Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_SLOW = 70;
Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_FAST = 30;
Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_FAST = 200;

Blockly.ScrollOnBlockDragHandler.DEBUG = false;

/**
 * @typedef {Object} Blockly.AutoScrollRule
 * @property {ShouldScrollCallback} active - whether rule should be active
 * @property {number} speed - speed vector of scroll (currently dy)
 * @property {string} reason - text description of scroll reason
 */

/**
 * @callback ShouldScrollCallback
 * @param {goog.math.Box} blockOverhang
 * @param {goog.math.Box} mouseOverhang
 */

/**
 * @type {Blockly.AutoScrollRule[]}
 */
Blockly.ScrollOnBlockDragHandler.SCROLLING_RULES = [
  {
    active: function (blockOverhang, mouseOverhang) {
      return Blockly.numberWithin(mouseOverhang.top,
        Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_SLOW,
        Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_FAST, false);
    },
    speed: -Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_SLOW,
    reason: 'mouse slow top'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return mouseOverhang.top > Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_FAST;
    },
    speed: -Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_FAST,
    reason: 'mouse fast top'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return Blockly.numberWithin(mouseOverhang.bottom,
        Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_SLOW,
        Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_FAST, false);
    },
    speed: Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_SLOW,
    reason: 'mouse slow bottom'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return mouseOverhang.bottom > Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_START_FAST;
    },
    speed: Blockly.ScrollOnBlockDragHandler.MOUSE_SPEED_FAST,
    reason: 'mouse fast bottom'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return Blockly.numberWithin(blockOverhang.bottom, Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_SLOW,
        Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_FAST, false);
    },
    speed: Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_SLOW,
    reason: 'block just below bottom'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return blockOverhang.bottom > Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_FAST;
    },
    speed: Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_FAST,
    reason: 'block way below bottom'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return Blockly.numberWithin(blockOverhang.top, Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_SLOW,
        Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_FAST, false);
    },
    speed: -Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_SLOW,
    reason: 'block just above top'
  },
  {
    active: function (blockOverhang, mouseOverhang) {
      return blockOverhang.top > Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_START_FAST;
    },
    speed: -Blockly.ScrollOnBlockDragHandler.BLOCK_SPEED_FAST,
    reason: 'block way above top'
  }
];

/**
 * Pans the blockspace in the direction of a block if it's hanging off the
 * edge of the blockspace.
 * Will only expand the blockspace vertically if vertical scrollbars are enabled
 * Will only expand the blockspace horizontally if horizontal scrollbars are
 * enabled
 *   // http://ux.stackexchange.com/a/73902
 * @param {Blockly.Block} block
 * @param {number} mouseClientX
 * @param {number} mouseClientY
 */

Blockly.ScrollOnBlockDragHandler.prototype.panIfHangingOffEdge = function (block, mouseClientX, mouseClientY) {
  var viewportBox = this.blockSpace_.getViewportBox();
  var blockBox = block.getBox();
  var blockOverhang = Blockly.getBoxOverhang(viewportBox, blockBox);
  var mouseSvg = Blockly.mouseCoordinatesToSvg(
    mouseClientX, mouseClientY, this.blockSpace_.blockSpaceEditor.svg_);
  var mouseViewport = Blockly.svgCoordinatesToViewport(
    new goog.math.Coordinate(mouseSvg.x, mouseSvg.y), this.blockSpace_);
  var mouseBlockSpace = Blockly.viewportCoordinateToBlockSpace(
    mouseViewport, this.blockSpace_);

  var mouseOverhang = Blockly.getPointOverhangs(viewportBox,
    new goog.math.Coordinate(mouseBlockSpace.x, mouseBlockSpace.y));

  if (Blockly.ScrollOnBlockDragHandler.DEBUG) {
    this.blockSpace_.drawDebugCircle("mouse circle",
      new goog.math.Coordinate(mouseBlockSpace.x, mouseBlockSpace.y),
      "orange");
    this.blockSpace_.drawDebugBox("block box" + block.id, blockBox, "purple");
    this.blockSpace_.drawDebugBox("block space box", viewportBox, "blue");
  }

  var fastestActiveRule = Blockly.ScrollOnBlockDragHandler.SCROLLING_RULES
    .reduce(function (bestRule, newRule) {
      var ruleIsActive = newRule.active(blockOverhang, mouseOverhang);
      if (!ruleIsActive) {
        return bestRule;
      }

      if (bestRule) {
        var ruleIsFaster = Math.abs(newRule.speed) > Math.abs(bestRule.speed);
        return ruleIsActive && ruleIsFaster ? newRule : bestRule;
      }

      return newRule;
    }, null, this);

  if (!fastestActiveRule) {
    this.stopAutoScrolling();
    return;
  }

  this.activeAutoScroll_ = this.activeAutoScroll_ ||
    new Blockly.AutoScroll(this.blockSpace_, fastestActiveRule);

  this.activeAutoScroll_.updateScroll(fastestActiveRule, mouseClientX,
    mouseClientY);

  if (Blockly.ScrollOnBlockDragHandler.DEBUG) {
    console.log(fastestActiveRule.reason);
  }
};
