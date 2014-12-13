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

/**
 * Class for a top-level block editing blockSpace.
 * Handles constructing a top-level SVG element, and positioning, sizing,
 * and certain focus/mouse handling operations for itself
 * @constructor
 */
Blockly.BlockSpaceEditor = function(container, opt_getMetrics, opt_setMetrics) {
  if (opt_getMetrics) {
    this.getBlockSpaceMetrics_ = opt_getMetrics;
  }
  if (opt_setMetrics) {
    this.setBlockSpaceMetrics_ = opt_setMetrics;
  }
  /**
   * @type {Blockly.BlockSpace}
   */
  this.blockSpace = new Blockly.BlockSpace(this,
    goog.bind(this.getBlockSpaceMetrics_, this),
    goog.bind(this.setBlockSpaceMetrics_, this)
  );
  this.createDom_(container);
  this.init_();
};

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
  var defs = Blockly.createSvgElement('defs', {
    id: 'blocklySvgDefs'
  }, svg);
  this.blockSpace.maxBlocks = Blockly.maxBlocks;

  svg.appendChild(this.blockSpace.createDom());

  if (!Blockly.readOnly) {
    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    this.addToolboxOrFlyout_();
  }

  /**
   * When disabled, we wont allow you to drag blocks into blockSpace
   */
  this.setEnableToolbox = function (enabled) {
    if (this.flyout_) {
      this.flyout_.setEnabled(enabled);
    } else {
      this.toolbox.enabled = enabled;
    }
  };

  svg.appendChild(Blockly.Tooltip.createDom());
  this.svgResize();

  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.WidgetDiv.DIV = goog.dom.createDom('div', 'blocklyWidgetDiv');
  Blockly.WidgetDiv.DIV.style.direction = Blockly.RTL ? 'rtl' : 'ltr';
  document.body.appendChild(Blockly.WidgetDiv.DIV);
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
  var flyoutSvg = flyout.createDom();
  flyout.init(this.blockSpace, true);
  flyout.autoClose = false;
  // Insert the flyout behind the blockSpace so that blocks appear on top.
  goog.dom.insertSiblingBefore(flyoutSvg, this.blockSpace.svgGroup_);

  this.addChangeListener(this.flyoutBumpOrDeleteOutOfBoundsBlocks_);
};

/**
 * When using flyout (as opposed to category toolbox mode):
 * 1. bump out-of-bounds blocks back in
 * 2. delete blocks on top of flyout
 * @private
 */
Blockly.BlockSpaceEditor.prototype.flyoutBumpOrDeleteOutOfBoundsBlocks_ = function() {
  if (Blockly.Block.isDragging()) {
    return;
  }

  var metrics = this.blockSpace.getMetrics();
  var oneOrMoreBlocksOutOfBounds = metrics.contentTop < 0 ||
    metrics.contentTop + metrics.contentHeight >
    metrics.viewHeight + metrics.viewTop ||
    metrics.contentLeft < (Blockly.RTL ? metrics.viewLeft : 0) ||
    metrics.contentLeft + metrics.contentWidth >
    metrics.viewWidth + (Blockly.RTL ? 2 : 1) * metrics.viewLeft;

  if (!oneOrMoreBlocksOutOfBounds) {
    return;
  }

  var MARGIN = 25;
  var overflow;
  var blocks = this.blockSpace.getTopBlocks(false);
  for (var b = 0, block; block = blocks[b]; b++) {
    var blockXY = block.getRelativeToSurfaceXY();
    var blockHW = block.getHeightWidth();
    // Have flyout handle any blocks that have been dropped on it
    if (block.isDeletable() && (Blockly.RTL ?
        blockXY.x - 2 * metrics.viewLeft - metrics.viewWidth :
        -blockXY.x) > MARGIN * 2) {
      this.flyout_.onBlockDropped(block);
      return;
    }
    // Bump any block that's above the top back inside.
    overflow = metrics.viewTop + MARGIN - blockHW.height -
      blockXY.y;
    if (overflow > 0) {
      block.moveBy(0, overflow);
    }
    // Bump any block that's below the bottom back inside.
    overflow = metrics.viewTop + metrics.viewHeight - MARGIN -
      blockXY.y;
    if (overflow < 0) {
      block.moveBy(0, overflow);
    }
    // Bump any block that's off the left back inside.
    overflow = MARGIN + metrics.viewLeft - blockXY.x -
      (Blockly.RTL ? 0 : blockHW.width);
    if (overflow > 0) {
      block.moveBy(overflow, 0);
    }
    // Bump any block that's off the right back inside.
    overflow = metrics.viewLeft + metrics.viewWidth - MARGIN -
      blockXY.x + (Blockly.RTL ? blockHW.width : 0);
    if (overflow < 0) {
      block.moveBy(overflow, 0);
    }
  }
};

Blockly.BlockSpaceEditor.prototype.init_ = function() {
  this.detectBrokenControlPoints();

  // Bind events for scrolling the blockSpace.
  // Most of these events should be bound to the SVG's surface.
  // However, 'mouseup' has to be on the whole document so that a block dragged
  // out of bounds and released will know that it has been released.
  // Also, 'keydown' has to be on the whole document since the browser doesn't
  // understand a concept of focus on the SVG image.
  Blockly.bindEvent_(this.svg_, 'mousedown', this, this.onMouseDown_);
  Blockly.bindEvent_(this.svg_, 'mousemove', this, this.onMouseMove_);
  Blockly.bindEvent_(this.svg_, 'contextmenu', null, Blockly.BlockSpaceEditor.onContextMenu_);
  Blockly.bindEvent_(this.svg_, 'mouseup', this, this.onMouseUp_);
  Blockly.bindEvent_(Blockly.WidgetDiv.DIV, 'contextmenu', null,
    Blockly.BlockSpaceEditor.onContextMenu_);

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

  if (Blockly.languageTree) {
    if (Blockly.hasCategories) {
      this.toolbox.init(this.blockSpace, this);
    } else {
      // Build a fixed flyout with the root blocks.
      this.flyout_.init(this.blockSpace, true);
      this.flyout_.show(Blockly.languageTree.childNodes);
    }
  }
  if (Blockly.hasScrollbars) {
    this.blockSpace.scrollbar = new Blockly.ScrollbarPair(
      this.blockSpace);
    this.blockSpace.scrollbar.resize();
  }

  this.blockSpace.addTrashcan();
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
  var style = window.getComputedStyle(svg);
  var borderWidth = 0;
  if (style) {
    borderWidth = parseInt(style.borderLeftWidth, 10) +
      parseInt(style.borderRightWidth, 10);
  }
  var div = svg.parentNode;
  var width = div.offsetWidth - borderWidth;
  var height = div.offsetHeight;
  if (svg.cachedWidth_ != width) {
    svg.setAttribute('width', width + 'px');
    svg.cachedWidth_ = width;
  }
  if (svg.cachedHeight_ != height) {
    svg.setAttribute('height', height + 'px');
    svg.cachedHeight_ = height;
  }
  // Update the scrollbars (if they exist).
  if (this.blockSpace.scrollbar) {
    this.blockSpace.scrollbar.resize();
  } else {
    this.setBlockSpaceMetricsNoScroll_();
  }
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
  var flyout = this.flyout_ || this.toolbox.flyout_;
  var metrics = flyout.blockSpace_.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;
  if (this.toolbox) {
    width += this.toolbox.HtmlDiv.getBoundingClientRect().width;
  }
  return width;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.onMouseDown_ = function(e) {
  Blockly.BlockSpaceEditor.terminateDrag_(); // In case mouse-up event was lost.
  this.hideChaff();
  var isTargetSvg = e.target && e.target.nodeName &&
    e.target.nodeName.toLowerCase() == 'svg';
  if (!Blockly.readOnly && Blockly.selected && isTargetSvg) {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (Blockly.isRightButton(e)) {
    // Right-click.
    // Unlike google Blockly, we don't want to show a context menu
    // Blockly.showContextMenu_(e);
  } else if ((Blockly.readOnly || isTargetSvg) &&
    this.blockSpace.scrollbar) {
    // If the blockSpace is editable, only allow dragging when gripping empty
    // space.  Otherwise, allow dragging when gripping anywhere.
    this.blockSpace.dragMode = true;
    // Record the current mouse position.
    this.startDragMouseX = e.clientX;
    this.startDragMouseY = e.clientY;
    this.startDragMetrics =
      this.blockSpace.getMetrics();
    this.startScrollX = this.blockSpace.pageXOffset;
    this.startScrollY = this.blockSpace.pageYOffset;

    // Stop the browser from scrolling/zooming the page
    e.preventDefault();
  }
};

/**
 * Handle a mouse-up on SVG drawing surface.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.onMouseUp_ = function(e) {
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  this.blockSpace.dragMode = false;
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.onMouseMove_ = function(e) {
  if (this.blockSpace.dragMode) {
    Blockly.removeAllRanges();
    var dx = e.clientX - this.startDragMouseX;
    var dy = e.clientY - this.startDragMouseY;
    var metrics = this.startDragMetrics;
    var x = this.startScrollX + dx;
    var y = this.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
      metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop -
      metrics.contentHeight);

    // Move the scrollbars and the page will scroll automatically.
    this.blockSpace.scrollbar.set(-x - metrics.contentLeft,
        -y - metrics.contentTop);
  }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.onKeyDown_ = function(e) {
  if (Blockly.BlockSpaceEditor.isTargetInput_(e)) {
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
    if (Blockly.selected && Blockly.selected.isDeletable()) {
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
  var xmlBlock = Blockly.Xml.blockToDom_(block);
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
  if (Blockly.readOnly) {
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
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.BlockSpaceEditor.onContextMenu_ = function(e) {
  if (!Blockly.BlockSpaceEditor.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.BlockSpaceEditor.isTargetInput_ = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text';
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
 * main blockSpace.  The following properties are computed:
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
 * @return {Object} Contains size and position metrics of main blockSpace.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_ = function() {
  var blockBox, leftEdge, rightEdge, topEdge, bottomEdge;

  var svgSize = this.svgSize();
  var toolboxWidth = 0;
  if (this.toolbox || this.flyout_) {
    toolboxWidth = this.toolbox ? this.toolbox.width : this.flyout_.width_;
  }
  svgSize.width -= toolboxWidth;
  var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
  try {
    if (Blockly.isMsie() || Blockly.isTrident()) {
      this.blockSpace.getCanvas().style.display = "inline"; // required for IE
      blockBox = {
        x: this.blockSpace.getCanvas().getBBox().x,
        y: this.blockSpace.getCanvas().getBBox().y,
        width: this.blockSpace.getCanvas().scrollWidth,
        height: this.blockSpace.getCanvas().scrollHeight
      };
    }
    else {
      blockBox = this.blockSpace.getCanvas().getBBox();
    }
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (this.blockSpace.scrollbar) {
    // add some buffer space to the right/below existing contents
    leftEdge = 0;
    rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth, viewWidth * 1.5);
    topEdge = 0;
    bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight, viewHeight * 1.5);

  } else {
    leftEdge = blockBox.x;
    rightEdge = leftEdge + blockBox.width;
    topEdge = blockBox.y;
    bottomEdge = topEdge + blockBox.height;
  }
  var absoluteLeft = Blockly.RTL ? 0 : toolboxWidth;
  return {
    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -this.blockSpace.pageYOffset,
    viewLeft: -this.blockSpace.pageXOffset,
    contentTop: topEdge,
    contentLeft: leftEdge,
    absoluteTop: 0,
    absoluteLeft: absoluteLeft
  };
};

/**
 * Sets the X/Y translations of the main blockSpace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetrics_ = function(xyRatio) {
  if (!this.blockSpace.scrollbar) {
    throw 'Attempt to set editor this scroll without scrollbars.';
  }
  var metrics = this.getBlockSpaceMetrics_();
  if (goog.isNumber(xyRatio.x)) {
    this.blockSpace.pageXOffset = -metrics.contentWidth * xyRatio.x -
      metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.blockSpace.pageYOffset = -metrics.contentHeight * xyRatio.y -
      metrics.contentTop;
  }
  var translation = 'translate(' +
    (this.blockSpace.pageXOffset + metrics.absoluteLeft) + ',' +
    (this.blockSpace.pageYOffset + metrics.absoluteTop) + ')';
  this.blockSpace.getCanvas().setAttribute('transform', translation);
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
    this.blockSpace.getBubbleCanvas().setAttribute('transform',
      translation);
  }
};

/**
 * When something in Blockly's blockSpace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 */
Blockly.BlockSpaceEditor.prototype.addChangeListener = function(func) {
  return Blockly.bindEvent_(this.blockSpace.getCanvas(),
    'blocklyBlockSpaceChange', this, func);
};

/**
 * Stop listening for Blockly's blockSpace changes.
 * @param {!Array.<!Array>} bindData Opaque data from addChangeListener.
 */
Blockly.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData);
};
