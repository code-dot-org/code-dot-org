/**
 * @fileoverview Extension of BlockSvg that allows for some settings specific
 * to functional blocks, including having a header row and input markers
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
  this.inputMarkers_ = {};

  Blockly.BlockSvg.call(this, block);
};
goog.inherits(Blockly.BlockSvgFunctional, Blockly.BlockSvg);

Blockly.BlockSvgFunctional.prototype.initChildren = function () {
  var rgb = Blockly.makeColour(this.block_.getColour(),
    this.block_.getSaturation(), this.block_.getValue());
  var lightColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.3);
  var lighterColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.8);

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

  for (var i = 0; i < this.block_.inputList.length; i++) {
    var input = this.block_.inputList[i];
    if (input.type !== Blockly.FUNCTIONAL_INPUT) {
      continue;
    }
    this.inputMarkers_[input.name] = Blockly.createSvgElement('rect', {
      fill: 'red' // todo
    }, this.svgGroup_);
  }
};

Blockly.BlockSvgFunctional.prototype.renderDraw_ = function(iconWidth, inputRows) {
  goog.base(this, 'renderDraw_', iconWidth, inputRows);

  this.blockClipRect_.setAttribute('d', this.svgPath_.getAttribute('d'));

  var rect = this.svgPath_.getBBox();
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
 * Render a function input that is inlined
 * @param {!Object} renderInfo Current state of our paths
 * @param {!Object} input The input to render
 * @param {!Object} connectionsXY Location of block.
 * @private
 */
Blockly.BlockSvgFunctional.prototype.renderDrawRightInlineFunctional_ =
    function(renderInfo, input, connectionsXY) {
  // todo (brent) - RTL
  var inputTopLeft = {
    x: renderInfo.curX,
    y: renderInfo.curY + BS.INLINE_PADDING_Y
  };

  var notchStart = BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH;

  renderInfo.inline.push('M', inputTopLeft.x + ',' + inputTopLeft.y);
  renderInfo.inline.push('h', notchStart);
  renderInfo.inline.push(BS.NOTCH_PATH_LEFT);
  renderInfo.inline.push('H', inputTopLeft.x + input.renderWidth);
  renderInfo.inline.push('v', input.renderHeight);
  renderInfo.inline.push('H', inputTopLeft.x);
  renderInfo.inline.push('z');


  // var colour = goog.color.hexToRgb();
  this.inputMarkers_[input.name].setAttribute('x', inputTopLeft.x + 5);
  this.inputMarkers_[input.name].setAttribute('y', inputTopLeft.y + 15);
  this.inputMarkers_[input.name].setAttribute('width', input.renderWidth - 10);
  this.inputMarkers_[input.name].setAttribute('height', 5);
  this.inputMarkers_[input.name].setAttribute('fill', input.getHexColour());

  // hide inputs that have targets, so that the rectangle doesn't show up when
  // dragging
  this.inputMarkers_[input.name].setAttribute('visibility',
    input.connection.targetConnection ? 'hidden' : 'visible');

  renderInfo.curX += input.renderWidth + BS.SEP_SPACE_X;

  // Create inline input connection.
  var connectionX = connectionsXY.x + inputTopLeft.x + BS.NOTCH_WIDTH;
  var connectionY = connectionsXY.y + inputTopLeft.y;

  input.connection.moveTo(connectionX, connectionY);
  if (input.connection.targetConnection) {
    input.connection.tighten_();
  }
};

Blockly.BlockSvgFunctional.prototype.dispose = function () {
  goog.base(this, 'dispose');

  this.blockClipRect_ = null;
  this.divider_ = null;
};
