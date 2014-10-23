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
Blockly.HorizontalFlyout = function() {
  Blockly.Flyout.call(this);
  this.autoClose = false;
  this.height_ = 100;
};
goog.inherits(Blockly.HorizontalFlyout, Blockly.Flyout);

/**
 * Move the toolbox to the top of the workspace.
 * @private
 */
Blockly.HorizontalFlyout.prototype.position_ = function() {
  if (!this.isVisible()) {
    return;
  }
  var metrics = this.targetWorkspace_.getMetrics();
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  var edgeHeight = this.height_ - this.CORNER_RADIUS;
  var edgeWidth = Math.max(0, metrics.viewWidth - this.CORNER_RADIUS * 2);
  if (Blockly.RTL) {
    edgeWidth *= -1;
  }
  var path = ['M ' + (Blockly.RTL ? this.width_ : 0) + ',0'];
  path.push('v', edgeHeight);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 1 : 0,
      Blockly.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('h', edgeWidth);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 1 : 0,
      this.CORNER_RADIUS,
      Blockly.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS);
  path.push('v', -edgeHeight);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));

  var x = metrics.absoluteLeft;
  if (Blockly.RTL) {
    x += metrics.viewWidth;
    x -= this.width_;
  }
  this.svgGroup_.setAttribute('transform',
          'translate(' + x + ',' + metrics.absoluteTop + ')');

  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    this.scrollbar_.resize();
  }
};

Blockly.HorizontalFlyout.prototype.layoutBlocks_ = function() {
  //
};

/**
 * Compute height of flyout.  Position button under each block.
 * TODO: For RTL: Lay out the blocks right-aligned.
 */
/*Blockly.Flyout.prototype.reflow = function() {
  var flyoutRows = 1;
  var margin = this.CORNER_RADIUS;
  var blocks = this.workspace_.getTopBlocks(false);
  for (var x = 0, block; block = blocks[x]; x++) {
    var blockHW = block.getHeightWidth();
    var blockXY = block.getRelativeToSurfaceXY();
    if (Blockly.RTL) {
      // TODO:
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
  if (this.flyoutRows_ != flyoutRows) {
    // Record the height for .getMetrics_ and .position_.
    this.height_ = flyoutWidth;
    // Fire a resize event to update the flyout's scrollbar.
    Blockly.fireUiEvent(window, 'resize');
  }
};*/
