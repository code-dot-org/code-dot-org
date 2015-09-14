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
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('goog.math.Rect');


/**
 * Class for a flyout.
 * @param {!Blockly.BlockSpaceEditor} blockSpaceEditor Parent editor.
 * @param {boolean} opt_static Is the flyout a static (always open) toolbox?
 * @constructor
 */
Blockly.Flyout = function(blockSpaceEditor, opt_static) {
  var flyout = this;

  /**
   * @type {!Blockly.BlockSpaceEditor}
   * @private
   */
  this.blockSpaceEditor_ = blockSpaceEditor;

  /**
   * @type {!Blockly.BlockSpace}
   * @private
   */
  this.blockSpace_ = new Blockly.BlockSpace(blockSpaceEditor,
      function() {return flyout.getMetrics_();},
      function(ratio) {return flyout.setMetrics_(ratio);}
  );
  this.blockSpace_.isFlyout = true;

  /**
   * @type {boolean}
   * @private
   */
  this.static_ = opt_static;

  /**
   * Opaque data that can be passed to removeChangeListener.
   * @type {BindData}
   * @private
   */
  this.changeWrapper_ = null;

  /**
   * @type {number}
   * @private
   */
  this.width_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.height_ = 0;

  /**
   * List of background buttons that lurk behind each block to catch clicks
   * landing in the blocks' lakes and bays.
   * @type {!Array.<!Element>}
   * @private
   */
  this.buttons_ = [];

  /**
   * List of event listeners.
   * @type {BindData}
   * @private
   */
  this.listeners_ = [];

  /**
   * If disabled, clicks on blocks in flyout will be ignored.
   */
  this.enabled_ = true;
};

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Wrapper function called when a resize occurs.
 * @type {BindData}
 * @private
 */
Blockly.Flyout.prototype.onResizeWrapper_ = null;

/**
 * Creates the flyout's DOM.  Only needs to be called once.
 * @type {boolean} insideToolbox Whether this flyout is in a toolbox.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function(insideToolbox) {
  /*
  <g>
    <path class="blocklyFlyoutBackground"/>
    <g></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {'class': 'svgFlyoutGroup'}, null);
  this.svgBackground_ = Blockly.createSvgElement('path',
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgGroup_.appendChild(this.blockSpace_.createDom());

  // Add a trashcan.
  if (!insideToolbox) {
    this.trashcan = new Blockly.Trashcan(this);
    this.svgTrashcan_ = this.trashcan.createDom();
    this.svgTrashcan_.setAttribute("style",
      "display: none; pointer-events: none");
    this.svgTrashcan_.setAttribute('transform', 'translate(0, 20)');
    this.svgGroup_.appendChild(this.svgTrashcan_);
  }

  return this.svgGroup_;
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  if (this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null;
  }
  if (this.changeWrapper_) {
    Blockly.unbindEvent_(this.changeWrapper_);
    this.changeWrapper_ = null;
  }
  this.blockSpace_ = null;
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBackground_ = null;
  this.targetBlockSpace_ = null;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
Blockly.Flyout.prototype.getMetrics_ = function() {
  if (!this.isVisible()) {
    // Flyout is hidden.
    return null;
  }
  var viewHeight = this.height_ - 2 * this.CORNER_RADIUS;
  var viewWidth = this.width_;
  try {
    if (Blockly.isMsie() || Blockly.isTrident()) {
      this.blockSpace_.getCanvas().style.display = "inline"; // required for IE
      var optionBox = {
        x: this.blockSpace_.getCanvas().getBBox().x,
        y: this.blockSpace_.getCanvas().getBBox().y,
        width: this.blockSpace_.getCanvas().scrollWidth,
        height: this.blockSpace_.getCanvas().scrollHeight
      };
    }
    else {
      var optionBox = this.blockSpace_.getCanvas().getBBox();
    }
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0};
  }
  return {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height + optionBox.y,
    viewTop: this.blockSpace_.getScrollOffsetY(),
    contentTop: 0,
    absoluteTop: this.CORNER_RADIUS,
    absoluteLeft: 0
  };
};

/**
 * @returns {number} the height of this flyout
 */
Blockly.Flyout.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Sets the Y translation of the flyout to match the scrollbars.
 * @param {!Object} yRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.Flyout.prototype.setMetrics_ = function(yRatio) {
  var metrics = this.getMetrics_();
  if (goog.isNumber(yRatio.y)) {
    // TODO(bjordan+bbuchanan): needs to change?
    this.blockSpace_.yOffsetFromView = -metrics.contentHeight * yRatio.y
        - metrics.contentTop;
  }
  var y = this.blockSpace_.yOffsetFromView + metrics.absoluteTop;
  this.blockSpace_.getCanvas().setAttribute('transform', 'translate(0,'
      + y + ')');
  this.blockSpace_.getDragCanvas().setAttribute('transform',
      'translate(0,' + y + ')');
};

/**
 * Initializes the flyout.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace in which to create new
 *     blocks.
 * @param {boolean} withScrollbars True if a scrollbar should be displayed.
 */
Blockly.Flyout.prototype.init = function(blockSpace, withScrollbars) {
  this.targetBlockSpace_ = blockSpace;
  // Add scrollbars.
  var flyout = this;
  if (withScrollbars) {
    var useHorizontalScrollbar = false;
    var useVerticalScrollbar = true;
    flyout.blockSpace_.scrollbarPair = new Blockly.ScrollbarPair(
        flyout.blockSpace_, useHorizontalScrollbar, useVerticalScrollbar);
  }

  this.hide();

  // If the document resizes, reposition the flyout.
  this.onResizeWrapper_ = Blockly.bindEvent_(window,
      goog.events.EventType.RESIZE, this, this.position_);
  this.position_();
  this.changeWrapper_ = Blockly.bindEvent_(this.targetBlockSpace_.getCanvas(),
      'blocklyBlockSpaceChange', this, this.filterForCapacity_);
};

/**
 * Move the toolbox to the edge of the blockSpace.
 * @private
 */
Blockly.Flyout.prototype.position_ = function() {
  if (!this.isVisible()) {
    return;
  }
  var metrics = this.targetBlockSpace_.customFlyoutMetrics_ ?
      this.targetBlockSpace_.customFlyoutMetrics_() :
      this.targetBlockSpace_.getMetrics();
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  var edgeWidth = this.width_ - this.CORNER_RADIUS;
  if (Blockly.RTL) {
    edgeWidth *= -1;
  }
  var path = ['M ' + (Blockly.RTL ? this.width_ : 0) + ',0'];
  path.push('h', edgeWidth);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 0 : 1,
      Blockly.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('v', Math.max(0, metrics.viewHeight - this.CORNER_RADIUS * 2));
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 0 : 1,
      Blockly.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('h', -edgeWidth);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));

  var x = metrics.absoluteLeft;
  var y = metrics.absoluteTop;
  if (Blockly.RTL) {
    x = this.static_ ? 0 : -this.width_;
    x += metrics.viewWidth;
  } else if (this.static_) {
    x -= this.width_;
  }
  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');

  // Record the height for Blockly.Flyout.getMetrics_.
  this.height_ = metrics.viewHeight;
  this.blockSpace_.updateScrollableSize();

  // Center the trashcan
  if (this.svgTrashcan_) {
    var flyoutWidth = this.svgGroup_.getBoundingClientRect().width;
    var trashcanWidth = 70;
    var trashcanX = Math.round(flyoutWidth / 2 - trashcanWidth / 2);
    this.svgTrashcan_.setAttribute('transform', 'translate(' + trashcanX + ', 20)');
  }
};

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function() {
  return this.svgGroup_.style.display == 'block';
};

/**
 * Hide and empty the flyout.
 * @param {?Blockly.Block} opt_saveBlock - block to not immediately destroy
 */
Blockly.Flyout.prototype.hide = function(opt_saveBlock) {
  if (!this.isVisible()) {
    return;
  }
  this.svgGroup_.style.display = 'none';
  // Delete all the event listeners.
  this.blockSpace_.unbindBeginPanDragHandler();
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.splice(0);
  if (this.reflowWrapper_) {
    Blockly.unbindEvent_(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Delete all the blocks.
  this.blockSpace_.getTopBlocks(false).forEach(function (block) {
    if (block !== opt_saveBlock) {
      block.dispose(false, false);
    }
  });
  // Delete all the background buttons.
  for (var x = 0, rect; rect = this.buttons_[x]; x++) {
    goog.dom.removeNode(rect);
  }
  // Delete the 'Create a Function' button.
  goog.dom.removeNode(goog.dom.getElementByClass('createFunction',
      this.blockSpace_.svgGroup_));
  this.buttons_.splice(0);
};

/**
 * Arrange the given block in the flyout, and update cursorX/cursorY.
 * @param block
 * @param cursor
 * @param gap
 * @private
 */
Blockly.Flyout.prototype.layoutBlock_ = function(block, cursor, gap, initialX) {
  var blockHW = block.getHeightWidth();
  block.moveBy(cursor.x, cursor.y);
  cursor.y += blockHW.height + gap;
};

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList) {
  this.hide();
  this.svgGroup_.style.display = 'block';

  var margin = this.CORNER_RADIUS;
  var initialX = Blockly.RTL ? this.width_ : margin
      + Blockly.BlockSvg.TAB_WIDTH;
  var cursor = {
    x: initialX,
    y: margin
  };

  // We bind mouse pan-drag on the background group so blocks are ignored.
  this.blockSpace_.bindBeginPanDragHandler(this.svgBackground_);
  // We bind scrollwheel on the full group so wheeling over blocks works.
  this.blockSpace_.bindScrollOnWheelHandler(this.svgGroup_);

  // Create the blocks to be shown in this flyout.
  var blocks = [];
  var gaps = [];
  this.minFlyoutWidth_ = 0;
  var firstBlock = xmlList && xmlList[0];
  if (firstBlock === Blockly.Variables.NAME_TYPE) {
    // Special category for variables.
    Blockly.Variables.flyoutCategory(blocks, gaps, margin, this.blockSpace_);
  } else if (firstBlock === Blockly.Procedures.NAME_TYPE) {
    // Special category for procedures.
    if (Blockly.functionEditor && !Blockly.functionEditor.isOpen()) {
      this.addButtonToFlyout_(cursor, Blockly.Msg.FUNCTION_CREATE, this.createFunction_);
    }
    Blockly.Procedures.flyoutCategory(blocks, gaps, margin,
      this.blockSpace_,
      function(procedureInfo) { return !procedureInfo.isFunctionalVariable; }
    );
  } else if (firstBlock === Blockly.Procedures.NAME_TYPE_FUNCTIONAL_VARIABLE) {
    // Special category for functional variables.
    if (Blockly.functionEditor && !Blockly.functionEditor.isOpen()) {
      this.addButtonToFlyout_(cursor, Blockly.Msg.FUNCTIONAL_VARIABLE_CREATE,
        this.createFunctionalVariable_);
    }
    Blockly.Procedures.flyoutCategory(blocks, gaps, margin,
      this.blockSpace_,
      function(procedureInfo) { return procedureInfo.isFunctionalVariable; }
    );
  } else {
    for (var i = 0, xml; xml = xmlList[i]; i++) {
      if (xml.tagName && xml.tagName.toUpperCase() == 'BLOCK') {
        blocks.push(Blockly.Xml.domToBlock(this.blockSpace_, xml));
        gaps.push(margin * 3);
      }
    }
  }

  // Lay out the blocks vertically.
  for (var i = 0, block; block = blocks[i]; i++) {
    var allBlocks = block.getDescendants();
    for (var j = 0, child; child = allBlocks[j]; j++) {
      // Mark blocks as being inside a flyout.  This is used to detect and
      // prevent the closure of the flyout if the user right-clicks on such a
      // block.
      child.isInFlyout = true;
      // There is no good way to handle comment bubbles inside the flyout.
      // Blocks shouldn't come with predefined comments, but someone will
      // try this, I'm sure.  Kill the comment.
      child.setCommentText(null);
    }
    block.render();
    this.layoutBlock_(block, cursor, gaps[i], initialX);
    // Create an invisible rectangle under the block to act as a button.  Just
    // using the block as a button is poor, since blocks have holes in them.
    var rect = Blockly.createSvgElement('rect', {'fill-opacity': 0}, null);
    // Add the rectangles under the blocks, so that the blocks' tooltips work.
    this.blockSpace_.getCanvas().insertBefore(rect, block.getSvgRoot());
    block.flyoutRect_ = rect;
    this.buttons_[i] = rect;

    var root = block.getSvgRoot();
    if (this.autoClose) {
      this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
          this.createBlockFunc_(block)));
    } else {
      this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
          this.blockMouseDown_(block)));
    }
    this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block.svg_,
        block.svg_.addSelectNoMove));
    this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block.svg_,
        block.svg_.removeSelect));
    this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
        this.createBlockFunc_(block)));
    this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block.svg_,
        block.svg_.addSelectNoMove));
    this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block.svg_,
        block.svg_.removeSelect));
  }
  this.width_ = 0;
  this.reflow();

  this.filterForCapacity_();

  // Fire a resize event to update the flyout's scrollbar.
  Blockly.fireUiEvent(window, 'resize');
  this.reflowWrapper_ = Blockly.bindEvent_(this.blockSpace_.getCanvas(),
      'blocklyBlockSpaceChange', this, this.reflow);
  this.blockSpace_.fireChangeEvent();
};

/**
 * Adds a rectangular SVG button to this flyout's blockSpace
 * @param {{x: Number, y: Number}} cursor current drawing position in flyout
 * @param {String} buttonText text to display on button
 * @param {Function} onMouseDown callback for button press
 * @private
 */
Blockly.Flyout.prototype.addButtonToFlyout_ = function(cursor, buttonText, onMouseDown) {
  var button = Blockly.createSvgElement('g', {'class': 'createFunction'},
    this.blockSpace_.svgGroup_);
  var padding = 5;
  var r = Blockly.createSvgElement('rect', {
    rx: 5,
    ry: 5,
    fill: 'orange',
    stroke: 'white'
  }, button);
  var text = Blockly.createSvgElement('text', {
    x: padding,
    y: padding,
    'class': 'blocklyText'
  }, button);
  text.textContent = buttonText;
  var bounds = text.getBoundingClientRect();
  this.minFlyoutWidth_ = bounds.width + 2 * padding;
  r.setAttribute('width', bounds.width + 2 * padding);
  r.setAttribute('height', bounds.height + 2 * padding);
  r.setAttribute('y', -bounds.height + padding - 1);
  button.setAttribute('transform', 'translate(17, 25)');
  Blockly.bindEvent_(button, 'mousedown', this, onMouseDown);
  cursor.y += 40;
};

/**
 * Compute width of flyout.
 * For RTL: Lay out the blocks right-aligned.
 */
Blockly.Flyout.prototype.reflow = function() {
  var flyoutWidth = this.minFlyoutWidth_ || 0;
  var margin = this.CORNER_RADIUS;
  var blocks = this.blockSpace_.getTopBlocks(false);
  for (var x = 0, block; block = blocks[x]; x++) {
    var blockHW = block.getHeightWidth();
    flyoutWidth = Math.max(flyoutWidth, blockHW.width);
  }
  flyoutWidth += margin + Blockly.BlockSvg.TAB_WIDTH + margin / 2 +
                 Blockly.Scrollbar.scrollbarThickness;
  if (this.width_ != flyoutWidth) {
    for (var x = 0, block; block = blocks[x]; x++) {
      var blockHW = block.getHeightWidth();
      var blockXY = block.getRelativeToSurfaceXY();
      if (Blockly.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        var dx = flyoutWidth - margin - Blockly.BlockSvg.TAB_WIDTH - blockXY.x;
        block.moveBy(dx, 0);
        blockXY.x += dx;
      }
      if (block.flyoutRect_) {
        block.flyoutRect_.setAttribute('width', blockHW.width);
        block.flyoutRect_.setAttribute('height', blockHW.height);
        block.flyoutRect_.setAttribute('x',
            Blockly.RTL ? blockXY.x - blockHW.width : blockXY.x);
        block.flyoutRect_.setAttribute('y', blockXY.y);
      }
    }
    // Record the width for .getMetrics_ and .position_.
    this.width_ = flyoutWidth;
    // Fire a resize event to update the flyout's scrollbar.
    Blockly.fireUiEvent(window, 'resize');
  }
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    if (!flyout.enabled_) {
      return;
    }
    Blockly.BlockSpaceEditor.terminateDrag_();
    flyout.blockSpace_.blockSpaceEditor.hideChaff();
    if (Blockly.isRightButton(e)) {
      // Right-click.
      // Unlike google Blockly, we don't want to show a context menu
      //block.showContextMenu_(Blockly.mouseToSvg(e));
    } else {
      // Left-click (or middle click)
      Blockly.removeAllRanges();
      flyout.blockSpace_.blockSpaceEditor.setCursor(Blockly.Css.Cursor.CLOSED);
      // Record the current mouse position.
      Blockly.Flyout.startDragMouseX_ = e.clientX;
      Blockly.Flyout.startDragMouseY_ = e.clientY;
      Blockly.Flyout.startBlock_ = block;
      Blockly.Flyout.startFlyout_ = flyout;
      Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document,
          'mouseup', this, Blockly.BlockSpaceEditor.terminateDrag_);
      Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
          'mousemove', this, flyout.onMouseMove_);
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  };
};

/**
 * Mouse button is down on a block in a non-closing flyout.  Create the block
 * if the mouse moves beyond a small radius.  This allows one to play with
 * fields without instantiating blocks that instantly self-destruct.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMove_ = function(e) {
  if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
      e.button == 0) {
    /* HACK:
     Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove events
     on certain touch actions. Ignore events with these signatures.
     This may result in a one-pixel blind spot in other browsers,
     but this shouldn't be noticable. */
    e.stopPropagation();
    return;
  }
  Blockly.removeAllRanges();
  var dx = e.clientX - Blockly.Flyout.startDragMouseX_;
  var dy = e.clientY - Blockly.Flyout.startDragMouseY_;
  // Still dragging within the sticky DRAG_RADIUS.
  var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  if (dr > Blockly.DRAG_RADIUS) {

    // Pass through the start drag position.
    e.startDragMouseX_ = Blockly.Flyout.startDragMouseX_;
    e.startDragMouseY_ = Blockly.Flyout.startDragMouseY_;

    // Create the block.
    Blockly.Flyout.startFlyout_.createBlockFunc_(Blockly.Flyout.startBlock_)(e);
  }
};

/**
 * Create a new Function block and open the editor.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.createFunction_ = function() {
  Blockly.functionEditor.openWithNewFunction();
};

Blockly.Flyout.prototype.createFunctionalVariable_ = function() {
  Blockly.contractEditor.openWithNewVariable();
};

/**
 * Create a copy of this block on the blockSpace.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.createBlockFunc_ = function(originBlock) {
  var flyout = this;
  return function(e) {
    if (!flyout.enabled_) {
      return;
    }
    if (Blockly.isRightButton(e)) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    if (originBlock.disabled) {
      // Beyond capacity.
      return;
    }
    // Create the new block by cloning the block in the flyout (via XML).
    var xml = Blockly.Xml.blockToDom(originBlock);
    var targetBlockSpace = flyout.targetBlockSpace_;
    var block = Blockly.Xml.domToBlock(targetBlockSpace, xml);
    // Place it in the same spot as the flyout copy.
    var svgRootOld = originBlock.getSvgRoot();
    if (!svgRootOld) {
      throw 'originBlock is not rendered.';
    }
    var xyOld = Blockly.getSvgXY_(svgRootOld,
        originBlock.blockSpace.blockSpaceEditor.svg_);
    var svgRootNew = block.getSvgRoot();
    if (!svgRootNew) {
      throw 'block is not rendered.';
    }
    var xyNew = Blockly.getSvgXY_(svgRootNew,
        block.blockSpace.blockSpaceEditor.svg_);
    block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
    if (flyout.autoClose) {
      /**
       * We need to avoid destroying the currently dragged block
       * until the active touchmove event is completed (block dropped)
       * @see https://neil.fraser.name/news/2014/08/09/
       */
      flyout.hide(originBlock);
      block.blockEvents.listenOnce(
        Blockly.Block.EVENTS.AFTER_DROPPED,
        function () {
          originBlock.dispose(false, false);
        }
      );
    } else {
      flyout.filterForCapacity_();
    }
    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
  };
};

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.
 * @private
 */
Blockly.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetBlockSpace_.remainingCapacity();
  var blocks = this.blockSpace_.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var allBlocks = block.getDescendants();
    var disabled = allBlocks.length > remainingCapacity;
    block.setDisabled(disabled);
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Flyout.terminateDrag_ = function() {
  if (Blockly.Flyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
    Blockly.Flyout.onMouseUpWrapper_ = null;
  }
  if (Blockly.Flyout.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveWrapper_);
    Blockly.Flyout.onMouseMoveWrapper_ = null;
  }
  Blockly.Flyout.startDragMouseX_ = 0;
  Blockly.Flyout.startDragMouseY_ = 0;
  Blockly.Flyout.startBlock_ = null;
  Blockly.Flyout.startFlyout_ = null;
};

/**
 * When disabled, block clicks on blocks will be ignored.
 */
Blockly.Flyout.prototype.setEnabled = function (enabled) {
  this.enabled_ = enabled;
};

/**
* Return the deletion rectangle for this flyout.
* @return {goog.math.Rect} Rectangle in which to delete.
*/
Blockly.Flyout.prototype.getRect = function() {
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var x = Blockly.getSvgXY_(this.svgGroup_).x;
  if (!Blockly.RTL) {
    x -= BIG_NUM;
  }
  return new goog.math.Rect(x, -BIG_NUM,
    BIG_NUM + this.width_, this.height_ + 2 * BIG_NUM);
};
