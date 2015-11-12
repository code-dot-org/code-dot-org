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

  /** @private {number} */
  this.x_ = 100;

  /** @private {number} */
  this.y_ = 100;

  // TODO: pass these in properly
  this.appWidth_ = 320;
  this.appHeight_ = 450;
};
module.exports = CrosshairOverlay;

/**
 *
 * @param {SVGElement} intoElement
 * @param {Object} props
 */
CrosshairOverlay.prototype.render = function (intoElement, props) {
  // Transfer new properties
  this.x_ = props.x;
  this.y_ = props.y;
  this.appWidth_ = props.appWidth;
  this.appHeight_ = props.appHeight;

  // If we're moving, destroy so we'll be recreated
  if (this.ownElement_ && this.ownElement_.parentNode !== intoElement) {
    this.destroy_();
  }

  // If we don't exist, recreate
  if (!this.ownElement_) {
    this.create_(intoElement);
  }

  var rectX = this.x_ + CROSSHAIR_MARGIN;
  if (rectX + TEXT_RECT_WIDTH + EDGE_MARGIN > this.appWidth_) {
    // This response gives a smooth horizontal reposition when near the edge
    rectX -= (rectX + TEXT_RECT_WIDTH + EDGE_MARGIN - this.appWidth_);
    // This response snaps the text to the other side when near the edge
    //rectX = this.props.x - CROSSHAIR_MARGIN - TEXT_RECT_WIDTH;
  }

  var rectY = this.y_ + CROSSHAIR_MARGIN;
  if (rectY + TEXT_RECT_HEIGHT + EDGE_MARGIN > this.appHeight_) {
    rectY = this.y_ - CROSSHAIR_MARGIN - TEXT_RECT_HEIGHT;
  }

  var textX = rectX + TEXT_RECT_WIDTH / 2;
  var textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;

  this.vGuide_.setAttribute('x1', this.x_);
  this.vGuide_.setAttribute('y1', this.y_ - CROSSHAIR_MARGIN);
  this.vGuide_.setAttribute('x2', this.x_);
  this.vGuide_.setAttribute('y2', 0);


  this.hGuide_.setAttribute('x1', this.x_ - CROSSHAIR_MARGIN);
  this.hGuide_.setAttribute('y1', this.y_);
  this.hGuide_.setAttribute('x2', 0);
  this.hGuide_.setAttribute('y2', this.y_);


  this.bubble_.setAttribute('x', rectX);
  this.bubble_.setAttribute('y', rectY);
  this.bubble_.setAttribute('width', TEXT_RECT_WIDTH);
  this.bubble_.setAttribute('height', TEXT_RECT_HEIGHT);
  this.bubble_.setAttribute('rx', TEXT_RECT_RADIUS);
  this.bubble_.setAttribute('ry', TEXT_RECT_RADIUS);

  this.text_.setAttribute('x', textX);
  this.text_.setAttribute('y', textY);
  this.text_.textContent = this.getCoordinateText();
};

CrosshairOverlay.prototype.unrender = function () {
  if (this.ownElement_) {
    this.destroy_();
  }
};

CrosshairOverlay.prototype.create_ = function (intoElement) {
  this.ownElement_ = document.createElementNS(SVG_NS, 'g');
  this.ownElement_.setAttribute('class', 'crosshair-overlay');

  this.vGuide_ = document.createElementNS(SVG_NS, 'line');
  this.ownElement_.appendChild(this.vGuide_);

  this.hGuide_ = document.createElementNS(SVG_NS, 'line');
  this.ownElement_.appendChild(this.hGuide_);

  this.bubble_ = document.createElementNS(SVG_NS, 'rect');
  this.ownElement_.appendChild(this.bubble_);

  this.text_ = document.createElementNS(SVG_NS, 'text');
  this.ownElement_.appendChild(this.text_);

  intoElement.appendChild(this.ownElement_);
};

CrosshairOverlay.prototype.destroy_ = function () {
  if (this.ownElement_ && this.ownElement_.parentNode) {
    this.ownElement_.parentNode.removeChild(this.ownElement_);
  }
  this.text_ = null;
  this.bubble_ = null;
  this.hGuide_ = null;
  this.vGuide_ = null;
  this.ownElement_ = null;
};

CrosshairOverlay.prototype.getCoordinateText = function () {
  return "x: " + Math.floor(this.x_) +
      ", y: " + Math.floor(this.y_);
};
