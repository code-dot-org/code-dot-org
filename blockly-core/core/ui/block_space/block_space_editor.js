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
 * @fileoverview Top-level block editing blockSpace
 */
'use strict';

goog.provide('Blockly.BlockSpaceEditor');
goog.require('Blockly.BlockSpace');
goog.require('Blockly.BlockSvgUnused');
goog.require('goog.array');
goog.require('goog.style');

/**
 * Class for a top-level block editing blockSpace.
 * Handles constructing a top-level SVG element, and positioning, sizing,
 * and certain focus/mouse handling operations for itself.
 * @constructor
 * @param {boolean} opt_hideTrashRect The trash rectangle is a dark grey
 * rectangle covering the entire toolbox area, and is faded in when the user
 * drags a block towards the toolbox to delete it.  However, when creating a
 * blockspace for something like the function editor, we don't want to create
 * an additional one, relying on the main blockspace editor's one instead.
 * @param {boolean} opt_readOnly whether or not to initialize this
 * workspace in readOnly mode. All Blockly elements that are (or can be)
 * aware of this BlockSpaceEditor will consider Blockly to be in
 * readOnly mode if this BlockSpaceEditor.readOnly OR Blockly.readOnly
 * are true
 */
Blockly.BlockSpaceEditor = function(container, opt_getMetrics, opt_setMetrics, opt_hideTrashRect, opt_readOnly) {
  if (opt_getMetrics) {
    this.getBlockSpaceMetrics_ = opt_getMetrics;
  }
  if (opt_setMetrics) {
    this.setBlockSpaceMetrics_ = opt_setMetrics;
  }
  if (opt_hideTrashRect) {
    this.hideTrashRect_ = opt_hideTrashRect;
  }

  this.readOnly_ = !!opt_readOnly;
  /**
   * @type {Blockly.BlockSpace}
   */
  this.blockSpace = new Blockly.BlockSpace(this,
    goog.bind(this.getBlockSpaceMetrics_, this),
    goog.bind(this.setBlockSpaceMetrics_, this),
    container
  );

  /**
   * Set of blocks with limits, keyed by block type. Used to enforce
   * limited quantities of blocks in workspace.
   * @type {Blockly.BlockLimits}
   */
  this.blockLimits = new Blockly.BlockLimits();

  this.createDom_(container);
  this.init_();
};

/**
 * If enabled, during block bumping the entire block will be bumped into view.
 *
 * If disabled, when dragged off the bottom or right of the blockspace, the
 * block will be bumped until their top or left is within the padding—just
 * enough block in view to grab.
 * @type {boolean}
 */
Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK = false;

/**
 * Padding (in pixels) within the inside of the block space for bumping.
 * @type {number}
 * @const
 */
Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_TOP = 2;
Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_LEFT = 2;
Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_BOTTOM = 2;
Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_RIGHT = 2;

Blockly.BlockSpaceEditor.BUMP_PADDING_TOP = 15;
Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT = 15;
Blockly.BlockSpaceEditor.BUMP_PADDING_BOTTOM = 25;
Blockly.BlockSpaceEditor.BUMP_PADDING_RIGHT = 25;

/**
 * When enabled, draws debug boxes around blocks and dimensions used in bumping
 * logic.
 * @type {boolean}
 */
Blockly.BlockSpaceEditor.BUMP_DEBUG = false;

/**
 * When enabled, outputs debug logging about block bumping.
 * @type {boolean}
 */
Blockly.BlockSpaceEditor.SCROLL_DRAG_DEBUG = false;

/**
 * Create an SVG element containing SVG filter and pattern definitions usable
 * within any BlockSpace.
 * @param {Element} container the parent element for the <svg> effects element
 * @private
 */
Blockly.BlockSpaceEditor.prototype.populateSVGEffects_ = function(container) {
  if (goog.dom.getElement('blocklySvgDefsGlobal')) {
    return;
  }
  var svg = Blockly.createSvgElement('svg', {
    id: 'blocklyFilters',
    width: 0,
    height: 0,
    style: 'display: block'
  }, container);
  /*
   <defs>
   ... filters go here ...
   </defs>
   */
  var defs = Blockly.createSvgElement('defs', {
    id: 'blocklySvgDefsGlobal'
  }, svg);
  var filter, feSpecularLighting, feMerge, pattern;
  /*
   <filter id="blocklyEmboss">
   <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
   <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
   specularExponent="10" lighting-color="white"
   result="specOut">
   <fePointLight x="-5000" y="-10000" z="20000"/>
   </feSpecularLighting>
   <feComposite in="specOut" in2="SourceAlpha" operator="in"
   result="specOut"/>
   <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
   k1="0" k2="1" k3="1" k4="0"/>
   </filter>
   */
  filter = Blockly.createSvgElement('filter', {'id': 'blocklyEmboss'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'}, filter);
  feSpecularLighting = Blockly.createSvgElement('feSpecularLighting',
      {'in': 'blur', 'surfaceScale': 1, 'specularConstant': 0.5,
        'specularExponent': 10, 'lighting-color': 'white', 'result': 'specOut'},
      filter);
  Blockly.createSvgElement('fePointLight',
      {'x': -5000, 'y': -10000, 'z': 20000}, feSpecularLighting);
  Blockly.createSvgElement('feComposite',
      {'in': 'specOut', 'in2': 'SourceAlpha', 'operator': 'in',
        'result': 'specOut'}, filter);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', 'in2': 'specOut', 'operator': 'arithmetic',
        'k1': 0, 'k2': 1, 'k3': 1, 'k4': 0}, filter);
  /*
   <filter id="blocklyTrashcanShadowFilter">
   <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
   <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
   <feMerge>
   <feMergeNode in="offsetBlur"/>
   <feMergeNode in="SourceGraphic"/>
   </feMerge>
   </filter>
   */
  filter = Blockly.createSvgElement('filter',
      {'id': 'blocklyTrashcanShadowFilter', 'height': '150%', 'y': '-20%'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 2, 'result': 'blur'}, filter);
  Blockly.createSvgElement('feOffset',
      {'in': 'blur', 'dx': 1, 'dy': 1, 'result': 'offsetBlur'}, filter);
  feMerge = Blockly.createSvgElement('feMerge', {}, filter);
  Blockly.createSvgElement('feMergeNode', {'in': 'offsetBlur'}, feMerge);
  Blockly.createSvgElement('feMergeNode', {'in': 'SourceGraphic'}, feMerge);
  /*
   <filter id="blocklyShadowFilter">
   <feGaussianBlur stdDeviation="2"/>
   </filter>
   */
  filter = Blockly.createSvgElement('filter',
      {'id': 'blocklyShadowFilter'}, defs);
  Blockly.createSvgElement('feGaussianBlur', {'stdDeviation': 2}, filter);
  /*
   <pattern id="blocklyDisabledPattern" patternUnits="userSpaceOnUse"
   width="10" height="10">
   <rect width="10" height="10" fill="#aaa" />
   <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
   </pattern>
   */
  pattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyDisabledPattern', 'patternUnits': 'userSpaceOnUse',
        'width': 10, 'height': 10}, defs);
  Blockly.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, pattern);
  Blockly.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, pattern);
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.createDom_ = function(container) {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');

  this.populateSVGEffects_(container);

  // Build the SVG DOM.
  /*
   <svg
   xmlns="http://www.w3.org/2000/svg"
   xmlns:html="http://www.w3.org/1999/xhtml"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   version="1.1"
   class="blocklySvg">
   ...
   </svg>
   */
  var svg = Blockly.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklySvg'
  }, null);
  this.svg_ = svg;

  container.appendChild(svg);
  goog.events.listen(svg, 'selectstart', function() { return false; });
  this.defs_ = Blockly.createSvgElement('defs', { id: 'blocklySvgDefs'}, svg);
  this.blockSpace.maxBlocks = Blockly.maxBlocks;

  // If we're going to have a toolbox, create a rect which is the same
  // location/dimensions as the HTML div that contains the rest of the toolbox.
  // This new rect will have the grey shade of the toolbox background.  We create
  // it here so that blocks can be dragged over the top of it.  The HTML div
  // appears over the blocks, meaning that blocks dragged to it would appear
  // underneath it, if it had a background color, which wouldn't look as good.
  if (!this.hideTrashRect_ && !this.isReadOnly() && Blockly.hasCategories) {
    this.svgBackground_ = Blockly.createSvgElement('rect',
      {'id': 'toolboxRect', 'class': 'blocklyToolboxBackground'},
      this.svg_);
  }

  svg.appendChild(this.blockSpace.createDom());

  if (!this.isReadOnly()) {
    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    this.addToolboxOrFlyout_();

    // Add a handler that allows the workspace to bump blocks back into their
    // working area.
    this.addChangeListener(this.bumpBlocksIfNotDragging);
  }

  /**
   * When disabled, we wont allow you to drag blocks into blockSpace
   */
  this.setEnableToolbox = function (enabled) {
    if (!this.isReadOnly()) {
      if (this.flyout_) {
        this.flyout_.setEnabled(enabled);
      } else if (this.toolbox) {
        this.toolbox.enabled = enabled;
      }
    }
  };

  svg.appendChild(Blockly.Tooltip.createDom());
  this.svgResize();

  // Create an HTML container for popup overlays (e.g. editor widgets).
  if (!Blockly.WidgetDiv.DIV) {
    Blockly.WidgetDiv.DIV = goog.dom.createDom('div', 'blocklyWidgetDiv');
    Blockly.WidgetDiv.DIV.style.direction = Blockly.RTL ? 'rtl' : 'ltr';
    document.body.appendChild(Blockly.WidgetDiv.DIV);
  }
};

/**
 * Adds an SVG element to this BlockSpace's <defs>
 * @param {SVGElement} definitionToAdd
 */
Blockly.BlockSpaceEditor.prototype.addToSvgDefs = function(definitionToAdd) {
  this.defs_.appendChild(definitionToAdd);
};

Blockly.BlockSpaceEditor.prototype.addToolboxOrFlyout_ = function() {
  if (Blockly.hasCategories) {
    this.toolbox = new Blockly.Toolbox(this);
  } else {
    this.addFlyout_();
  }
};

Blockly.BlockSpaceEditor.prototype.addFlyout_ = function() {
  /**
   * @type {?Blockly.Flyout}
   * @private
   */
  this.flyout_ = new Blockly.Flyout(this, true);
  var flyout = this.flyout_;
  var flyoutSvg = flyout.createDom(false);
  flyout.init(this.blockSpace, true);
  flyout.autoClose = false;
  // Insert the flyout behind the blockSpace so that blocks appear on top.
  goog.dom.insertSiblingBefore(flyoutSvg, this.blockSpace.svgGroup_);
};

/**
 * Gather and return a list of delete rectangles related to this editor.
 * @public
 * @return {Array.<Rect>} A list of delete area rectangles.
 */
Blockly.BlockSpaceEditor.prototype.getDeleteAreas = function() {
  var deleteAreas = [];

  if (this.flyout_) {
    goog.array.extend(deleteAreas, this.flyout_.getRect());
  }

  if (this.toolbox) {
    goog.array.extend(deleteAreas, this.toolbox.getRect());
  }

  return deleteAreas;
};

/**
 * If a drag operation is not active, bumps blocks into the BlockSpace.
 */
Blockly.BlockSpaceEditor.prototype.bumpBlocksIfNotDragging = function() {
  // Immediately return if dragging, to avoid expensive calculations
  if (Blockly.Block.isDragging()) {
    return;
  }

  this.bumpBlocksIntoBlockSpace();
};

/**
 * Bumps blocks back in to BlockSpace area.
 * If BUMP_ENTIRE_BLOCK is true, bumps entire block back in.
 * If BUMP_ENTIRE_BLOCK is false, bumps just enough for block to be grippable
 *     within a padded inner area.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.bumpBlocksIntoBlockSpace = function() {
  // Can't bump if we don't know our workspace dimensions
  var metrics = this.blockSpace.getMetrics();
  if (!metrics) {
    return;
  }

  if (!Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK) {
    var blockSpaceSize = this.blockSpace.getScrollableSize(metrics);

    // Calculate bounds of view, including bump padding
    var blockSpaceInnerTop = Blockly.BlockSpaceEditor.BUMP_PADDING_TOP;
    var blockSpaceInnerLeft = Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT;
    var blockSpaceInnerBottom = blockSpaceSize.height
      - Blockly.BlockSpaceEditor.BUMP_PADDING_BOTTOM;
    var blockSpaceInnerRight = blockSpaceSize.width
      - Blockly.BlockSpaceEditor.BUMP_PADDING_RIGHT;
    var blockSpaceInnerWidth = blockSpaceInnerRight - blockSpaceInnerLeft;
    var blockSpaceInnerHeight = blockSpaceInnerBottom - blockSpaceInnerTop;
  }

  // Check every block, and bump if needed.
  this.blockSpace.getTopBlocks(false, false).forEach(function (block) {
    if (!block.isVisible() || block.isCurrentlyBeingDragged()) {
      return;
    }

    if (!Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK) {
      // Skip block if it doesn't fit in the view anyway.
      var blockHW = block.getHeightWidth();
      if (blockHW.width > blockSpaceInnerWidth || blockHW.height > blockSpaceInnerHeight) {
        return;
      }
    }

    var howFarOutsideLeft, howFarOutsideRight, howFarAboveTop, howFarBelowBottom;

    if (!Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK) {
      // If these values are positive, the block needs to be bumped
      var blockXY = block.getRelativeToSurfaceXY();
      howFarOutsideLeft = Math.max(0, blockSpaceInnerLeft - blockXY.x);
      howFarOutsideRight = Math.max(0, blockXY.x - blockSpaceInnerRight);
      howFarAboveTop = Math.max(0, blockSpaceInnerTop - blockXY.y);
      howFarBelowBottom = Math.max(0, blockXY.y - blockSpaceInnerBottom);
    } else {
      var paddedBlockSpaceBox = this.blockSpace.getScrollableBox()
        .expand(-Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_TOP,
        -Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_RIGHT,
        -Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_BOTTOM,
        -Blockly.BlockSpaceEditor.ENTIRE_BUMP_PADDING_LEFT);
      var originalBlockBox = block.getBox();
      var overflow = Blockly.getBoxOverflow(paddedBlockSpaceBox, originalBlockBox);

      // If overflow values are positive, the block needs to be bumped
      howFarOutsideLeft = Math.max(0, overflow.left);
      howFarOutsideRight = Math.max(0, overflow.right);
      howFarAboveTop = Math.max(0, overflow.top);
      howFarBelowBottom = Math.max(0, overflow.bottom);
    }

    // Calculate needed bump
    var moveX = howFarOutsideLeft ? howFarOutsideLeft : -howFarOutsideRight;
    var moveY = howFarAboveTop ? howFarAboveTop : -howFarBelowBottom;

    if (Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK) {
      // If the block doesn't fit in the view, move, instead, flush to the left
      // or top.
      if (Blockly.isBoxWiderThan(originalBlockBox, paddedBlockSpaceBox)) {
        moveX = overflow.left;
      }
      if (Blockly.isBoxTallerThan(originalBlockBox, paddedBlockSpaceBox)) {
        moveY = overflow.top
      }
    }

    var shouldBump = moveX || moveY;
    if (shouldBump) {
      block.moveBy(moveX, moveY);
    }

    if (Blockly.BlockSpaceEditor.BUMP_DEBUG &&
        Blockly.BlockSpaceEditor.BUMP_ENTIRE_BLOCK) {
      var afterBumpBlockBox = block.getBox();
      var originalBlockBoxColor = shouldBump ? "red" : "green";
      this.blockSpace.drawDebugBox("block box" + block.id,
        originalBlockBox, originalBlockBoxColor);
      this.blockSpace.drawDebugBox("block after" + block.id,
        afterBumpBlockBox, "purple");
      this.blockSpace.drawDebugBox("block space box" + block.id,
        paddedBlockSpaceBox, "blue");
    }
  }, this);
};

Blockly.BlockSpaceEditor.prototype.init_ = function() {
  this.detectBrokenControlPoints();

  // Bind pan-drag handlers
  this.blockSpace.bindBeginPanDragHandler(this.svg_,
    goog.bind(this.hideChaff, this));
  this.blockSpace.bindScrollOnWheelHandler(this.svg_);

  Blockly.bindEvent_(Blockly.WidgetDiv.DIV, 'contextmenu', null,
    Blockly.blockContextMenu);

  if (!Blockly.documentEventsBound_) {
    // Only bind the window/document events once.
    // Destroying and reinjecting Blockly should not bind again.
    Blockly.bindEvent_(window, 'resize', this, this.svgResize);
    Blockly.bindEvent_(document, 'keydown', this, this.onKeyDown_);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (goog.userAgent.IPAD) {
      Blockly.bindEvent_(window, 'orientationchange', document, function () {
        Blockly.fireUiEvent(window, 'resize');
      }, false);
    }
    Blockly.documentEventsBound_ = true;
  }

  if (Blockly.languageTree && !this.isReadOnly()) {
    if (Blockly.hasCategories) {
      this.toolbox.init(this.blockSpace, this);
    } else {
      // Build a fixed flyout with the root blocks.
      this.flyout_.init(this.blockSpace, true);
      this.flyout_.show(Blockly.languageTree.childNodes);
    }
  }
  if (Blockly.hasVerticalScrollbars || Blockly.hasHorizontalScrollbars) {
    this.blockSpace.scrollbarPair = new Blockly.ScrollbarPair(
      this.blockSpace, Blockly.hasHorizontalScrollbars, Blockly.hasVerticalScrollbars);
    this.blockSpace.scrollbarPair.resize();
  }
};

Blockly.BlockSpaceEditor.prototype.detectBrokenControlPoints = function() {
  if (goog.userAgent.WEBKIT) {
    /* HACK:
     WebKit bug 67298 causes control points to be included in the reported
     bounding box.  Detect if this browser suffers from this bug by drawing a
     shape that is 50px high, and has a control point that sticks up by 5px.
     If the getBBox function returns a height of 55px instead of 50px, then
     this browser has broken control points.
     */
    var path = Blockly.createSvgElement('path',
      {'d': 'm 0,0 c 0,-5 0,-5 0,0 H 50 V 50 z'}, this.svg_);
    if (Blockly.isMsie() || Blockly.isTrident()) {
      path.style.display = "inline";
      /* reqd for IE */
      path.bBox_ = {
        x: path.getBBox().x,
        y: path.getBBox().y,
        width: path.scrollWidth,
        height: path.scrollHeight
      };
    }
    else {
      path.bBox_ = path.getBBox();
    }
    if (path.bBox_.height > 50) {
      // Chrome (v28) and Opera (v15) report 55, Safari (v6.0.5) reports 53.75.
      Blockly.BROKEN_CONTROL_POINTS = true;
    }
    this.svg_.removeChild(path);
  }
};


/**
 * Returns the dimensions of the current SVG image.
 * @return {!Object} Contains width, height, top and left properties.
 */
Blockly.BlockSpaceEditor.prototype.svgSize = function() {
  return {
    width: this.svg_.cachedWidth_,
    height: this.svg_.cachedHeight_
  };
};

/**
 * Size the SVG image to completely fill its container.  Record both
 * the height/width and the absolute position of the SVG image.
 */
Blockly.BlockSpaceEditor.prototype.svgResize = function() {
  var svg = this.svg_;
  var svgStyle = window.getComputedStyle(svg);
  var svgBorderWidth = 0;
  if (svgStyle) {
    svgBorderWidth = (parseInt(svgStyle.borderLeftWidth, 10) || 0) +
      (parseInt(svgStyle.borderRightWidth, 10) || 0);
  }

  // Subtract any pixels present above the svg element from the available height
  var containerDiv = svg.parentNode;
  var headerHeight = this.getWorkspaceTopOffset();

  var svgWidth = containerDiv.clientWidth - svgBorderWidth;
  var svgHeight = containerDiv.clientHeight - headerHeight;

  if (svg.cachedWidth_ != svgWidth) {
    svg.setAttribute('width', svgWidth + 'px');
    svg.cachedWidth_ = svgWidth;
  }
  if (svg.cachedHeight_ != svgHeight) {
    svg.setAttribute('height', svgHeight + 'px');
    svg.cachedHeight_ = svgHeight;
  }

  // Update the scrollbars (if they exist).
  if (this.blockSpace.scrollbarPair) {
    this.blockSpace.scrollbarPair.resize();
  } else {
    this.setBlockSpaceMetricsNoScroll_();
  }
};

Blockly.BlockSpaceEditor.prototype.getWorkspaceTopOffset = function() {
  var svg = this.svg_;
  var containerDiv = svg.parentNode;
  var containerStyle = window.getComputedStyle(containerDiv);
  var containerTopBorder = containerStyle ? (parseInt(containerStyle.borderTopWidth, 10) || 0) : 0;
  return goog.style.getPageOffsetTop(svg) -
    (goog.style.getPageOffsetTop(containerDiv) + containerTopBorder);
};

/**
 * @param {Element} svgElementToAdd
 */
Blockly.BlockSpaceEditor.prototype.appendSVGChild = function(svgElementToAdd) {
  this.svg_.appendChild(svgElementToAdd);
};

/**
 * @returns {!SVGElement}
 */
Blockly.BlockSpaceEditor.prototype.getSVGElement = function() {
  return this.svg_;
};

/**
 * @return {number} Return the width, in pixels, of the blockSpace.
 */
Blockly.BlockSpaceEditor.prototype.getBlockSpaceWidth = function() {
  var metrics = this.blockSpace.getMetrics();
  return metrics ? metrics.viewWidth : 0;
};

/**
 * @return {number} Return the width, in pixels, of the main blockSpace's toolbox.
 * Note, this includes the categories tree (for levels with categories).
 */
Blockly.BlockSpaceEditor.prototype.getToolboxWidth = function() {
  var width = 0;
  var flyout = this.flyout_ || (this.toolbox && this.toolbox.flyout_);
  if (flyout) {
    var metrics = flyout.blockSpace_.getMetrics();
    if (metrics) {
      width = metrics.viewWidth;
    }
  }
  if (this.toolbox) {
    width += this.toolbox.HtmlDiv.getBoundingClientRect().width;
  }
  return width;
};

/**
* Set the cursor to be displayed when over something draggable.
* @param {Blockly.Cursor} cursorType Enum.
*/
Blockly.BlockSpaceEditor.prototype.setCursor = function(cursorType) {
  Blockly.Css.setCursor(cursorType, this.svg_);
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.onKeyDown_ = function(e) {
  if (Blockly.isTargetInput(e)) {
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    this.hideChaff();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    try {
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        this.hideChaff();
        Blockly.selected.dispose(true, true);
      }
    } finally {
      // Stop the browser from going back to the previous page.
      // Use a finally so that any error in delete code above doesn't disappear
      // from the console when the page rolls back.
      e.preventDefault();
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    if (Blockly.selected &&
      Blockly.selected.isDeletable() &&
      Blockly.selected.isCopyable()) {
      this.hideChaff();
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.BlockSpaceEditor.copy_(Blockly.selected);
      } else if (e.keyCode == 88) {
        // 'x' for cut.
        Blockly.BlockSpaceEditor.copy_(Blockly.selected);
        Blockly.selected.dispose(true, true);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboard_) {
        Blockly.focusedBlockSpace.paste(Blockly.clipboard_);
      }
    }
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.BlockSpaceEditor.terminateDrag_ = function() {
  Blockly.Block.terminateDrag_();
  Blockly.Flyout.terminateDrag_();
};

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.BlockSpaceEditor.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom(block);
  Blockly.Xml.deleteNext(xmlBlock);
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', Blockly.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboard_ = {
    dom: xmlBlock,
    sourceBlockSpace: block.blockSpace
  };
};

/**
 * Show the context menu for the blockSpace.
 * @param {!Event} e Mouse event
 * @private
 */
Blockly.BlockSpaceEditor.showContextMenu_ = function(e) {
  if (this.isReadOnly()) {
    return;
  }
  var options = [];

  if (Blockly.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    var topBlocks = this.getTopBlocks(false);
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].isCollapsed()) {
        hasCollapsedBlocks = true;
      } else {
        hasExpandedBlocks = true;
      }
    }

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      for (var i = 0; i < topBlocks.length; i++) {
        topBlocks[i].setCollapsed(true);
      }
    };
    options.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      for (var i = 0; i < topBlocks.length; i++) {
        topBlocks[i].setCollapsed(false);
      }
    };
    options.push(expandOption);
  }

  // Option to get help.
  var helpOption = {enabled: false};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {};
  options.push(helpOption);

  Blockly.ContextMenu.show(e, options);
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.BlockSpaceEditor.prototype.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if (this.toolbox && !opt_allowToolbox &&
    this.toolbox.flyout_ && this.toolbox.flyout_.autoClose) {
    this.toolbox.clearSelection();
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main blockSpace.
 *
 * Returned object may be null, typically if the blockspace is not visible and
 * we are running Firefox.
 *
 * The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object|null} Contains size and position metrics of main blockSpace.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_ = function() {
  /** @type {goog.math.Rect} */
  var blockBoundingRect;

  var svgSize = this.svgSize(); // includes toolbox
  var toolboxWidth = 0;
  if (this.toolbox || this.flyout_) {
    toolboxWidth = this.toolbox ? this.toolbox.width : this.flyout_.width_;
  }
  svgSize.width -= toolboxWidth;
  try {
    var mainCanvasBBox = this.getCanvasBBox(this.blockSpace.getCanvas());
    blockBoundingRect = Blockly.svgRectToRect(mainCanvasBBox);
    if (this.blockSpace.pickedUpBlockOrigin_) {
      // Expand the blockBoundingRect to include origin of block being dragged
      blockBoundingRect.boundingRect(this.blockSpace.pickedUpBlockOrigin_);
    }
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }

  var absoluteLeft = Blockly.RTL ? 0 : toolboxWidth;

  // view*: Viewport dimensions relative to workspace 0,0
  // content*: Bounding rect on actual blocks, relative to workspace 0,0
  // absolute*: Blockspace origin offset from the SVG element origin
  //            (top right of toolbox in LTR, top left of SVG in RTL)
  var viewLeft = this.blockSpace.getScrollOffsetX();
  var viewWidth = svgSize.width;
  var viewHeight = svgSize.height;
  var viewTop = this.blockSpace.getScrollOffsetY();

  return {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    viewTop: viewTop,
    viewLeft: viewLeft,
    contentHeight: blockBoundingRect.height,
    contentWidth: blockBoundingRect.width,
    contentTop: blockBoundingRect.top,
    contentLeft: blockBoundingRect.left,
    absoluteTop: 0,
    absoluteLeft: absoluteLeft
  };
};

/**
 * Gets a bbox
 * May throw error if canvas is hidden in Firefox
 * @param {SVGGElement} canvas - the svg canvas
 * @returns {SVGRect}
 */
Blockly.BlockSpaceEditor.prototype.getCanvasBBox = function(canvas) {
  if (Blockly.isMsie() || Blockly.isTrident()) {
    canvas.style.display = "inline"; // required for IE
    return {
      x: canvas.getBBox().x,
      y: canvas.getBBox().y,
      width: canvas.scrollWidth,
      height: canvas.scrollHeight
    };
  }

  return canvas.getBBox();
};

/**
 * Sets the X/Y translations of the main blockSpace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetrics_ = function(xyRatio) {
  if (!this.blockSpace.scrollbarPair) {
    throw "Attempt to set editor's scroll position without scrollbars.";
  }
  var metrics = this.getBlockSpaceMetrics_();
  var blockSpaceSize = this.blockSpace.getScrollableSize(metrics);
  if (goog.isNumber(xyRatio.x)) {
    this.blockSpace.xOffsetFromView = -blockSpaceSize.width * xyRatio.x;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.blockSpace.yOffsetFromView = -blockSpaceSize.height * xyRatio.y;
  }
  var translation = 'translate(' +
    (this.blockSpace.xOffsetFromView + metrics.absoluteLeft) + ',' +
    (this.blockSpace.yOffsetFromView + metrics.absoluteTop) + ')';
  this.blockSpace.getCanvas().setAttribute('transform', translation);
  this.blockSpace.getDragCanvas().setAttribute('transform', translation);
  this.blockSpace.getBubbleCanvas().setAttribute('transform', translation);
};

/**
 * Sets the X/Y translations of the main blockSpace when scrollbars are
 * disabled.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetricsNoScroll_ = function() {
  var metrics = this.getBlockSpaceMetrics_();
  if (metrics) {
    var translation = 'translate(' + (metrics.absoluteLeft) + ',' +
      (metrics.absoluteTop) + ')';
    this.blockSpace.getCanvas().setAttribute('transform', translation);
    this.blockSpace.getDragCanvas().setAttribute('transform', translation);
    this.blockSpace.getBubbleCanvas().setAttribute('transform',
      translation);
  }
};

/**
 * When something in Blockly's blockSpace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {BindData} Opaque data that can be passed to
 *     removeChangeListener.
 */
Blockly.BlockSpaceEditor.prototype.addChangeListener = function(func) {
  return Blockly.bindEvent_(this.blockSpace.getCanvas(),
    'blocklyBlockSpaceChange', this, func);
};
Blockly.BlockSpaceEditor.prototype.addUnusedBlocksHelpListener = function(func) {
  return Blockly.bindEvent_(this.blockSpace.getCanvas(),
    Blockly.BlockSvgUnused.UNUSED_BLOCK_HELP_EVENT, this, func);
};

/**
 * @returns {boolean}
 */
Blockly.BlockSpaceEditor.prototype.isReadOnly = function() {
  return (Blockly.readOnly || this.readOnly_);
};

/**
 * Stop listening for Blockly's blockSpace changes.
 * @param {BindData} BindData Opaque data from addChangeListener.
 */
Blockly.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData);
};
