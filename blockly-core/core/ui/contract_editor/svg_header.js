'use strict';

goog.provide('Blockly.SvgHeader');

/**
 * A horizontal SVG bar with rectangular background and text
 * @param {!Element} parent {!Element}
 * @param {Object=} opt_options
 * @constructor
 */
Blockly.SvgHeader = function (parent, opt_options) {
  opt_options = opt_options || {};
  this.padding = {left: 10};
  var extraStyle = opt_options.onMouseDown ? '' : 'pointer-events: none;';
  this.svgGroup_ = Blockly.createSvgElement('g',
    {style: extraStyle}, parent, {belowExisting: true});
  this.grayRectangleElement_ = Blockly.createSvgElement('rect',
    {'fill': '#dddddd', 'style': extraStyle}, this.svgGroup_);
  this.textElement_ = Blockly.createSvgElement('text',
    {'class': 'blackBlocklyText', 'style': extraStyle}, this.svgGroup_);
  if (opt_options.headerText) {
    this.textElement_.textContent = opt_options.headerText;
  }
  if (opt_options.onMouseDown) {
    Blockly.bindEvent_(this.svgGroup_, 'mousedown', opt_options.onMouseDownContext, opt_options.onMouseDown);
  }
};

/**
 * @param yOffset {Number}
 * @param width {Number}
 * @param height {Number}
 */
Blockly.SvgHeader.prototype.setPositionSize = function (yOffset, width, height) {
  this.svgGroup_.setAttribute('transform', 'translate(' + 0 + ',' + yOffset + ')');
  this.grayRectangleElement_.setAttribute('width', width);
  this.grayRectangleElement_.setAttribute('height', height);
  this.textElement_.setAttribute('x', this.padding.left);
  var rectangleMiddleY = height / 2;
  // text getBBox() height seems to be off by a bit, 1/3 of getBBox height looks best
  var thirdTextHeight = this.textElement_.getBBox().height / 3;

  this.textElement_.setAttribute('y', rectangleMiddleY + thirdTextHeight);
};

Blockly.SvgHeader.prototype.setText = function (text) {
  this.textElement_.textContent = text;
};

Blockly.SvgHeader.prototype.removeSelf = function () {
  goog.dom.removeNode(this.svgGroup_);
};
