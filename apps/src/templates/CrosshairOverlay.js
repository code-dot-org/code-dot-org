/** @file Creates and controls a coordinates crosshair on the app visualization. */
'use strict';

var constants = require('../constants');
var SVG_NS = constants.SVG_NS;
var CROSSHAIR_MARGIN = 6;
var EDGE_MARGIN = 5;
var TEXT_RECT_WIDTH = 110;
var TEXT_RECT_HEIGHT = 21;
var TEXT_RECT_RADIUS = TEXT_RECT_HEIGHT / 3;
var TEXT_Y_OFFSET = -7;

/**
 * Creates and controls a coordinates crosshair on the app visualization.
 * @constructor
 */
var CrosshairOverlay = function () {
  /** @private {SVGGElement} */
  this.ownElement_ = null;

  /** @private {Object} */
  this.props_ = {
    x: 0,
    y: 0,
    appWidth: 0,
    appHeight: 0
  };
};
module.exports = CrosshairOverlay;

CrosshairOverlay.CROSSHAIR_MARGIN = CROSSHAIR_MARGIN;
CrosshairOverlay.TEXT_RECT_HEIGHT = TEXT_RECT_HEIGHT;

/**
 * @param {SVGElement} intoElement
 * @param {Object} nextProps
 * @param {number} nextProps.x
 * @param {number} nextProps.y
 * @param {number} nextProps.appWidth
 * @param {number} nextProps.appHeight
 */
CrosshairOverlay.prototype.render = function (intoElement, nextProps) {
  // Create element if necessary
  if (!this.ownElement_) {
    this.create_();
  }

  // Put element in correct parent
  if (this.ownElement_.parentNode !== intoElement) {
    this.moveToParent_(intoElement);
  }

  // Record any new/updated properties
  $.extend(this.props_, nextProps);

  var bubbleCoordinates = this.getBubbleCoordinates_();
  var rectX = bubbleCoordinates.rectX;
  var rectY = bubbleCoordinates.rectY;

  var textX = rectX + TEXT_RECT_WIDTH / 2;
  var textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;

  this.vGuide_.setAttribute('x1', this.props_.x);
  this.vGuide_.setAttribute('y1', this.props_.y - CROSSHAIR_MARGIN);
  this.vGuide_.setAttribute('x2', this.props_.x);

  this.hGuide_.setAttribute('x1', this.props_.x - CROSSHAIR_MARGIN);
  this.hGuide_.setAttribute('y1', this.props_.y);
  this.hGuide_.setAttribute('y2', this.props_.y);

  this.bubble_.setAttribute('x', rectX);
  this.bubble_.setAttribute('y', rectY);

  this.text_.setAttribute('x', textX);
  this.text_.setAttribute('y', textY);
  this.text_.textContent = this.getCoordinateText();
};

/**
 * Given current properties, calcualtes the position for rendering the tooltip.
 * @returns {{rectX: number, rectY: number}}
 */
CrosshairOverlay.prototype.getBubbleCoordinates_ = function () {
  var rectX = this.props_.x + CROSSHAIR_MARGIN;
  if (rectX + TEXT_RECT_WIDTH + EDGE_MARGIN > this.props_.appWidth) {
    // This response gives a smooth horizontal reposition when near the edge
    rectX -= (rectX + TEXT_RECT_WIDTH + EDGE_MARGIN - this.props_.appWidth);
    // This response snaps the text to the other side when near the edge
    //rectX = this.props_.x - CROSSHAIR_MARGIN - TEXT_RECT_WIDTH;
  }

  var rectY = this.props_.y + CROSSHAIR_MARGIN;
  if (rectY + TEXT_RECT_HEIGHT + EDGE_MARGIN > this.props_.appHeight) {
    rectY = this.props_.y - CROSSHAIR_MARGIN - TEXT_RECT_HEIGHT;
  }

  return {rectX: rectX, rectY: rectY};
};

CrosshairOverlay.prototype.destroy = function () {
  if (this.ownElement_) {
    this.moveToParent_(null);
    this.ownElement_ = null;
  }
};

CrosshairOverlay.prototype.create_ = function () {
  this.ownElement_ = document.createElementNS(SVG_NS, 'g');
  this.ownElement_.setAttribute('class', 'crosshair-overlay');

  this.vGuide_ = document.createElementNS(SVG_NS, 'line');
  this.vGuide_.setAttribute('y2', 0);
  this.ownElement_.appendChild(this.vGuide_);

  this.hGuide_ = document.createElementNS(SVG_NS, 'line');
  this.hGuide_.setAttribute('x2', 0);
  this.ownElement_.appendChild(this.hGuide_);

  // Create the cooordinates tooltip
  this.bubble_ = this.createBubbleElement_();
  this.text_ = this.createTextElement_();
};

CrosshairOverlay.prototype.moveToParent_ = function (newParent) {
  if (this.ownElement_.parentNode) {
    this.ownElement_.parentNode.removeChild(this.ownElement_);
  }
  if (newParent) {
    newParent.appendChild(this.ownElement_);
  }
};

CrosshairOverlay.prototype.getCoordinateText = function () {
  return "x: " + Math.floor(this.props_.x) +
      ", y: " + Math.floor(this.props_.y);
};

CrosshairOverlay.ellipsify = function (inputText, maxLength) {
  if (inputText && inputText.length > maxLength) {
    return inputText.substr(0, maxLength - 3) + "...";
  }
  return inputText || '';
};

CrosshairOverlay.prototype.createBubbleElement_ = function () {
  var bubbleElement = document.createElementNS(SVG_NS, 'rect');
  bubbleElement.setAttribute('width', TEXT_RECT_WIDTH);
  bubbleElement.setAttribute('height', TEXT_RECT_HEIGHT);
  bubbleElement.setAttribute('rx', TEXT_RECT_RADIUS);
  bubbleElement.setAttribute('ry', TEXT_RECT_RADIUS);
  this.ownElement_.appendChild(bubbleElement);

  return bubbleElement;
};

CrosshairOverlay.prototype.createTextElement_ = function () {
  var textElement = document.createElementNS(SVG_NS, 'text');
  this.ownElement_.appendChild(textElement);

  return textElement;
};

CrosshairOverlay.prototype.onSvgMouseMove = function (event) {
  // Intentionally left blank (used by descendant class)
};
