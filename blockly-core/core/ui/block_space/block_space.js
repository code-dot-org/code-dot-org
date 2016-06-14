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

/* global Blockly, goog */

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
goog.require('Blockly.PanDragHandler');
goog.require('Blockly.ScrollOnWheelHandler');
goog.require('Blockly.ScrollOnBlockDragHandler');
goog.require('Blockly.Xml');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math');

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
  this.setMetrics = function (ratio) {
    setMetrics(ratio);
    Blockly.fireUiEvent(window, 'block_space_metrics_set');
  };

  /** @type {boolean} */
  this.isFlyout = false;
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];

  /**
   * @type {!Array.<!goog.math.Rect>}
   * @private
   */
  this.deleteAreas_ = [];

  /**
   * The original position of the currently being dragged block.
   * Used to avoid changing scroll size until block is dropped.
   * @private {goog.math.Rect}
   */
  this.pickedUpBlockOrigin_ = null;

  /** @type {number} */
  this.maxBlocks = Infinity;

  /** @type {goog.events.EventTarget} */
  this.events = new goog.events.EventTarget();

  /**
   * Encapsulates state used to make pan-drag work.
   * @private {Blockly.PanDragHandler}
   */
  this.panDragHandler_ = new Blockly.PanDragHandler(this);

  /**
   * Encapsulates state used to make scroll-on-mousewheel work.
   * @private {Blockly.ScrollOnWheelHandler}
   */
  this.scrollOnWheelHandler_ = new Blockly.ScrollOnWheelHandler(this);

  /**
   * Encapsulates state used to make scroll-on-block-drag work.
   * @type {Blockly.ScrollOnBlockDragHandler}
   * @private
   */
  this.scrollOnBlockDragHandler_ = new Blockly.ScrollOnBlockDragHandler(this);

  Blockly.ConnectionDB.init(this);
  if (Blockly.BlockSpace.DEBUG_EVENTS) {
    this.debugLogOnEvents();
  }

  this.events.listen(Blockly.BlockSpace.EVENTS.EVENT_BLOCKS_IMPORTED,
      this.updateScrollableSize.bind(this));
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
 * Fired by Code Studio when the run button is clicked.
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED = "runButtonClicked";

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.BlockSpace.SCAN_ANGLE = 3;

/**
 * Offset (in pixels) from top to use when automatically positioning new
 * blocks. Currently is only used by Blockly.Xml.domToBlockSpace
 * @type {number}
 */
Blockly.BlockSpace.AUTO_LAYOUT_PADDING_TOP = 16;

/**
 * Offset (in pixels) from left to use when automatically positioning
 * new blocks. Currently is only used by Blockly.Xml.domToBlockSpace
 * @type {number}
 */
Blockly.BlockSpace.AUTO_LAYOUT_PADDING_LEFT = 16;

/**
 * Margin (in pixels) to over-scroll when auto-panning viewport after a block
 * is dragged out of view.
 * @type {number}
 */
Blockly.BlockSpace.DROPPED_BLOCK_PAN_MARGIN = 25;

/**
 * Pixel padding to maintain below the lowest block in the blockspace.
 * @type {number}
 * @const
 */
Blockly.BlockSpace.SCROLLABLE_MARGIN_BELOW_BOTTOM = 100;

/**
 * Creates a read-only BlockSpace inside the given container, containing
 * the given XML. Used to display single blocks in feedback dialogs.
 * @param {!Element} container HTML Element into which to render
 * @param {!Element} xml XML block
 * @returns {Blockly.BlockSpace}
 */
Blockly.BlockSpace.createReadOnlyBlockSpace = function (container, xml) {
  var blockSpaceEditor = new Blockly.BlockSpaceEditor(container, function () {
    var metrics = Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_.call(this);
    if (!metrics) {
      return null;
    }
    // Expand the view so we don't see scrollbars
    metrics.viewHeight += Blockly.BlockSpace.SCROLLABLE_MARGIN_BELOW_BOTTOM;
    return metrics;
  }, function (xyRatio) {
    Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetrics_.call(this, xyRatio);
  }, true, true);

  var blockSpace = blockSpaceEditor.blockSpace;
  Blockly.Xml.domToBlockSpace(blockSpace, xml);
  return blockSpace;
};

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.xOffsetFromView = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.yOffsetFromView = 0;

/**
 * The blockSpace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.BlockSpace.prototype.trashcan = null;

/**
 * PID of upcoming firing of a blockSpace change event.  Used to fire only one
 * event after multiple changes.
 * @type {?number}
 * @private
 */
Blockly.BlockSpace.prototype.fireChangeEventPid_ = null;

/**
 * PID of upcoming firing of a global change event.  Used to fire only one event
 * after multiple changes.
 * @type {?number}
 * @private
 */
var fireGlobalChangeEventPid_ = null;

/**
 * This blockSpace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.BlockSpace.prototype.scrollbarPair = null;

/**
 * @returns {boolean}
 */
Blockly.BlockSpace.prototype.isReadOnly = function() {
  return (Blockly.readOnly || this.blockSpaceEditor.isReadOnly());
};

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
      Blockly.Names.equals(functionName, block.getTitleValue('NAME'));
  });
};

/**
 * @param {string} [functionName] If provided, only return examples for the
 *   given function.
 */
Blockly.BlockSpace.prototype.findFunctionExamples = function(functionName) {
  return goog.array.filter(this.getTopBlocks(), function(block) {
    if (Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE === block.type) {
      var actualBlock = block.getInputTargetBlock(Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
      return actualBlock && (!functionName ||
        Blockly.Names.equals(functionName, actualBlock.getTitleValue('NAME')));
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
  this.svgGroup_ = Blockly.createSvgElement('g', {'class': 'svgGroup'}, null);
  this.clippingGroup_ = Blockly.createSvgElement('g', {'class': 'svgClippingGroup'}, this.svgGroup_);
  this.svgBlockCanvas_ = Blockly.createSvgElement('g', {'class': 'svgBlockCanvas'}, this.clippingGroup_);
  this.svgDragCanvas_ = Blockly.createSvgElement('g', {'class': 'svgDragCanvas'}, this.svgGroup_);
  this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {'class': 'svgBubbleCanvas'}, this.svgGroup_);
  this.svgDebugCanvas_ = Blockly.createSvgElement('g', {'class': 'svgDebugCanvas'}, this.svgGroup_);
  this.fireChangeEvent();
  return this.svgGroup_;
};

/**
 * Moves element currently in this BlockSpace to the drag canvas group
 * @param {Element} blockSVGElement svg element to move to the drag group
 */
Blockly.BlockSpace.prototype.moveElementToDragCanvas = function(blockSVGElement) {
  this.getDragCanvas().appendChild(blockSVGElement);
};

/**
 * Moves element currently in this BlockSpace drag canvas back to the main canvas
 * @param {Element} blockSVGElement svg element to move to the main canvas
 */
Blockly.BlockSpace.prototype.moveElementToMainCanvas = function(blockSVGElement) {
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
  this.svgDragCanvas_ = null;
  this.svgDebugCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
  if (this.scrollbarPair) {
    this.scrollbarPair.dispose();
    this.scrollbarPair = null;
  }
};

/**
 * Add a trashcan.
 */
Blockly.BlockSpace.prototype.addTrashcan = function() {
  if (Blockly.hasTrashcan && !this.isReadOnly()) {
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.svgBlockCanvas_.appendChild(svgTrashcan);
    this.trashcan.init();
  }
};

Blockly.BlockSpace.prototype.setTrashcan = function(trashcan) {
  this.trashcan = trashcan;
};

/**
 * Get the SVG element that wraps groups that should clip at the
 * blockspace view bounds.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getClippingGroup = function() {
  return this.clippingGroup_;
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the drawing surface for dragged elements
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getDragCanvas = function () {
  return this.svgDragCanvas_;
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
 * Checks to see if the given block is in the list of top blocks
 * @param {!Blockly.Block} block
 * @return {boolean}
 */
Blockly.BlockSpace.prototype.isTopBlock = function (block) {
  return this.topBlocks_.indexOf(block) > -1;
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.BlockSpace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, x = 0; x < this.topBlocks_.length; x++) {
    child = this.topBlocks_[x];
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
 * @param {boolean} [ordered=false] Sort the list if true.
 * @param {boolean} [shareMainModal=true] Collate main/modal blockSpaces.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.BlockSpace.prototype.getTopBlocks = function(ordered, shareMainModal) {
  if (ordered === undefined ) {
    ordered = false;
  }
  if (shareMainModal === undefined ) {
    shareMainModal = true;
  }

  var blocks = [];
  if (shareMainModal && (this === Blockly.mainBlockSpace ||
      this === Blockly.modalBlockSpace)) {
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
 * Find all used blocks in this blockSpace.  No particular order.
 * Filters out "unused" (unattached) blocks
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllUsedBlocks = function() {
  return goog.array.filter(this.getAllBlocks(), function(block) {
    return !block.getRootBlock().isUnused();
  });
};

/**
 * Finds the top-level attached blocks
 * @see BlockSpace.prototype.getTopBlocks
 * @return {!Array.<!Blockly.Block>} The top-level attached block objects.
 */
Blockly.BlockSpace.prototype.getTopUsedBlocks = function() {
  return goog.array.filter(this.getTopBlocks(), function(block) {
    return !block.isUnused();
  });
};

/**
 * Find all blocks in this blockSpace.  No particular order.
 * @param {object} options
 * @param {boolean?} [options.shareMainModal]
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllBlocks = function(options) {
  options = options || {};
  var blocks = this.getTopBlocks(false, options.shareMainModal);
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
  for (var x = 0, block; x < renderList.length; x++) {
    block = renderList[x];
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
  for (var x = 0, block; x < blocks.length; x++) {
    block = blocks[x];
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
        'blocklySelectChange', this, function () {
          this.traceOn_ = false;
        });
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
 * 'blocklyBlockSpaceChange' on Blockly.mainBlockSpace.getCanvas().  To hook
 * changes across all blockSpaces, listen for 'workspaceChange' on window.
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

  if (fireGlobalChangeEventPid_) {
    window.clearTimeout(fireGlobalChangeEventPid_);
  }
  fireGlobalChangeEventPid_ = window.setTimeout(function () {
    Blockly.fireUiEvent(window, 'workspaceChange');
  }, 0);
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
  if (this.blockSpaceEditor.blockLimits.hasBlockLimits()) {
    var types = goog.array.map(xmlBlock.getElementsByTagName('block'), function(block) {
      return block.getAttribute('type');
    });
    types.push(xmlBlock.getAttribute('type'));

    if (!this.blockSpaceEditor.blockLimits.canAddBlocks(types)) {
      return;
    }
  }
  var block = Blockly.Xml.domToBlock(this, xmlBlock);
  // Move the duplicate to original position.
  var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
  var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
  if (!isNaN(blockX) && !isNaN(blockY)) {
    if (Blockly.RTL) {
      blockX = -blockX;
    }
    // Offset block until not clobbering another block.
    var collide;
    do {
      collide = false;
      var allBlocks = this.getAllBlocks();
      for (var x = 0, otherBlock; x < allBlocks.length; x++) {
        otherBlock = allBlocks[x];
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
 * Records the bounding box of the currently dragged block to avoid changing
 * scrolling size until drop.
 */
Blockly.BlockSpace.prototype.recordPickedUpBlockOrigin = function() {
  var canvasBBox = this.blockSpaceEditor.getCanvasBBox(this.getDragCanvas());
  this.pickedUpBlockOrigin_ = Blockly.svgRectToRect(canvasBBox);
};

Blockly.BlockSpace.prototype.clearPickedUpBlockOrigin = function() {
  this.pickedUpBlockOrigin_ = null;
};

/**
* Make a list of all the delete areas for this blockSpace.
*/
Blockly.BlockSpace.prototype.recordDeleteAreas = function() {
  this.deleteAreas_ = [];

  if (this.trashcan) {
    goog.array.extend(this.deleteAreas_, this.trashcan.getRect());
    this.deleteAreaTrash_ = this.trashcan.getRect();
  } else {
    this.deleteAreaTrash_ = null;
  }

  if (this.flyout_) {
    goog.array.extend(this.deleteAreas_, this.flyout_.getRect());
  }

  if (this.blockSpaceEditor) {
    goog.array.extend(this.deleteAreas_,
        this.blockSpaceEditor.getDeleteAreas());
  }
};

/**
* Is the mouse event over a delete area?
* Shows the trash zone as a side effect.
* @param {number} mouseX mouse clientX
* @param {number} mouseY mouse clientY
* @param {number} startDragX The x coordinate of the drag start.
* @return {boolean} True if event is in a delete area.
*/
Blockly.BlockSpace.prototype.isDeleteArea = function(mouseX, mouseY, startDragX) {
  // If there is no toolbox and no flyout then there is no trash area.
  if (!Blockly.languageTree) {
    return false;
  }

  var mouseXY = Blockly.mouseCoordinatesToSvg(
    mouseX, mouseY, this.blockSpaceEditor.svg_);
  var xy = new goog.math.Coordinate(mouseXY.x, mouseXY.y);

  var mouseDragStartXY = Blockly.mouseCoordinatesToSvg(
    startDragX, 0, this.blockSpaceEditor.svg_);
  var dragStartXY = new goog.math.Coordinate(
    mouseDragStartXY.x, mouseDragStartXY.x);

  // Update trash can visual state
  // Might be nice to do this side-effect elsewhere.
  if (this.deleteAreaTrash_) {
    if (this.deleteAreaTrash_.contains(xy)) {
      this.trashcan.setOpen_(true);
    } else {
      this.trashcan.setOpen_(false);
    }
  }

  this.drawTrashZone(xy.x, dragStartXY.x);

  // Check against all delete areas
  for (var i = 0, area; i < this.deleteAreas_.length; i++) {
    area = this.deleteAreas_[i];
    if (area.contains(xy)) {
      return true;
    }
  }

  this.blockSpaceEditor.setCursor(Blockly.Css.Cursor.CLOSED);

  return false;
};

/**
* Called when a drag event ends, to hide any delete UI.
*/
Blockly.BlockSpace.prototype.hideDelete = function() {
  var veryDistantX = Blockly.RTL ? -10000 : 10000;
  this.drawTrashZone(veryDistantX, 0);
};

/**
* Draws the trash zone over the toolbox/flyout, as the user drags an
* item towards it.
* @param {!Event} e Mouse move event.
* @param {integer} startDragX The x coordinate of the drag start.
* @return {boolean} True if event is in a delete area.
*/
Blockly.BlockSpace.prototype.drawTrashZone = function(x, startDragX) {
  var background;
  var blockGroup;
  var trashcan;
  var trashcanElement;
  var blockGroupForeground = null;

  // When in the function editor, we will rely on the grey rectangle and
  // trashcan image provided by the main blockspace underneath.
  var blockSpaceEditor = this.blockSpaceEditor.hideTrashRect_ ?
    Blockly.mainBlockSpaceEditor : this.blockSpaceEditor;

  if (this.blockSpaceEditor.toolbox) {
    var toolbox = blockSpaceEditor.toolbox;
    background = blockSpaceEditor.svgBackground_;
    blockGroup = toolbox.tree_.element_;
    trashcan = toolbox.trashcan;
    trashcanElement = toolbox.trashcanHolder;

    // When in the function editor there is a second copy of the
    // toolbox category names shown simultaneously.  It's in the foreground
    // and owned by the function editor's blockspace.  We'll fade that one too.
    if (this.blockSpaceEditor.hideTrashRect_) {
      blockGroupForeground = this.blockSpaceEditor.toolbox.tree_.element_;
    }
  } else {
    var flyout = blockSpaceEditor.flyout_;
    background = flyout.svgBackground_;
    blockGroup = flyout.blockSpace_.svgGroup_;
    trashcan = flyout.trashcan;
    trashcanElement = trashcan.svgGroup_;

    if (this.blockSpaceEditor.hideTrashRect_) {
      blockGroupForeground = this.blockSpaceEditor.flyout_.svgGroup_;
    }
  }

  var toolbarWidth = background.getBoundingClientRect().width;

  // The user can drag towards the trash zone a little bit before the zone
  // starts fading in.
  var dragBuffer = 10;

  // Has the user dragged the block a certain amount towards the trash zone?
  var pastThreshold = false;

  var xDifference;
  var trashZoneWidth;

  if (Blockly.RTL) {
    pastThreshold = x > startDragX + dragBuffer;
    var editorWidth = blockSpaceEditor.svg_.getBoundingClientRect().width;
    var canvasAreaWidth = editorWidth - toolbarWidth;
    xDifference = canvasAreaWidth - x;
    trashZoneWidth = canvasAreaWidth - startDragX - dragBuffer;
  } else {
    pastThreshold = x < startDragX - dragBuffer;
    xDifference = x - toolbarWidth;
    trashZoneWidth = startDragX - toolbarWidth - dragBuffer;
  }

  var normalIntensity = 1;

  // When dragging within this distance, we directly fade in the trash can.
  // When dragging from beyond this distance, we fade a little until we reach
  // this distance, and then we fade in the rest of the way from there.
  var INNER_TRASH_DISTANCE = 100;

  // The intensity when at the INNER_TRASH_DISTANCE during a long drag.
  var INNER_TRASH_NORMAL_INTENSITY = 0.8;
  var INNER_TRASH_TRASHCAN_INTENSITY = 1 - INNER_TRASH_NORMAL_INTENSITY;

  if (pastThreshold) {
    if (xDifference <= 0) {
      normalIntensity = 0;
      trashcan.setOpen_(true);
    } else {
      trashcan.setOpen_(false);
      if (xDifference >= trashZoneWidth) {
        normalIntensity = 1;
      } else if (trashZoneWidth < INNER_TRASH_DISTANCE) {
        // Short drag, just do a regular scale.
        normalIntensity = xDifference / trashZoneWidth;
      } else {
        // Long drag...
        if (xDifference < INNER_TRASH_DISTANCE)
        {
          // Last part of the drag:
          // fade normal blocks from mostly-visible to invisible.
          normalIntensity = xDifference / INNER_TRASH_DISTANCE *
            INNER_TRASH_NORMAL_INTENSITY;
        }
        else
        {
          // Initial part of the drag:
          // fade normal blocks from fully-visible to mostly-visible.
          normalIntensity = INNER_TRASH_NORMAL_INTENSITY +
            (xDifference - INNER_TRASH_DISTANCE) /
            (trashZoneWidth - INNER_TRASH_DISTANCE) *
            INNER_TRASH_TRASHCAN_INTENSITY;
        }
      }
    }
  }

  var trashIntensity = 1 - normalIntensity;

  var REGULAR_GREY = 0xdd;
  var TRASH_GREY = 0xaa;

  var r = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var g = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var b = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var rgbString = "rgb(" + r + ", " + g + ", " + b + ")";

  // Fade towards the new backround color.
  background.style.fill = rgbString;

  // Fade out the blocks in the flyout area.
  blockGroup.style.opacity = normalIntensity;

  if (blockGroupForeground) {
    blockGroupForeground.style.opacity = normalIntensity;
  }

  // Fade in the trash can.
  var trashcanDisplay = trashIntensity === 0 ? "none" : "block";
  trashcanElement.style.opacity = trashIntensity;
  trashcanElement.style.display = trashcanDisplay;
};

/**
 * Gives the logical size of the blockly workspace, currently defined as the
 * distance from the block-space origin to the far edge of the farthest block
 * in each scrollable direction (the workspace expands down and/or right to
 * accommodate content), never to be smaller than the blockspace viewport size.
 *
 * Gets used in calculations for scrolling and block bumping.
 *
 * @param {Object} metrics object with information about view and content
 *        dimensions, e.g. output of
 *        Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_
 * @param {number} metrics.contentLeft - distance from x=0 to left edge of
 *        bounding box around all blocks in the blockspace.
 * @param {number} metrics.contentWidth - width of the bounding box around all
 *        blocks in the blockspace.
 * @param {number} metrics.viewWidth - amount of horizontal blockspace that can
 *        be displayed at once.
 * @param {number} metrics.contentTop - distance from y=0 to top edge of bounding
 *        box around all blocks in the blockspace.
 * @param {number} metrics.contentHeight - height of the bounding box around all
 *        blocks in the blockspace.
 * @param {number} metrics.viewHeight - amount of vertical blockspace that can be
 *        displayed at once.
 * @returns {{width: number, height: number}}
 */
Blockly.BlockSpace.prototype.getScrollableSize = function(metrics) {
  var scrollbarPair = this.scrollbarPair;
  var canScrollHorizontally = scrollbarPair && scrollbarPair.canScrollHorizontally();
  var canScrollVertically = scrollbarPair && scrollbarPair.canScrollVertically();

  var extraVerticalSpace = this.isFlyout ? 0 :
      Blockly.BlockSpace.SCROLLABLE_MARGIN_BELOW_BOTTOM;

  return {
    width: canScrollHorizontally ?
        Math.max(metrics.contentLeft + metrics.contentWidth, metrics.viewWidth) :
        metrics.viewWidth,
    height: canScrollVertically ?
        Math.max(metrics.contentTop + metrics.contentHeight + extraVerticalSpace,
            metrics.viewHeight) : metrics.viewHeight
  };
};

/**
 * Returns a box representing the size of the underlying editable canvas
 * @returns {goog.math.Box}
 */
Blockly.BlockSpace.prototype.getScrollableBox = function() {
  var scrollableSize = this.getScrollableSize(this.getMetrics());
  return new goog.math.Box(0, scrollableSize.width, scrollableSize.height, 0);
};

/**
 * Returns a box representing the position of the viewport in the coordinate
 * space of the underlying canvas.
 * @returns {goog.math.Box}
 */
Blockly.BlockSpace.prototype.getViewportBox = function() {
  var metrics = this.getMetrics();
  return new goog.math.Box(
    this.getScrollOffsetY(),
    this.getScrollOffsetX() + metrics.viewWidth,
    this.getScrollOffsetY() + metrics.viewHeight,
    this.getScrollOffsetX());
};

Blockly.BlockSpace.prototype.panIfOverEdge = function (block, mouseX, mouseY) {
  this.scrollOnBlockDragHandler_.panIfOverEdge(block, mouseX, mouseY);
};

Blockly.BlockSpace.prototype.stopAutoScrolling = function () {
  this.scrollOnBlockDragHandler_.stopAutoScrolling();
};

/**
 * Given a block, scrolls the viewport to contain the block (plus a small
 * margin).
 * @param {Blockly.Block} block
 */
Blockly.BlockSpace.prototype.scrollIntoView = function (block) {
  var blockBox = block.getBox();
  var currentView = this.getViewportBox();

  var boxOverflows = Blockly.getBoxOverflow(currentView, blockBox);
  Blockly.addToNonZeroSides(boxOverflows,
    Blockly.BlockSpace.DROPPED_BLOCK_PAN_MARGIN);

  var isOversizedX = Blockly.isBoxWiderThan(blockBox, currentView);
  var isOversizedY = Blockly.isBoxTallerThan(blockBox, currentView);
  var isAlreadyInView = (isOversizedX || isOversizedY) ?
      goog.math.Box.intersects(blockBox, currentView) : false;

  // If block is bigger than viewport, only scroll if it's not in view at all.
  var horizontalDelta = (isOversizedX && isAlreadyInView) ?
      0 : boxOverflows.right - boxOverflows.left;
  var verticalDelta = (isOversizedY && isAlreadyInView) ?
      0 : boxOverflows.bottom - boxOverflows.top;
  this.scrollToDelta(horizontalDelta, verticalDelta);
};

/**
 * Relative version of {@link Blockly.BlockSpace#scrollWithAnySelectedBlock}
 * @param {number} scrollDx delta amount to pan-right (+)
 * @param {number} scrollDy delta amount to pan-down (+)
 * @param {number} mouseX clientX position of mouse
 * @param {number} mouseY clientY position of mouse
 */
Blockly.BlockSpace.prototype.scrollDeltaWithAnySelectedBlock = function (scrollDx, scrollDy,
  mouseX, mouseY) {
  this.scrollWithAnySelectedBlock(
    this.getScrollOffsetX() + scrollDx,
    this.getScrollOffsetY() + scrollDy,
    mouseX,
    mouseY);
};


/**
 * Given desired new scrollX and scrollY positions, scroll to position,
 * clamping to within allowable scroll boundaries.
 *
 * If a block is selected, this will also move it to stay under the current
 * mouse position after scroll (otherwise it would appear to scroll with the
 * entire blockspace).
 * @param {number} newScrollX new target pan-right (+) offset
 * @param {number} newScrollY new target pan-down (+) offset
 * @param {number} mouseX current mouse clientX position (used for
 *        currently-dragged block movement syncing)
 * @param {number} mouseY current mouse clientY position
 */
Blockly.BlockSpace.prototype.scrollWithAnySelectedBlock = function (newScrollX,
                                                                    newScrollY,
                                                                    mouseX,
                                                                    mouseY) {
  /** @type {goog.math.Vec2} */
  var offsetBefore = this.getScrollOffset();

  this.scrollTo(newScrollX, newScrollY);

  /**
   * If dragging a block too, move the "mouse start position" as if it
   * had scrolled along with any blockspace scrolling, and add the scroll event
   * delta to the block's movement.
   */
  if (Blockly.Block.isFreelyDragging() && Blockly.selected) {
    var scrolledAmount = this.getScrollOffset().subtract(offsetBefore);
    Blockly.selected.startDragMouseX -= scrolledAmount.x;
    Blockly.selected.startDragMouseY -= scrolledAmount.y;
    // Moves block to stay under cursor's clientX/clientY
    Blockly.selected.moveBlockBeingDragged_(mouseX, mouseY);
  }
};

/**
 * Scrolls to given delta coordinates
 * @param {number} scrollDx pixels to pan-right (+)
 * @param {number} scrollDy pixels to pan-down (+)
 */
Blockly.BlockSpace.prototype.scrollToDelta = function (scrollDx, scrollDy) {
  this.scrollTo(this.getScrollOffsetX() + scrollDx,
    this.getScrollOffsetY() + scrollDy);
};

/**
 * If possible, scrolls scrollbars to given offset coordinates.
 * Clamps desired values between zero and max scroll values.
 * @param {number} newScrollX new pan-right (+) offset
 * @param {number} newScrollY new pan-down (+) offset
 */
Blockly.BlockSpace.prototype.scrollTo = function (newScrollX, newScrollY) {
  if (!this.scrollbarPair) {
    return;
  }

  var maxScrollOffsets = this.getMaxScrollOffsets();

  newScrollX = goog.math.clamp(newScrollX, 0, maxScrollOffsets.x);
  newScrollY = goog.math.clamp(newScrollY, 0, maxScrollOffsets.y);

  // Set the scrollbar position, which will auto-scroll the canvas
  this.scrollbarPair.set(newScrollX, newScrollY);
};

/**
 * Returns whether there any scrolling is currently possible on the BlockSpace
 * (i.e., scrollbars should be visible, panning/dragging should have an effect).
 * @returns {boolean} true if the BlockSpace can currently be scrolled.
 */
Blockly.BlockSpace.prototype.currentlyScrollable = function() {
  var maxOffsets = this.getMaxScrollOffsets();
  return maxOffsets.x > 0 || maxOffsets.y > 0;
};

/**
 * Returns the maximum possible scrolling offsets (+x right, +y down) for
 * this blockspace.
 * @returns {{x: number, y: number}}
 */
Blockly.BlockSpace.prototype.getMaxScrollOffsets = function() {
  var metrics = this.getMetrics();
  var blockSpaceSize = this.getScrollableSize(metrics);
  return {
    x: blockSpaceSize.width - metrics.viewWidth,
    y: blockSpaceSize.height - metrics.viewHeight
  };
};

/**
 * @returns {goog.math.Vec2} scroll offsets
 */
Blockly.BlockSpace.prototype.getScrollOffset = function() {
  return new goog.math.Vec2(this.getScrollOffsetX(), this.getScrollOffsetY());
};

/**
 * @returns {number} current scroll X offset, + is right
 */
Blockly.BlockSpace.prototype.getScrollOffsetX = function() {
  return -this.xOffsetFromView;
};

/**
 * @returns {number} current scroll Y offset, + is down
 */
Blockly.BlockSpace.prototype.getScrollOffsetY = function() {
  return -this.yOffsetFromView;
};

/**
 * Can be called to force an update of scrollbar height/position and usable
 * blockspace size according to the current content.
 */
Blockly.BlockSpace.prototype.updateScrollableSize = function () {
  if (this.scrollbarPair) {
    this.scrollbarPair.resize();
  }
};

/**
 * Establish a mousedown handler on the given dragTarget that will put the
 * blockspace into a pan-drag mode as long as the mouse is down.
 * @param {!EventTarget} target - Element which initiates pan-drag mode when
 *        clicked directly.
 * @param {function} [onDragTargetMouseDown] - optional function called when
 *        click on the drag target begins (used for hideChaff by BSE)
 */
Blockly.BlockSpace.prototype.bindBeginPanDragHandler = function (target,
                                                                 onDragTargetMouseDown) {
  this.panDragHandler_.bindBeginPanDragHandler(target, onDragTargetMouseDown);
};

/**
 * @param {!EventTarget} target - Element which initiates pan-drag mode when
 *        clicked directly.
 */
Blockly.BlockSpace.prototype.bindScrollOnWheelHandler = function (target) {
  this.scrollOnWheelHandler_.bindTo(target);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.BlockSpace.prototype.unbindBeginPanDragHandler = function () {
  this.panDragHandler_.unbindBeginPanDragHandler();
};

/**
 * Cached set of debug rectangles.
 * @type {{key: string, svgRect: SVGRect}}
 * @private
 */
Blockly.BlockSpace.prototype.debugRects_ = {};

/**
 * Draws a debug box in the coordindates of this blockspace, in the same
 * group as blocks are placed. Will re-use boxes based on given key.
 * @param {string} key - unique key for box
 * @param {goog.math.Box} box - box definition w.r.t. blockspace coordinates
 * @param {string} color - color for box outline
 */
Blockly.BlockSpace.prototype.drawDebugBox = function (key, box, color) {
  var rect = goog.math.Rect.createFromBox(box);
  if (!this.debugRects_[key]) {
    this.debugRects_[key] = Blockly.createSvgElement('rect', {
      fill: 'none',
      style: 'pointer-events: none'
    }, this.svgDebugCanvas_);
  }
  this.svgDebugCanvas_.setAttribute('transform', this.svgBlockCanvas_.getAttribute('transform'));
  var debugSvgRect = this.debugRects_[key];
  debugSvgRect.setAttribute('x', rect.left);
  debugSvgRect.setAttribute('y', rect.top);
  debugSvgRect.setAttribute('width', rect.width);
  debugSvgRect.setAttribute('height', rect.height);
  debugSvgRect.setAttribute('stroke', color);
  debugSvgRect.setAttribute('stroke-width', 3);
};

/**
 * Cached set of debug circles.
 * @type {{key: string, svgRect: SVGRect}}
 * @private
 */
Blockly.BlockSpace.prototype.debugCircles_ = {};

/**
 * Draws a debug circle in the coordindates of this blockspace, in the same
 * group as blocks are placed. Will re-use circles based on given key.
 * @param {string} key
 * @param {goog.math.Coordinate} coordinate
 * @param {string} color
 */
Blockly.BlockSpace.prototype.drawDebugCircle = function (key, coordinate, color) {
  var radius = 10;
  if (!this.debugCircles_[key]) {
   this.debugCircles_[key] = Blockly.createSvgElement('circle', {
     cx: "50",
     cy: "50",
     r: "50",
     style: 'pointer-events: none'
   }, this.svgDebugCanvas_);
  }
  this.svgDebugCanvas_.setAttribute('transform', this.svgBlockCanvas_.getAttribute('transform'));
  var debugSvgRect = this.debugCircles_[key];
  debugSvgRect.setAttribute('cx', ''+coordinate.x);
  debugSvgRect.setAttribute('cy', ''+coordinate.y);
  debugSvgRect.setAttribute('r', radius);
  debugSvgRect.setAttribute('fill', color);
};

/**
 * Removes and clears list of debug drawings
 */
Blockly.BlockSpace.prototype.clearDebugDrawings = function () {
  [this.debugCircles_, this.debugRects_].forEach(function (debugDict) {
    for (var key in debugDict) {
      var svg = debugDict[key];
      goog.dom.removeNode(svg);
    }
  });
  this.debugCircles_ = {};
  this.debugRects_ = {};
};

