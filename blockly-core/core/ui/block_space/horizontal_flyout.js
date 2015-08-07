/**
 * @fileoverview Horizontal flyout tray with no categories.
 */
'use strict';

goog.provide('Blockly.HorizontalFlyout');

goog.require('Blockly.Flyout');
goog.require('Blockly.Block');

/**
 * Class for a horizontal flyout.
 * @constructor
 */
Blockly.HorizontalFlyout = function(blockSpaceEditor) {
  Blockly.Flyout.apply(this, arguments);
  this.autoClose = false;
  this.height_ = 10;
  this.flyoutRows = 0;
  this.customYOffset = 0;
};
goog.inherits(Blockly.HorizontalFlyout, Blockly.Flyout);

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.HorizontalFlyout.prototype.show = function(xmlList) {
  var metrics = this.targetBlockSpace_.getMetrics();
  this.width_ = Math.max(0, metrics.viewWidth - this.CORNER_RADIUS * 2);
  Blockly.HorizontalFlyout.superClass_.show.apply(this, arguments);
};

/**
 * Hide and empty the flyout.
 */
Blockly.HorizontalFlyout.prototype.hide = function() {
  this.height_ = 10;
  this.flyoutRows = 0;
  Blockly.HorizontalFlyout.superClass_.hide.apply(this, arguments);
};

Blockly.HorizontalFlyout.prototype.setVisibility = function(show) {
  if (show) {
    this.softShow();
  } else {
    this.softHide();
  }
};

/**
 * Hides flyout—soft in that it doesn't destroy all flyout blocks
 */
Blockly.HorizontalFlyout.prototype.softHide = function() {
  Blockly.addClass_(this.svgGroup_, 'hiddenFlyout');
};

/**
 * Shows flyout—soft in that it doesn't also populate new blocks
 */
Blockly.HorizontalFlyout.prototype.softShow = function() {
  Blockly.removeClass_(this.svgGroup_, 'hiddenFlyout');
};

/**
 * Move the toolbox to the top of the workspace.
 * @private
 */
Blockly.HorizontalFlyout.prototype.position_ = function() {
  if (!this.isVisible()) {
    return;
  }
  var metrics = this.targetBlockSpace_.getMetrics();
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  var edgeHeight = this.height_ - this.CORNER_RADIUS;
  var edgeWidth = Math.max(0, metrics.viewWidth - this.CORNER_RADIUS * 2);
  var path = ['M 0,0'];
  path.push('v', edgeHeight);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 0,
      this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('h', edgeWidth);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 0,
      this.CORNER_RADIUS,
      -this.CORNER_RADIUS);
  path.push('v', -edgeHeight);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));

  this.width_ = edgeWidth;
  var x = metrics.absoluteLeft;
  var y = metrics.absoluteTop - this.height_ + this.customYOffset;
  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');

  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    this.scrollbar_.resize();
  }

  this.svgBackground_.style.pointerEvents =
    this.scrollbar_ ? 'initial' : 'none';
};

Blockly.HorizontalFlyout.prototype.getYPosition = function () {
  return this.customYOffset || 0;
};

/**
 * Arrange the given block in the flyout, and update cursorX/cursorY.
 * @private
 */
Blockly.HorizontalFlyout.prototype.layoutBlock_ = function(block, cursor, gap,
    initialX) {
  var blockHW = block.getHeightWidth();
  if ((Blockly.RTL && cursor.x - blockHW.width < 0)
      || (!Blockly.RTL && cursor.x + blockHW.width > this.width_)) {
    this.flyoutRows++;
    cursor.y += blockHW.height + gap / 2;
    cursor.x = initialX;
  }
  block.moveBy(cursor.x, cursor.y);
  var offset = blockHW.width + gap / 2;
  if (Blockly.RTL) {
    offset = -offset;
  }
  cursor.x += offset;
  this.height_ = cursor.y + blockHW.height + gap / 2;
};

/**
 * Blocks in HorizontalFlyouts don't get reflowed from their initial position.
 */
Blockly.HorizontalFlyout.prototype.reflow = function() {
};
