/** @file Creates and controls an SVG overlay on the app visualization. */
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
var CrosshairOverlay = require('./CrosshairOverlay');
var SVG_NS = constants.SVG_NS;

/**
 * Creates and controls an SVG overlay on the app visualization.
 * @param {SVGElement} rootSvg - An SVG element to render within.
 * @constructor
 */
var VisualizationOverlay = function (rootSvg) {
  /** @private {SVGElement} */
  this.rootSvg_ = rootSvg;

  /** @private {SVGGElement} */
  this.ownElement_ = null;

  /** @private {function} */
  this.mouseMoveListener_ = null;

  /** @private {boolean} */
  this.isApplabRunning_ = false;

  /** @private {SVGPoint} */
  this.mousePos_ = rootSvg.createSVGPoint();

  /** @private {SVGPoint} */
  this.appSize_ = rootSvg.createSVGPoint();
  this.appSize_.x = parseInt(rootSvg.getAttribute('width'));
  this.appSize_.y = parseInt(rootSvg.getAttribute('height'));

  /** @private {SVGMatrix} */
  this.screenSpaceToAppSpaceTransform_ = null;

  /** @private {CrosshairOverlay} */
  this.crosshairOverlay_ = new CrosshairOverlay();

  this.recalculateTransformAtScale_(1);
};
module.exports = VisualizationOverlay;

VisualizationOverlay.prototype.render = function () {
  if (!this.ownElement_) {
    this.create_();
  }

  if (this.shouldShowCrosshair_()) {
    this.crosshairOverlay_.render(this.ownElement_, {
      x: this.mousePos_.x,
      y: this.mousePos_.y,
      appWidth: this.appSize_.x,
      appHeight: this.appSize_.y
    });
  } else {
    this.crosshairOverlay_.unrender();
  }
};

VisualizationOverlay.prototype.unrender = function () {
  if (this.ownElement_) {
    this.destroy_();
  }
};

VisualizationOverlay.prototype.setScale = function (newScale) {
   this.recalculateTransformAtScale_(newScale);
};

VisualizationOverlay.prototype.setIsApplabRunning = function (isApplabRunning) {
  this.isApplabRunning_ = isApplabRunning;
};

VisualizationOverlay.prototype.create_ = function () {
  this.ownElement_ = document.createElementNS(SVG_NS, 'g');
  this.rootSvg_.appendChild(this.ownElement_);

  this.mouseMoveListener_ = this.onSvgMouseMove_.bind(this);
  document.addEventListener('mousemove', this.mouseMoveListener_);
};

VisualizationOverlay.prototype.destroy_ = function () {
  document.removeEventListener('mousemove', this.mouseMoveListener_);
  this.mouseMoveListener_ = null;

  if (this.crosshairOverlay_) {
    this.crosshairOverlay_.unrender();
    this.crosshairOverlay_ = null;
  }
  this.rootSvg_.removeChild(this.ownElement_);
  this.ownElement_ = null;
};

VisualizationOverlay.prototype.onSvgMouseMove_ = function (event) {
  this.mousePos_.x = event.clientX;
  this.mousePos_.y = event.clientY;
  this.mousePos_ = this.mousePos_.matrixTransform(this.screenSpaceToAppSpaceTransform_);
  this.render();
};

VisualizationOverlay.prototype.shouldShowCrosshair_ = function () {
  return !this.isApplabRunning_ && this.isMouseInVisualization_();
};

VisualizationOverlay.prototype.isMouseInVisualization_ = function () {
  return (this.mousePos_.x >= 0) &&
      (this.mousePos_.x <= this.appSize_.x) &&
      (this.mousePos_.y >= 0) &&
      (this.mousePos_.y <= this.appSize_.y);
};

VisualizationOverlay.prototype.recalculateTransformAtScale_ = function (scale) {
  var svg = this.rootSvg_;
  var svgRect = svg.getBoundingClientRect();
  var newTransform = svg.createSVGMatrix()
      .scale(1 / scale)
      .translate(-svgRect.left, -svgRect.top);
  this.screenSpaceToAppSpaceTransform_ = newTransform;
};
