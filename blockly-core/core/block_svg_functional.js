/**
 * @fileoverview Extension of BlockSvg that allows for some settings specific
 * to functional blocks, including having a header row and a backdrop pattern.
 */
'use strict';

goog.provide('Blockly.BlockSvgFunctional');

/**
 * Render this block with a header row that has a different color.
 */
Blockly.BlockSvgFunctional = function (block, options) {
  options = options || {};
  this.headerHeight = options.headerHeight;
  this.rowBuffer = options.rowBuffer || 0;
  this.patternId_ = null; // updated when we set colour

  Blockly.BlockSvg.call(this, block);
};

goog.inherits(Blockly.BlockSvgFunctional, Blockly.BlockSvg);

Blockly.BlockSvgFunctional.prototype.initChildren = function () {
  var rgb = Blockly.makeColour(this.block_.getColour(),
    this.block_.getSaturation(), this.block_.getValue());
  var lightColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.3);
  var lighterColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.8);

  this.backdrop_ = Blockly.createSvgElement('rect', {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    fill: 'url(#' + this.patternId_ + ')',
    'clip-path': 'url(#blockClip' + this.block_.id + ')'
  }, this.svgGroup_);

  goog.base(this, 'initChildren');

  var clip = Blockly.createSvgElement('clipPath', {
    id: 'blockClip' + this.block_.id
  }, this.svgGroup_);
  this.blockClipRect_ = Blockly.createSvgElement('path', {}, clip);
  this.divider_ = Blockly.createSvgElement('rect', {
    x: 1,
    y: this.headerHeight,
    height: 3,
    width: 0,
    fill: goog.color.rgbArrayToHex(lightColor),
    'clip-path': 'url(#blockClip' + this.block_.id + ')',
    visibility: this.headerHeight > 0 ? 'visible' : 'hidden'
  }, this.svgGroup_);
};

Blockly.BlockSvgFunctional.prototype.renderDraw_ = function(iconWidth, inputRows) {
  goog.base(this, 'renderDraw_', iconWidth, inputRows);

  this.blockClipRect_.setAttribute('d', this.svgPath_.getAttribute('d'));

  var rect = this.svgPath_.getBBox();
  this.backdrop_.setAttribute('height', rect.height);
  this.backdrop_.setAttribute('width', rect.width);
  this.divider_.setAttribute('width', rect.width - 2);
};

Blockly.BlockSvgFunctional.prototype.renderDrawRight_ = function(renderInfo,
    connectionsXY, inputRows, iconWidth) {

  // add a little bit of extra buffer space on top so that our notch doesn't
  // cut into our titles
  if (this.rowBuffer) {
    renderInfo.core.push('v', this.rowBuffer);
    renderInfo.curY += this.rowBuffer;
  }

  goog.base(this, 'renderDrawRight_', renderInfo, connectionsXY, inputRows, iconWidth);

};

/**
 * Calls base function, then initializes the pattern (based on the color of
 * the svgPath) and sets the backdrop pattern.
 */
Blockly.BlockSvgFunctional.prototype.updateToColour_ = function(hexColour) {
  goog.base(this, 'updateToColour_', hexColour);

  this.addPatternToDefs_();
  this.backdrop_.setAttribute('fill', 'url(#' + this.patternId_ + ')');
};

/**
 * Extracts the color of the svgPath, then creates a pattern using that color,
 * setting this.patternId_ in the process.
 */
Blockly.BlockSvgFunctional.prototype.addPatternToDefs_ = function () {
  var color = this.svgPath_.getAttribute('fill');

  // strip leading #
  this.patternId_ = 'eyePattern' + color.substr(1);

  if (document.getElementById(this.patternId_)) {
    return;
  }

  var defs = document.getElementById('blocklySvgDefs');
  var pattern = Blockly.createSvgElement('pattern', {
    id: this.patternId_,
    width: 400,
    height: 400,
    patternUnits: "userSpaceOnUse",
    x: 0,
    y: 0
  }, defs);

  var y = 55;
  var height = 5;
  Blockly.createSvgElement('rect', {
    fill: color,
    x: 15,
    y: y,
    width: 30,
    height: height
  }, pattern);

  Blockly.createSvgElement('rect', {
    fill: color,
    x: 65,
    y: y,
    width: 30,
    height: height
  }, pattern);

};


Blockly.BlockSvgFunctional.prototype.dispose = function () {
  goog.base(this, 'dispose');

  this.blockClipRect_ = null;
  this.divider_ = null;
  this.backdrop_ = null;
};
