/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Object representing a block blockSpace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSpace');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Trashcan');
goog.require('Blockly.Xml');
goog.require('goog.math.Coordinate');


/**
 * Class for a BlockSpace.
 * @param {BlockSpaceEditor} blockSpaceEditor parent BlockSpaceEditor for this BlockSpace
 * @param {Function} getMetrics A function that returns size/scrolling metrics.
 * @param {Function} setMetrics A function that sets size/scrolling metrics.
 * @constructor
 */
Blockly.BlockSpace = function(blockSpaceEditor, getMetrics, setMetrics) {
  this.blockSpaceEditor = blockSpaceEditor;
  this.getMetrics = getMetrics;
  this.setMetrics = setMetrics;

  /** @type {boolean} */
  this.isFlyout = false;
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];

  /** @type {number} */
  this.maxBlocks = Infinity;

  /** @type {goog.events.EventTarget} */
  this.events = new goog.events.EventTarget();

  Blockly.ConnectionDB.init(this);
  if (Blockly.BlockSpace.DEBUG_EVENTS) {
    this.debugLogOnEvents();
  }
};

Blockly.BlockSpace.DEBUG_EVENTS = false;

Blockly.BlockSpace.EVENTS = {};

/**
 * Called after a blockspace has been populated with a set of blocks
 * (e.g. when using domToBlockSpace)
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.EVENT_BLOCKS_IMPORTED = 'blocksImported';

/**
 * Fired whenever blocklyBlockSpaceChange normally gets fired
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE = 'blockSpaceChange';

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.BlockSpace.SCAN_ANGLE = 3;

/**
 * Can this blockSpace be dragged around (true) or is it fixed (false)?
 * @type {boolean}
 */
Blockly.BlockSpace.prototype.dragMode = false;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.pageXOffset = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.pageYOffset = 0;

/**
 * The blockSpace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.BlockSpace.prototype.trashcan = null;

/**
 * PID of upcoming firing of a change event.  Used to fire only one event
 * after multiple changes.
 * @type {?number}
 * @private
 */
Blockly.BlockSpace.prototype.fireChangeEventPid_ = null;

/**
 * This blockSpace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.BlockSpace.prototype.scrollbar = null;

/**
 * Sets up debug console logging for events
 */
Blockly.BlockSpace.prototype.debugLogOnEvents = function() {
  goog.object.forEach(Blockly.BlockSpace.EVENTS, function(eventIdentifier, eventConstant) {
    this.events.listen(eventIdentifier, function(eventObject) {
      console.log(eventObject);
      console.log(eventConstant);
      console.log(eventIdentifier);
    }, false, this);
  }, this);
};

Blockly.BlockSpace.prototype.findFunction = function(functionName) {
  return goog.array.find(this.getTopBlocks(), function(block) {
    return goog.array.contains(Blockly.Procedures.DEFINITION_BLOCK_TYPES, block.type) &&
      Blockly.Names.equals(functionName, block.getTitleValue('NAME'))
  });
};

Blockly.BlockSpace.prototype.findFunctionExamples = function(functionName) {
  return goog.array.filter(this.getTopBlocks(), function(block) {
    if (Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE === block.type) {
      var actualBlock = block.getInputTargetBlock(Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
      return actualBlock &&
        Blockly.Names.equals(functionName, actualBlock.getTitleValue('NAME'));
    }
    return false;
  });
};

/**
 * Create the trash can elements.
 * @return {!Element} The blockSpace's SVG group.
 */
Blockly.BlockSpace.prototype.createDom = function() {
  /*
  <g>
    [Trashcan may go here]
    <g></g>
    <g></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  this.fireChangeEvent();
  return this.svgGroup_;
};

/**
 * Moves element currently in this BlockSpace to the front of the canvas
 * @param {Element} blockSVGElement svg element to move to the front
 */
Blockly.BlockSpace.prototype.moveElementToFront = function(blockSVGElement) {
  this.getCanvas().appendChild(blockSVGElement);
};

/**
 * Dispose of this blockSpace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.BlockSpace.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBlockCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
};

/**
 * Add a trashcan.
 */
Blockly.BlockSpace.prototype.addTrashcan = function() {
  if (Blockly.hasTrashcan && !Blockly.readOnly) {
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.svgBlockCanvas_.appendChild(svgTrashcan);
    this.trashcan.init();
  }
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.BlockSpace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.BlockSpace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
  this.fireChangeEvent();
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.BlockSpace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, x = 0; child = this.topBlocks_[x]; x++) {
    if (child == block) {
      this.topBlocks_.splice(x, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    throw 'Block not present this blockSpace\'s list of top-most blocks.';
  }
  this.fireChangeEvent();
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.BlockSpace.prototype.getTopBlocks = function(ordered) {
  var blocks = [];
  if (this === Blockly.mainBlockSpace || this === Blockly.modalBlockSpace) {
    // Main + modal blockspaces share top blocks
    blocks = blocks.concat(Blockly.mainBlockSpace.topBlocks_)
      .concat(Blockly.modalBlockSpace ? Blockly.modalBlockSpace.topBlocks_ : []);
  } else {
    // Copy the topBlocks_ list.
    blocks = blocks.concat(this.topBlocks_);
  }
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(Blockly.BlockSpace.SCAN_ANGLE / 180 * Math.PI);
    if (Blockly.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Find all visible blocks in this blockSpace.  No particular order.
 * Filters out blocks rendering in other workspaces and currently invisible
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllVisibleBlocks = function() {
  return goog.array.filter(this.getAllBlocks(), function(block) {
    return block.isUserVisible();
  });
};

/**
 * Find all blocks in this blockSpace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var x = 0; x < blocks.length; x++) {
    blocks = blocks.concat(blocks[x].getChildren());
  }
  return blocks;
};

/**
 * Find all blocks this blockSpace.  No particular order.
 * @return {Number} Count of blocks.
 */
Blockly.BlockSpace.prototype.getBlockCount = function() {
  return this.getAllVisibleBlocks().length;
};

/**
 * Dispose of all blocks this blockSpace.
 */
Blockly.BlockSpace.prototype.clear = function() {
  this.blockSpaceEditor.hideChaff();
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
};

/**
 * Render all blocks this blockSpace.
 */
Blockly.BlockSpace.prototype.render = function() {
  var renderList = this.getAllBlocks();
  for (var x = 0, block; block = renderList[x]; x++) {
    if (!block.getChildren().length) {
      block.render();
    }
  }
};

/**
 * Finds the block with the specified ID in this blockSpace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.BlockSpace.prototype.getBlockById = function(id) {
  // If this O(n) function fails to scale well, maintain a hash table of IDs.
  var blocks = this.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    if (block.id == id) {
      return block;
    }
  }
  return null;
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.BlockSpace.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if (this.traceWrapper_) {
    Blockly.unbindEvent_(this.traceWrapper_);
    this.traceWrapper_ = null;
  }
  if (armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
        'blocklySelectChange', this, function() {this.traceOn_ = false});
  }
};

/**
 * Highlight a block in the blockSpace.
 * @param {?string} id ID of block to find.
 */
Blockly.BlockSpace.prototype.highlightBlock = function(id, spotlight) {
  if (!this.traceOn_ || Blockly.Block.isDragging()) {
    return;
  }
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      return;
    }
  }
  // Temporary turn off the listener for selection changes, so that we don't
  // trip the monitor for detecting user activity.
  this.traceOn(false);
  // Select the current block.
  if (block) {
    block.select(spotlight);
  } else if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  // Restore the monitor for user activity.
  this.traceOn(true);
};

/**
 * Fire a change event for this blockSpace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook blockSpace changes by listening for
 * 'blocklyBlockSpaceChange' on Blockly.mainBlockSpace.getCanvas().
 */
Blockly.BlockSpace.prototype.fireChangeEvent = function() {
  if (this.fireChangeEventPid_) {
    window.clearTimeout(this.fireChangeEventPid_);
  }
  var canvas = this.svgBlockCanvas_;
  if (canvas) {
    var self = this;
    this.fireChangeEventPid_ = window.setTimeout(function() {
        self.events.dispatchEvent(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE);
        Blockly.fireUiEvent(canvas, 'blocklyBlockSpaceChange');
    }, 0);
  }
};

/**
 * Paste the provided block onto the blockSpace.
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.BlockSpace.prototype.paste = function(clipboard) {
  var xmlBlock = clipboard.dom;
  // When pasting into a different block spaces, remove parameter blocks
  if (this !== clipboard.sourceBlockSpace) {
    if (xmlBlock.getAttribute('type') === 'parameters_get') {
      return;
    }
    goog.array.forEach(xmlBlock.getElementsByTagName('block'), function(block) {
      if (block.getAttribute('type') === 'parameters_get') {
        goog.dom.removeNode(block);
      }
    });
  }
  if (xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  var block = Blockly.Xml.domToBlock_(this, xmlBlock);
  // Move the duplicate to original position.
  var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
  var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
  if (!isNaN(blockX) && !isNaN(blockY)) {
    if (Blockly.RTL) {
      blockX = -blockX;
    }
    // Offset block until not clobbering another block.
    do {
      var collide = false;
      var allBlocks = this.getAllBlocks();
      for (var x = 0, otherBlock; otherBlock = allBlocks[x]; x++) {
        var otherXY = otherBlock.getRelativeToSurfaceXY();
        if (Math.abs(blockX - otherXY.x) <= 1 &&
            Math.abs(blockY - otherXY.y) <= 1) {
          if (Blockly.RTL) {
            blockX -= Blockly.SNAP_RADIUS;
          } else {
            blockX += Blockly.SNAP_RADIUS;
          }
          blockY += Blockly.SNAP_RADIUS * 2;
          collide = true;
        }
      }
    } while (collide);
    block.moveBy(blockX, blockY);
  }
  block.setUserVisible(true);
  block.select();
};

/**
 * The number of blocks that may be added to the blockSpace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.BlockSpace.prototype.remainingCapacity = function() {
  if (this.maxBlocks == Infinity) {
    return Infinity;
  }
  return this.maxBlocks - this.getAllBlocks().length;
};

/**
* Make a list of all the delete areas for this blockSpace.
*/
Blockly.BlockSpace.prototype.recordDeleteAreas = function() {
  if (this.trashcan) {
    this.deleteAreaTrash_ = this.trashcan.getRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getRect();
  } else if (this.toolbox_) {
    this.deleteAreaToolbox_ = this.toolbox_.getRect();
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
* Is the mouse event over a delete area (toolbar or non-closing flyout)?
* Opens or closes the trashcan and sets the cursor as a side effect.
* @param {!Event} e Mouse move event.
* @return {boolean} True if event is in a delete area.
*/
Blockly.BlockSpace.prototype.isDeleteArea = function(e) {
  var isDelete = false;
  var mouseXY = Blockly.mouseToSvg(e);
  var xy = new goog.math.Coordinate(mouseXY.x, mouseXY.y);
  if (this.deleteAreaTrash_) {
    if (this.deleteAreaTrash_.contains(xy)) {
      this.trashcan.setOpen_(true);
      this.blockSpaceEditor.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
    this.trashcan.setOpen_(false);
  }
  if (this.deleteAreaToolbox_) {
    if (this.deleteAreaToolbox_.contains(xy)) {
      this.blockSpaceEditor.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
  }
  this.blockSpaceEditor.setCursor(Blockly.Css.Cursor.CLOSED);
  return false;
};
