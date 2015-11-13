/** @file Creates and controls a coordinates crosshair on the app visualization. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 6,
 maxstatements: 200
 */
'use strict';

var constants = require('../constants');
var SVG_NS = constants.SVG_NS;

var CROSSHAIR_MARGIN = 6;
var EDGE_MARGIN = 5;
var TEXT_RECT_WIDTH = 104;
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

  this.bubble_ = document.createElementNS(SVG_NS, 'rect');
  this.bubble_.setAttribute('width', TEXT_RECT_WIDTH);
  this.bubble_.setAttribute('height', TEXT_RECT_HEIGHT);
  this.bubble_.setAttribute('rx', TEXT_RECT_RADIUS);
  this.bubble_.setAttribute('ry', TEXT_RECT_RADIUS);
  this.ownElement_.appendChild(this.bubble_);

  this.text_ = document.createElementNS(SVG_NS, 'text');
  this.ownElement_.appendChild(this.text_);
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
