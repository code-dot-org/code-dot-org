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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvg');

goog.require('goog.userAgent');

var FRAME_MARGIN_SIDE = 15;
var FRAME_MARGIN_TOP = 10;
var FRAME_MARGIN_BOTTOM = 5;

var FRAME_HEADER_HEIGHT = 25;

/**
 * Class for a block's SVG representation.
 * @param {!Blockly.Block} block The underlying block object.
 * @constructor
 */
Blockly.BlockSvg = function(block) {
  this.block_ = block;
  var options = {
    "block-id": block.id
  };
  // Create core elements for the block.
  this.svgGroup_ = Blockly.createSvgElement('g', options, null);

  this.initChildren();
};

Blockly.BlockSvg.prototype.initChildren = function () {
  this.svgPathDark_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1, 1)'},
      this.svgGroup_);
  this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);
  var pattern = this.block_.getFillPattern();
  if (pattern) {
    this.svgPathFill_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);
  }
  this.svgPathLight_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
  this.svgPath_.tooltip = this.block_;
  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  this.updateMovable();
};

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

Blockly.BlockSvg.DISABLED_COLOUR = '#808080';

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.BlockSvg.prototype.init = function() {
  var block = this.block_;
  this.updateColour();
  for (var x = 0, input; input = block.inputList[x]; x++) {
    input.init();
  }
  if (block.mutator) {
    block.mutator.createIcon();
  }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.block_.isMovable()) {
    Blockly.addClass_(this.svgGroup_, 'blocklyDraggable');
    Blockly.removeClass_(this.svgGroup_, 'blocklyUndraggable');
  } else {
    Blockly.removeClass_(this.svgGroup_, 'blocklyDraggable');
    Blockly.addClass_(this.svgGroup_, 'blocklyUndraggable');
  }
  this.updateColour();
};

/**
 * Add or remove the UI indicating if this block is deletable or not.
 */
Blockly.BlockSvg.prototype.updateGrayOutCSS = function() {
  if (this.shouldBeGrayedOut()) {
    Blockly.addClass_(this.svgGroup_, 'blocklyUndeletable');
    Blockly.removeClass_(this.svgGroup_, 'blocklyDeletable');
  } else {
    Blockly.addClass_(this.svgGroup_, 'blocklyDeletable');
    Blockly.removeClass_(this.svgGroup_, 'blocklyUndeletable');
  }
  this.updateColour();
};

/**
 * Get the root SVG element.
 * @return {!Element} The root SVG element.
 */
Blockly.BlockSvg.prototype.getRootElement = function() {
  return this.svgGroup_;
};

// UI constants for rendering blocks.

// Create shortform that we can use locally for readability, while still having
// these exposed externally via Blockly.BlockSvg.
var BS = Blockly.BlockSvg;
/**
 * Horizontal space between elements.
 * @const
 */
BS.SEP_SPACE_X = 10;
/**
 * Vertical space between elements.
 * @const
 */
BS.SEP_SPACE_Y = 10;
/**
 * Vertical padding around inline elements.
 * @const
 */
BS.INLINE_PADDING_Y = 5;
/**
 * Minimum height of a block.
 * @const
 */
BS.MIN_BLOCK_Y = 25;
/**
 * Height of horizontal puzzle tab.
 * @const
 */
BS.TAB_HEIGHT = 20;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
BS.TAB_WIDTH = 8;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
BS.NOTCH_WIDTH = 30;

/**
 * Rounded corner radius.
 * @const
 */
BS.CORNER_RADIUS = 8;
/**
 * Minimum height of title rows.
 * @const
 */
BS.TITLE_HEIGHT = 18;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
BS.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) * (BS.CORNER_RADIUS - 1) + 1;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
BS.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) * (BS.CORNER_RADIUS + 1) - 1;

BS.NOTCH_PATH_WIDTH = 15;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
BS.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
BS.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
BS.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
BS.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
BS.JAGGED_TEETH_HEIGHT = 20;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
BS.TAB_PATH_DOWN = 'v 5 c 0,10 -' + BS.TAB_WIDTH +
    ',-8 -' + BS.TAB_WIDTH + ',7.5 s ' +
    BS.TAB_WIDTH + ',-2.5 ' + BS.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
BS.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (BS.TAB_WIDTH * 0.98) + ',2.5 q -' +
    (BS.TAB_WIDTH * .05) + ',10 ' +
    (BS.TAB_WIDTH * .27) + ',10 m ' +
    (BS.TAB_WIDTH * .71) + ',-2.5 v 1.5';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
BS.TOP_LEFT_CORNER_START =
    'm 0,' + BS.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
BS.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + BS.DISTANCE_45_INSIDE + ',' +
    BS.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
BS.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR = 'm 1,' + (BS.CORNER_RADIUS - 1);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
BS.TOP_LEFT_CORNER =
    'A ' + BS.CORNER_RADIUS + ',' +
    BS.CORNER_RADIUS + ' 0 0,1 ' +
    BS.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
BS.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (BS.CORNER_RADIUS - 1) + ',' +
    (BS.CORNER_RADIUS - 1) + ' 0 0,1 ' +
    BS.CORNER_RADIUS + ',1';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
BS.INNER_TOP_LEFT_CORNER =
    BS.NOTCH_PATH_RIGHT + ' h -' +
    (BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH -
    BS.CORNER_RADIUS) +
    ' a ' + BS.CORNER_RADIUS + ',' +
    BS.CORNER_RADIUS + ' 0 0,0 -' +
    BS.CORNER_RADIUS + ',' +
    BS.CORNER_RADIUS;
/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
BS.INNER_BOTTOM_LEFT_CORNER =
    'a ' + BS.CORNER_RADIUS + ',' +
    BS.CORNER_RADIUS + ' 0 0,0 ' +
    BS.CORNER_RADIUS + ',' +
    BS.CORNER_RADIUS;
/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
BS.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (BS.CORNER_RADIUS + 1) + ',' +
    (BS.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (-BS.DISTANCE_45_OUTSIDE - 1) + ',' +
    (BS.CORNER_RADIUS -
    BS.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (BS.CORNER_RADIUS + 1) + ',' +
    (BS.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (BS.CORNER_RADIUS + 1) + ',' +
    (BS.CORNER_RADIUS + 1);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (BS.CORNER_RADIUS + 1) + ',' +
    (BS.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (BS.CORNER_RADIUS -
    BS.DISTANCE_45_OUTSIDE) + ',' +
    (BS.DISTANCE_45_OUTSIDE + 1);

/**
 * Given a value, returns that value, or the opposite if RTL is true.
 */
function oppositeIfRTL(val) {
  return Blockly.RTL ? -val : val;
}

/**
 * Dispose of this SVG block.
 */
Blockly.BlockSvg.prototype.dispose = function() {
  goog.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  // Break circular references.
  this.block_ = null;
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  Blockly.playAudio('delete');

  var xy = Blockly.getSvgXY_(this.svgGroup_);
  // Deeply clone the current block.
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform',
      'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
  Blockly.svg.appendChild(clone);
  if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
      clone.style.display = "inline";   /* reqd for IE */
      clone.bBox_ = {
          x: clone.getBBox().x,
          y: clone.getBBox().y,
          width: clone.scrollWidth,
          height: clone.scrollHeight
      };
  }
  else {
      clone.bBox_ = clone.getBBox();
  }
  // Start the animation.
  clone.startDate_ = new Date();
  Blockly.BlockSvg.disposeUiStep_(clone);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function(clone) {
  var ms = (new Date()) - clone.startDate_;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ + oppositeIfRTL(clone.bBox_.width / 2 * percent);
    var y = clone.translateY_ + clone.bBox_.height * percent;
    var translate = x + ', ' + y;
    var scale = 1 - percent;
    clone.setAttribute('transform', 'translate(' + translate + ')' +
        ' scale(' + scale + ')');
    var closure = function() {
      Blockly.BlockSvg.disposeUiStep_(clone);
    };
    window.setTimeout(closure, 10);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
Blockly.BlockSvg.prototype.connectionUiEffect = function() {
  Blockly.playAudio('click');

  // Determine the absolute coordinates of the inferior block.
  var xy = Blockly.getSvgXY_(this.svgGroup_);
  // Offset the coordinates based on the two connection types.
  if (this.block_.outputConnection) {
    xy.x += oppositeIfRTL(-3);
    xy.y += 13;
  } else if (this.block_.previousConnection) {
    xy.x += oppositeIfRTL(23);
    xy.y += 3;
  }
  var ripple = Blockly.createSvgElement('circle',
      {'cx': xy.x, 'cy': xy.y, 'r': 0, 'fill': 'none',
       'stroke': '#888', 'stroke-width': 10},
      Blockly.svg);
  // Start the animation.
  ripple.startDate_ = new Date();
  Blockly.BlockSvg.connectionUiStep_(ripple);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @private
 */
Blockly.BlockSvg.connectionUiStep_ = function(ripple) {
  var ms = (new Date()) - ripple.startDate_;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockSvg.connectionUiStep_(ripple);
    };
    window.setTimeout(closure, 10);
  }
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.block_.disabled) {
    // Disabled blocks don't have colour.
    return;
  }

  var hexColour;

  if (this.shouldBeGrayedOut()) {
    hexColour = BS.DISABLED_COLOUR;
  } else {
    hexColour = this.block_.getHexColour();
  }

  this.updateToColour_(hexColour);
};

/**
 * @param {string} hexColour the colour to update to, in hexadecimal
 * @private
 */
Blockly.BlockSvg.prototype.updateToColour_ = function(hexColour) {
  var rgb = goog.color.hexToRgb(hexColour);
  var rgbLight = goog.color.lighten(rgb, 0.3);
  var rgbDark = goog.color.darken(rgb, 0.4);
  this.svgPathLight_.setAttribute('stroke', goog.color.rgbArrayToHex(rgbLight));
  this.svgPathDark_.setAttribute('fill', goog.color.rgbArrayToHex(rgbDark));
  this.svgPath_.setAttribute('fill', hexColour);
  var pattern = this.block_.getFillPattern();
  if (pattern) {
    this.svgPathFill_.setAttribute('fill', 'url(#' + pattern + ')');
  }
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if (this.block_.disabled || this.block_.getInheritedDisabled()) {
    Blockly.addClass_(this.svgGroup_, 'blocklyDisabled');
    this.svgPath_.setAttribute('fill', 'url(#blocklyDisabledPattern)');
  } else {
    Blockly.removeClass_(this.svgGroup_, 'blocklyDisabled');
    this.updateColour();
  }
  var children = this.block_.getChildren();
  for (var x = 0, child; child = children[x]; x++) {
    child.svg_.updateDisabled();
  }
};

Blockly.BlockSvg.prototype.shouldBeGrayedOut = function() {
  return Blockly.grayOutUndeletableBlocks && !this.block_.isDeletable() && !Blockly.readOnly &&
    this.block_.type !== 'when_run';
}

/**
 * Select this block.  Highlight it visually.  Move to top of the stack.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.addClass_(this.svgGroup_, 'blocklySelected');
  // Move the selected block to the top of the stack.
  this.svgGroup_.parentNode.appendChild(this.svgGroup_);
};

/**
 * Select this block.  Highlight it visually.  Needed for toolbox scenarios
 * because IE will lose mouseout events if addSelect() is called in the hover
 * case.
 */
Blockly.BlockSvg.prototype.addSelectNoMove = function() {
  Blockly.addClass_(this.svgGroup_, 'blocklySelected');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.removeClass_(this.svgGroup_, 'blocklySelected');
};

/**
 * Adds the dragging class to this block.
 * Also disables the highlights/shadows to improve performance.
 */
Blockly.BlockSvg.prototype.addDragging = function() {
  Blockly.addClass_(this.svgGroup_, 'blocklyDragging');
};

/**
 * Removes the dragging class from this block.
 */
Blockly.BlockSvg.prototype.removeDragging = function() {
  Blockly.removeClass_(this.svgGroup_, 'blocklyDragging');
};

/**
 * Adds the spotlight class to this block.
 */
Blockly.BlockSvg.prototype.addSpotlight = function() {
  Blockly.addClass_(this.svgGroup_, 'blocklySpotlight');
};

/**
 * Removes the spotlight class from this block.
 */
Blockly.BlockSvg.prototype.removeSpotlight = function() {
  Blockly.removeClass_(this.svgGroup_, 'blocklySpotlight');
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.BlockSvg.prototype.render = function() {
  this.block_.rendered = true;

  var cursorX = oppositeIfRTL(BS.SEP_SPACE_X);
  // Move the icons into position.
  var icons = this.block_.getIcons();
  for (var x = 0; x < icons.length; x++) {
    cursorX = icons[x].renderIcon(cursorX);
  }
  cursorX -= oppositeIfRTL(BS.SEP_SPACE_X);
  // If there are no icons, cursorX will be 0, otherwise it will be the
  // width that the first label needs to move over by.

  var inputRows = this.renderCompute_(cursorX);
  this.renderDraw_(cursorX, inputRows);

  // Render all blocks above this one (propagate a reflow).
  var parentBlock = this.block_.getParent();
  if (parentBlock) {
    parentBlock.render();
  } else {
    // Top-most block.  Fire an event to allow scrollbars to resize.
    Blockly.fireUiEvent(window, 'resize');
  }
};

/**
 * Render a list of titles starting at the specified location.
 * @param {!Array.<!Blockly.Field>} titleList List of titles.
 * @param {number} cursorX X-coordinate to start the titles.
 * @param {number} cursorY Y-coordinate to start the titles.
 * @return {number} X-coordinate of the end of the title row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderTitles_ = function(titleList,
                                                    cursorX, cursorY) {
  if (Blockly.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, title; title = titleList[t]; t++) {
    // Get the dimensions of the title.
    var titleSize = title.getSize();
    var titleWidth = titleSize.width;

    if (Blockly.RTL) {
      cursorX -= titleWidth;
      title.getRootElement().setAttribute('transform',
          'translate(' + cursorX + ', ' + cursorY + ')');
      if (titleWidth) {
        cursorX -= BS.SEP_SPACE_X;
      }
    } else {
      title.getRootElement().setAttribute('transform',
          'translate(' + cursorX + ', ' + cursorY + ')');
      if (titleWidth) {
        cursorX += titleWidth + BS.SEP_SPACE_X;
      }
    }
  }
  return oppositeIfRTL(cursorX);
};

/**
 * Computes the height and widths for each row and title.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.block_.inputList;
  var inputRows = [];
  inputRows.rightEdge = iconWidth + BS.SEP_SPACE_X * 2;
  if (this.block_.previousConnection || this.block_.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        BS.NOTCH_WIDTH + BS.SEP_SPACE_X);
  }
  var titleValueWidth = 0;  // Width of longest external value title.
  var titleStatementWidth = 0;  // Width of longest statement title.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var currentRow;
  for (var i = 0, input; input = inputList[i]; i++) {
    if (!input.isVisible()) {
      continue;
    }

    // Each row will contain one or more inputs. As we parse the inputs, we
    // either append it to the current row if it's inlined, or create a new row
    // if it isn't.  See Input.isInline/Input.setInline for further explanation
    // on how we determine whether an input is inlined.
    if (i === 0 || !input.isInline()) {
      // Create new row.
      currentRow = [];
      currentRow.type = input.type;
      currentRow.height = 0;
      inputRows.push(currentRow);
    }
    if (currentRow.length > 0) {
      currentRow.type = BS.INLINE;
    }
    currentRow.push(input);

    var renderSize = inputRenderSize(input);
    input.renderHeight = renderSize.height;
    input.renderWidth = renderSize.width;

    currentRow.height = Math.max(currentRow.height, input.renderHeight);

    var titleSize = inputTitleRenderSize(input, i === 0 ? iconWidth : 0);
    input.titleWidth = titleSize.width;
    currentRow.height = Math.max(currentRow.height, titleSize.height);

    if (currentRow.type != BS.INLINE) {
      if (currentRow.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        titleStatementWidth = Math.max(titleStatementWidth, input.titleWidth);
      } else {
        if (currentRow.type == Blockly.INPUT_VALUE) {
          hasValue = true;
        } else if (currentRow.type == Blockly.DUMMY_INPUT) {
          hasDummy = true;
        }
        titleValueWidth = Math.max(titleValueWidth, input.titleWidth);
      }
    }
  }

  thickenInlineRows(inputRows);

  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = 2 * BS.SEP_SPACE_X + titleStatementWidth;
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  // This is the width of the block where external inputs connect.
  if (hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        inputRows.statementEdge + BS.NOTCH_WIDTH);
  }
  if (hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, titleValueWidth +
        BS.SEP_SPACE_X * 2 + BS.TAB_WIDTH);
  } else if (hasDummy) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, titleValueWidth +
        BS.SEP_SPACE_X * 2);
  }

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;

  // rightEdgeWithoutInline is used to know how deep to draw our next statement
  // inputs
  inputRows.rightEdgeWithoutInline = inputRows.rightEdge;

  // see if our inline rows push out our right edge
  for (i = 0; currentRow = inputRows[i]; i++) {
    if (currentRow.type === BS.INLINE) {
      inputRows.rightEdge = Math.max(inputRows.rightEdge,
        widthInlineRow(currentRow));
    }
  }

  return inputRows;
};

/**
 * Make inline rows a bit thicker in order to enclose the values. Note: has
 * side effects
 */
function thickenInlineRows (inputRows) {
  var row;
  for (var y = 0; row = inputRows[y]; y++) {
    row.thicker = false;
    if (row.type == BS.INLINE) {
      for (var z = 0, input; input = row[z]; z++) {
        if (input.type == Blockly.INPUT_VALUE) {
          row.height += 2 * BS.INLINE_PADDING_Y;
          row.thicker = true;
          break;
        }
      }
    }
  }
}

/**
 * Calculate the render width and height of a given input
 */
function inputRenderSize (input) {
  // Compute minimum input size.
  var renderHeight = BS.MIN_BLOCK_Y;
  var renderWidth = BS.TAB_WIDTH + BS.SEP_SPACE_X;

  // Expand input size if there is a connection.
  if (input.connection && input.connection.targetConnection) {
    var linkedBlock = input.connection.targetBlock();
    var bBox = linkedBlock.getHeightWidth();
    renderHeight = Math.max(renderHeight, bBox.height);
    renderWidth = Math.max(renderWidth, bBox.width);
  }

  return {
    width: renderWidth,
    height: renderHeight
  };
}

/**
 * Given an input, calculates the render width/height of the title(s).
 */
function inputTitleRenderSize (input, iconWidth) {
  var width = oppositeIfRTL(iconWidth);
  var height = 0;
  var titleSize;

  for (var j = 0, title; title = input.titleRow[j]; j++) {
    if (j != 0) {
      width += BS.SEP_SPACE_X;
    }
    // Get the dimensions of the title.
    titleSize = title.getSize();
    width += titleSize.width;
    height = Math.max(height, titleSize.height);
  }

  return {
    width: width,
    height: height
  };
}

/**
 * Given a row, calculates the width, including padding, from the set of inputs
 */
function widthInlineRow(row) {
  var width = BS.SEP_SPACE_X;
  for (var i = 0, input; input = row[i]; i++) {
    width += input.renderWidth + BS.SEP_SPACE_X;
  }

  return width;
}

/**
 * Draw the path of the block.
 * Move the titles to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  // Should the top and bottom left corners be rounded or square?
  if (this.block_.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true;
  } else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    // If this block is in the middle of a stack, square the corners.
    if (this.block_.previousConnection) {
      var prevBlock = this.block_.previousConnection.targetBlock();
      if (prevBlock && prevBlock.nextConnection &&
          prevBlock.nextConnection.targetConnection ==
          this.block_.previousConnection) {
        this.squareTopLeftCorner_ = true;
       }
    }
    if (this.block_.nextConnection) {
      var nextBlock = this.block_.nextConnection.targetBlock();
      if (nextBlock && nextBlock.previousConnection &&
          nextBlock.previousConnection.targetConnection ==
          this.block_.nextConnection) {
        this.squareBottomLeftCorner_ = true;
      }
    }
  }

  // Fetch the block's coordinates on the surface for use in anchoring
  // the connections.
  var connectionsXY = this.block_.getRelativeToSurfaceXY();

  // Assemble the block's path.
  var steps = {
    core: [],
    inline: [],
    // The highlighting applies to edges facing the upper-left corner.
    // Since highlighting is a two-pixel wide border, it would normally overhang
    // the edge of the block by a pixel. So undersize all measurements by a pixel.
    highlight: [],
    highlightInline: []
  }

  this.renderDrawTop_(steps, connectionsXY, inputRows.rightEdge);

  var cursorY = this.renderDrawRight_(steps, connectionsXY, inputRows, iconWidth);
  this.renderDrawBottom_(steps, connectionsXY, cursorY);
  this.renderDrawLeft_(steps, connectionsXY, cursorY);

  var pathString = steps.core.join(' ') + '\n' + steps.inline.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  if (this.svgPathFill_) {
    this.svgPathFill_.setAttribute('d', pathString);
  }
  this.svgPathDark_.setAttribute('d', pathString);
  pathString = steps.highlight.join(' ') + '\n' + steps.highlightInline.join(' ');
  this.svgPathLight_.setAttribute('d', pathString);
  if (Blockly.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Render the top edge of the block.
 * @param {!Object} steps Current state of our paths
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ =
    function(steps, connectionsXY, rightEdge) {
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.core.push('m 0,0');
    steps.highlight.push('m 1,1');
  } else {
    steps.core.push(BS.TOP_LEFT_CORNER_START);
    steps.highlight.push(Blockly.RTL ?
        BS.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        BS.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.core.push(BS.TOP_LEFT_CORNER);
    steps.highlight.push(BS.TOP_LEFT_CORNER_HIGHLIGHT);
  }
  if (Blockly.BROKEN_CONTROL_POINTS) {
    /* HACK:
     WebKit bug 67298 causes control points to be included in the reported
     bounding box.  Add 5px control point to the top of the path.
    */
    steps.core.push('c 0,5 0,-5 0,0');
  }

  // Top edge.
  if (this.block_.previousConnection) {
    steps.core.push('H', BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH);
    steps.highlight.push('H', BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH);
    steps.core.push(BS.NOTCH_PATH_LEFT);
    steps.highlight.push(BS.NOTCH_PATH_LEFT_HIGHLIGHT);
    // Create previous block connection.
    var connectionX = connectionsXY.x + oppositeIfRTL(BS.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.block_.previousConnection.moveTo(connectionX, connectionY);
    // This connection will be tightened when the parent renders.
  }
  steps.core.push('H', rightEdge);
  steps.highlight.push('H', rightEdge + (Blockly.RTL ? -1 : 0));
};

/**
 * Render the right edge of the block.
 * @param {!Object} steps Current state of our paths
 * @param {!Object} connectionsXY Location of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps, connectionsXY,
    inputRows, iconWidth) {
  var cursorX;
  var cursorY = 0;
  var connectionX, connectionY;
  for (var y = 0, row; row = inputRows[y]; y++) {
    cursorX = BS.SEP_SPACE_X;
    if (y == 0) {
      cursorX += oppositeIfRTL(iconWidth);
    }
    steps.highlight.push('M', (inputRows.rightEdge - 1) + ',' + (cursorY + 1));
    if (this.block_.isCollapsed()) {
      // Jagged right edge.
      var input = row[0];
      var titleX = cursorX;
      var titleY = cursorY + BS.TITLE_HEIGHT;
      this.renderTitles_(input.titleRow, titleX, titleY);
      steps.core.push(BS.JAGGED_TEETH);
      if (Blockly.RTL) {
        steps.highlight.push('l 8,0 0,3.8 7,3.2 m -14.5,9 l 8,4');
      } else {
        steps.highlight.push('h 8');
      }
      var remainder = row.height - BS.JAGGED_TEETH_HEIGHT;
      steps.core.push('v', remainder);
      if (Blockly.RTL) {
        steps.highlight.push('v', remainder - 2);
      }
    } else if (row.type == BS.INLINE) {
      // Inline inputs.
      for (var x = 0, input; input = row[x]; x++) {
        var titleX = cursorX;
        var titleY = cursorY + BS.TITLE_HEIGHT;
        if (row.thicker) {
          // Lower the title slightly.
          titleY += BS.INLINE_PADDING_Y;
        }
        // TODO: Align inline title rows (left/right/centre).
        cursorX = this.renderTitles_(input.titleRow, titleX, titleY);
        if (input.type != Blockly.DUMMY_INPUT) {
          cursorX += input.renderWidth + BS.SEP_SPACE_X;
        }
        if (input.type == Blockly.INPUT_VALUE) {
          steps.inline.push('M', (cursorX - BS.SEP_SPACE_X) +
                           ',' + (cursorY + BS.INLINE_PADDING_Y));
          steps.inline.push('h', BS.TAB_WIDTH - input.renderWidth);
          steps.inline.push(BS.TAB_PATH_DOWN);
          steps.inline.push('v', input.renderHeight -
                                BS.TAB_HEIGHT);
          steps.inline.push('h', input.renderWidth - BS.TAB_WIDTH);
          steps.inline.push('z');
          if (Blockly.RTL) {
            // Highlight right edge, around back of tab, and bottom.
            steps.highlightInline.push('M',
                (cursorX - BS.SEP_SPACE_X +
                 BS.TAB_WIDTH - input.renderWidth - 1) + ',' +
                (cursorY + BS.INLINE_PADDING_Y + 1));
            steps.highlightInline.push(
                BS.TAB_PATH_DOWN_HIGHLIGHT_RTL);
            steps.highlightInline.push('v',
                input.renderHeight - BS.TAB_HEIGHT + 2);
            steps.highlightInline.push('h',
                input.renderWidth - BS.TAB_WIDTH);
          } else {
            // Highlight right edge, bottom, and glint at bottom of tab.
            steps.highlightInline.push('M',
                (cursorX - BS.SEP_SPACE_X + 1) + ',' +
                (cursorY + BS.INLINE_PADDING_Y + 1));
            steps.highlightInline.push('v', input.renderHeight);
            steps.highlightInline.push('h', BS.TAB_WIDTH -
                                           input.renderWidth);
            steps.highlightInline.push('M',
                (cursorX - input.renderWidth - BS.SEP_SPACE_X +
                 3.8) + ',' + (cursorY + BS.INLINE_PADDING_Y +
                 BS.TAB_HEIGHT - 0.4));
            steps.highlightInline.push('l',
                (BS.TAB_WIDTH * 0.42) + ',-1.8');
          }
          // Create inline input connection.

          connectionX = connectionsXY.x + oppositeIfRTL(cursorX +
                BS.TAB_WIDTH - BS.SEP_SPACE_X -
                input.renderWidth + 1);

          connectionY = connectionsXY.y + cursorY +
              BS.INLINE_PADDING_Y;
          input.connection.moveTo(connectionX, connectionY);
          if (input.connection.targetConnection) {
            input.connection.tighten_();
          }
        }
      }

      cursorX = Math.max(cursorX, inputRows.rightEdge);
      steps.core.push('H', cursorX);
      steps.highlight.push('H', cursorX + (Blockly.RTL ? -1 : 0));
      steps.core.push('v', row.height);
      if (Blockly.RTL) {
        steps.highlight.push('v', row.height - 2);
      }
    } else if (row.type == Blockly.INPUT_VALUE) {
      // External input.
      var input = row[0];
      var titleX = cursorX;
      var titleY = cursorY + BS.TITLE_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var titleRightX = inputRows.rightEdge - input.titleWidth -
            BS.TAB_WIDTH - 2 * BS.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          titleX += titleRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          titleX += (titleRightX + titleX) / 2;
        }
      }
      this.renderTitles_(input.titleRow, titleX, titleY);
      steps.core.push(BS.TAB_PATH_DOWN);
      steps.core.push('v', row.height - BS.TAB_HEIGHT);
      if (Blockly.RTL) {
        // Highlight around back of tab.
        steps.highlight.push(BS.TAB_PATH_DOWN_HIGHLIGHT_RTL);
        steps.highlight.push('v', row.height - BS.TAB_HEIGHT);
      } else {
        // Short highlight glint at bottom of tab.
        steps.highlight.push('M', (inputRows.rightEdge - 4.2) + ',' +
            (cursorY + BS.TAB_HEIGHT - 0.4));
        steps.highlight.push('l', (BS.TAB_WIDTH * 0.42) +
            ',-1.8');
      }
      // Create external input connection.
      connectionX = connectionsXY.x + oppositeIfRTL(inputRows.rightEdge + 1);
      connectionY = connectionsXY.y + cursorY;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
      }
    } else if (row.type == Blockly.DUMMY_INPUT) {
      // External naked title.
      var input = row[0];
      var titleX = cursorX;
      var titleY = cursorY + BS.TITLE_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var titleRightX = inputRows.rightEdge - input.titleWidth -
            2 * BS.SEP_SPACE_X;
        if (inputRows.hasValue) {
          titleRightX -= BS.TAB_WIDTH;
        }
        if (input.align == Blockly.ALIGN_RIGHT) {
          titleX += titleRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          titleX += (titleRightX + titleX) / 2;
        }
      }
      this.renderTitles_(input.titleRow, titleX, titleY);
      steps.core.push('v', row.height);
      if (Blockly.RTL) {
        steps.highlight.push('v', row.height - 2);
      }
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      // Nested statement.
      var input = row[0];
      if (y == 0) {
        // If the first input is a statement stack, add a small row on top.
        steps.core.push('v', BS.SEP_SPACE_Y);
        if (Blockly.RTL) {
          steps.highlight.push('v', BS.SEP_SPACE_Y - 1);
        }
        cursorY += BS.SEP_SPACE_Y;
      }
      var titleX = cursorX;
      var titleY = cursorY + BS.TITLE_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var titleRightX = inputRows.statementEdge - input.titleWidth -
            2 * BS.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          titleX += titleRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          titleX += (titleRightX + titleX) / 2;
        }
      }
      this.renderTitles_(input.titleRow, titleX, titleY);
      cursorX = inputRows.statementEdge + BS.NOTCH_WIDTH;
      steps.core.push('H', cursorX);
      steps.core.push(BS.INNER_TOP_LEFT_CORNER);
      steps.core.push('v', row.height - 2 * BS.CORNER_RADIUS);
      steps.core.push(BS.INNER_BOTTOM_LEFT_CORNER);
      steps.core.push('H', inputRows.rightEdgeWithoutInline);
      if (Blockly.RTL) {
        steps.highlight.push('M',
            (cursorX - BS.NOTCH_WIDTH +
             BS.DISTANCE_45_OUTSIDE) +
            ',' + (cursorY + BS.DISTANCE_45_OUTSIDE));
        steps.highlight.push(
            BS.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
        steps.highlight.push('v',
            row.height - 2 * BS.CORNER_RADIUS);
        steps.highlight.push(
            BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
        steps.highlight.push('H', inputRows.rightEdgeWithoutInline - 1);
      } else {
        steps.highlight.push('M',
            (cursorX - BS.NOTCH_WIDTH +
             BS.DISTANCE_45_OUTSIDE) + ',' +
            (cursorY + row.height - BS.DISTANCE_45_OUTSIDE));
        steps.highlight.push(
            BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
        steps.highlight.push('H', inputRows.rightEdgeWithoutInline);
      }
      // Create statement connection.
      connectionX = connectionsXY.x + oppositeIfRTL(cursorX);
      connectionY = connectionsXY.y + cursorY + 1;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
      }
      if (y == inputRows.length - 1 ||
          inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
        // If the final input is a statement stack, add a small row underneath.
        // Consecutive statement stacks are also separated by a small divider.
        steps.core.push('v', BS.SEP_SPACE_Y);
        if (Blockly.RTL) {
          steps.highlight.push('v', BS.SEP_SPACE_Y - 1);
        }
        cursorY += BS.SEP_SPACE_Y;
      }
    }
    cursorY += row.height;
  }
  if (!inputRows.length) {
    cursorY = BS.MIN_BLOCK_Y;
    steps.core.push('V', cursorY);
    if (Blockly.RTL) {
      steps.highlight.push('V', cursorY - 1);
    }
  }
  return cursorY;
};

/**
 * Render the bottom edge of the block.
 * @param {!Object} steps Current state of our paths
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(steps, connectionsXY,
    cursorY) {
  if (Blockly.BROKEN_CONTROL_POINTS) {
    /* HACK:
     WebKit bug 67298 causes control points to be included in the reported
     bounding box.  Add 5px control point to the bottom of the path.
    */
    steps.core.push('c 0,5 0,-5 0,0');
  }

  if (this.block_.nextConnection) {
    steps.core.push('H', BS.NOTCH_WIDTH + ' ' +
        BS.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX = connectionsXY.x + oppositeIfRTL(BS.NOTCH_WIDTH);
    var connectionY = connectionsXY.y + cursorY + 1;
    this.block_.nextConnection.moveTo(connectionX, connectionY);
    if (this.block_.nextConnection.targetConnection) {
      this.block_.nextConnection.tighten_();
    }
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.core.push('H 0');
    if (!Blockly.RTL) {
      steps.highlight.push('M', '1,' + cursorY);
    }
  } else {
    steps.core.push('H', BS.CORNER_RADIUS);
    steps.core.push('a', BS.CORNER_RADIUS + ',' +
               BS.CORNER_RADIUS + ' 0 0,1 -' +
               BS.CORNER_RADIUS + ',-' +
               BS.CORNER_RADIUS);
    if (!Blockly.RTL) {
      steps.highlight.push('M', BS.DISTANCE_45_INSIDE + ',' +
          (cursorY - BS.DISTANCE_45_INSIDE));
      steps.highlight.push('A', (BS.CORNER_RADIUS - 1) + ',' +
          (BS.CORNER_RADIUS - 1) + ' 0 0,1 ' +
          '1,' + (cursorY - BS.CORNER_RADIUS));
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Object} steps Current state of our paths
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function(steps, connectionsXY,
    cursorY) {
  if (this.block_.outputConnection) {
    // Create output connection.
    this.block_.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
    // This connection will be tightened when the parent renders.
    steps.core.push('V', BS.TAB_HEIGHT);
    steps.core.push('c 0,-10 -' + BS.TAB_WIDTH + ',8 -' +
        BS.TAB_WIDTH + ',-7.5 s ' + BS.TAB_WIDTH +
        ',2.5 ' + BS.TAB_WIDTH + ',-7.5');
    if (Blockly.RTL) {
      steps.highlight.push('M', (BS.TAB_WIDTH * -0.3) + ',8.9');
      steps.highlight.push('l', (BS.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      steps.highlight.push('V', BS.TAB_HEIGHT - 1);
      steps.highlight.push('m', (BS.TAB_WIDTH * -0.92) +
                          ',-1 q ' + (BS.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      steps.highlight.push('m', (BS.TAB_WIDTH * 0.92) +
                          ',1 V 1 H 2');
    }
  } else if (!Blockly.RTL) {
    if (this.squareTopLeftCorner_) {
      steps.highlight.push('V', 1);
    } else {
      steps.highlight.push('V', BS.CORNER_RADIUS);
    }
  }
  steps.core.push('z');
};

/**
  * Set the blocks visibility.
  * @param {string} visible Whether or not the block should be visible
  */
Blockly.BlockSvg.prototype.setVisible = function (visible) {
  this.svgGroup_.style.display = visible ? "" : "none";
};
