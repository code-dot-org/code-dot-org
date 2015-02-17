'use strict';

goog.provide('Blockly.SvgHighlightBox');

/**
 * A horizontal SVG highlight box with rectangular background and text
 * @param {!Element} parent {!Element}
 * @param {Object=} opt_options
 * @constructor
 */
Blockly.SvgHighlightBox = function (parent, opt_options) {
  opt_options = opt_options || {};
  var color = opt_options.color || '#000';
  var thickness = opt_options.thickness || '30';

  var extraStyle = 'pointer-events: none;';

  this.svgGroup_ = Blockly.createSvgElement('g', {
    style: extraStyle
  }, parent);

  this.highlightRectangle_ = Blockly.createSvgElement('rect', {
    'fill': 'none',
    'stroke-width': thickness,
    'stroke': color
  }, this.svgGroup_);
};

/**
 * @param yOffset {Number}
 * @param width {Number}
 * @param height {Number}
 */
Blockly.SvgHighlightBox.prototype.setPositionSize = function (yOffset, width, height) {
  this.svgGroup_.setAttribute('transform', 'translate(' + 0 + ',' + yOffset + ')');
  this.highlightRectangle_.setAttribute('width', width);
  this.highlightRectangle_.setAttribute('height', height);
};
