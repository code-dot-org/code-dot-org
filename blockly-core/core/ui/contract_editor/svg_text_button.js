'use strict';

goog.provide('Blockly.SvgTextButton');

/** @const */ var TEXT_PADDING_LEFT = '10'; // px

/**
 * A clickable SVG button with text on it
 * @param {!SVGElement} parent
 * @param {String} text
 * @param {Function} onMouseDown
 * @constructor
 */
Blockly.SvgTextButton = function (parent, text, onMouseDown) {
  var button = Blockly.createSvgElement('g', {
    'id': 'addExampleButton'
  }, parent);
  var padding = 7;
  var purpleFillColor = '#7665a0';
  this.buttonRect = Blockly.createSvgElement('rect', {
    'rx': 12,
    'ry': 12,
    'fill': purpleFillColor,
    'stroke': 'white',
    'stroke-width': '2.5'
  }, button);
  var textElement = Blockly.createSvgElement('text', {
    'x': padding,
    'y': padding,
    'class': 'blocklyText'
  }, button);
  textElement.textContent = text;
  var bounds = textElement.getBoundingClientRect();
  this.buttonRect.setAttribute('width', bounds.width + 2 * padding);
  this.buttonRect.setAttribute('height', bounds.height + padding);
  this.buttonRect.setAttribute('y', -bounds.height + padding - 1);

  Blockly.bindEvent_(button, 'click', null, onMouseDown);

  this.svgGroup_ = button;
};

/**
 * @param xOffset {Number}
 * @param yOffset {Number}
 * @return {Number} y offset to continue rendering at
 */
Blockly.SvgTextButton.prototype.renderAt = function (xOffset, yOffset) {
  var hardcodedButtonHeight = 29;
  var topToYBasePosition = 14;
  var transformYPosition = topToYBasePosition + yOffset;
  this.svgGroup_.setAttribute('transform', 'translate(' + xOffset + ',' + transformYPosition + ')');
  return yOffset + hardcodedButtonHeight;
};

Blockly.SvgTextButton.prototype.setVisible = function (visible) {
  goog.style.showElement(this.svgGroup_, visible);
};
