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
 * @constructor
 */
var VisualizationOverlay = function () {
  /** @private {SVGGElement} */
  this.ownElement_ = null;

  /** @private {Object} */
  this.props_ = {
    isApplabRunning: false,
    scale: 1
  };

  /** @private {function} */
  this.mouseMoveListener_ = null;

  /** @private {SVGPoint} */
  this.mousePos_ = null;

  /** @private {SVGPoint} */
  this.appSize_ = null;

  /** @private {SVGMatrix} */
  this.screenSpaceToAppSpaceTransform_ = null;

  /** @private {CrosshairOverlay} */
  this.crosshairOverlay_ = new CrosshairOverlay();
};
module.exports = VisualizationOverlay;

/**
 * @param {SVGSVGElement} intoElement - where this component should be rendered
 * @param {Object} nextProps
 * @param {boolean} nextProps.isApplabRunning
 * @param {number} nextProps.scale
 */
VisualizationOverlay.prototype.render = function (intoElement, nextProps) {
  // Create element if necessary
  if (!this.ownElement_) {
    this.create_();
  }

  // Put element in correct parent
  if (this.ownElement_.parentNode !== intoElement) {
    this.moveToParent_(intoElement);
  }

  // Record any new/updated properties
  var oldProps = $.extend({}, this.props_);
  $.extend(this.props_, nextProps);

  if (this.props_.scale !== oldProps.scale) {
    this.recalculateTransformAtScale_(this.props_.scale);
  }

  if (this.shouldShowCrosshair_()) {
    this.crosshairOverlay_.render(this.ownElement_, {
      x: this.mousePos_.x,
      y: this.mousePos_.y,
      appWidth: this.appSize_.x,
      appHeight: this.appSize_.y
    });
  } else {
    this.crosshairOverlay_.destroy();
  }
};

VisualizationOverlay.prototype.create_ = function () {
  this.ownElement_ = document.createElementNS(SVG_NS, 'g');

  this.mouseMoveListener_ = this.onSvgMouseMove_.bind(this);
  document.addEventListener('mousemove', this.mouseMoveListener_);
};

VisualizationOverlay.prototype.moveToParent_ = function (newParent) {
  if (this.ownElement_.parentNode) {
    this.ownElement_.parentNode.removeChild(this.ownElement_);
  }
  if (newParent) {
    newParent.appendChild(this.ownElement_);

    // Make a reusable mouse position point if we haven't yet.
    if (!this.mousePos_) {
      this.mousePos_ = newParent.createSVGPoint();
      // Default cursor position should be offscreen until we get a mouse event.
      this.mousePos_.x = -1;
      this.mousePos_.y = -1;
    }

    // Update the app size to match the parent
    this.appSize_ = newParent.createSVGPoint();
    this.appSize_.x = parseInt(newParent.getAttribute('width'));
    this.appSize_.y = parseInt(newParent.getAttribute('height'));
  }
};

VisualizationOverlay.prototype.onSvgMouseMove_ = function (event) {
  if (!(this.ownElement_ && this.mousePos_ && this.screenSpaceToAppSpaceTransform_)) {
    return;
  }

  this.mousePos_.x = event.clientX;
  this.mousePos_.y = event.clientY;
  this.mousePos_ = this.mousePos_.matrixTransform(this.screenSpaceToAppSpaceTransform_);

  if (this.ownElement_.parentNode) {
    this.render(this.ownElement_.parentNode, this.props_);
  }
};

VisualizationOverlay.prototype.shouldShowCrosshair_ = function () {
  return !this.props_.isApplabRunning && this.isMouseInVisualization_();
};

VisualizationOverlay.prototype.isMouseInVisualization_ = function () {
  return (this.mousePos_.x >= 0) &&
      (this.mousePos_.x <= this.appSize_.x) &&
      (this.mousePos_.y >= 0) &&
      (this.mousePos_.y <= this.appSize_.y);
};

VisualizationOverlay.prototype.recalculateTransformAtScale_ = function (scale) {
  var svg = this.ownElement_.parentNode;
  if (!svg) {
    return;
  }

  var svgRect = svg.getBoundingClientRect();
  var newTransform = svg.createSVGMatrix()
      .scale(1 / scale)
      .translate(-svgRect.left, -svgRect.top);
  this.screenSpaceToAppSpaceTransform_ = newTransform;
};
