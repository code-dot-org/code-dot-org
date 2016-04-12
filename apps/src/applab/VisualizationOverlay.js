/** @file Creates and controls an SVG overlay on the app visualization. */
'use strict';

var constants = require('../constants');
var CrosshairOverlay = require('./CrosshairOverlay');
var gridUtils = require('./gridUtils');
var elementUtils = require('./designElements/elementUtils');
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
    isCrosshairAllowed: false,
    scale: 1,
    isInDesignMode: false
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

  /** @private {string} */
  this.mouseoverApplabControlId_ = null;
};
module.exports = VisualizationOverlay;

/**
 * @param {SVGSVGElement} intoElement - where this component should be rendered
 * @param {Object} nextProps
 * @param {boolean} nextProps.isCrosshairAllowed
 * @param {number} nextProps.scale
 * @param {boolean} nextProps.isInDesignMode
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
      appHeight: this.appSize_.y,
      isDragging: $(".ui-draggable-dragging").length > 0,
      mouseoverApplabControlId: this.mouseoverApplabControlId_
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
  var draggingElement = $(".ui-draggable-dragging");
  if (draggingElement.length) {
    // If we're dragging an element, use our util method to determine the right
    // mouse pos (top left of the dragged element)
    var point = gridUtils.scaledDropPoint(draggingElement);
    this.mousePos_.x = point.left;
    this.mousePos_.y = point.top;
  } else {
    this.mousePos_ = this.mousePos_.matrixTransform(this.screenSpaceToAppSpaceTransform_);
  }

  if (this.shouldShowCrosshair_()) {
    this.mouseoverApplabControlId_ = this.getMouseoverApplabControlId_(event.target);
  }

  if (this.ownElement_.parentNode) {
    this.render(this.ownElement_.parentNode, this.props_);
  }
};

VisualizationOverlay.prototype.shouldShowCrosshair_ = function () {
  return this.props_.isCrosshairAllowed && this.isMouseInVisualization_();
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

/**
 * Gets the element id of the Applab UI control user is hovering over, if any.
 * If the user is in design mode, we strip the element id prefix.
 * @param {EventTarget} eventTarget The mouseover event target
 * @returns {string} id of the Applab UI control the mouse is over. Returns null if none exist.
 * @private
 */
VisualizationOverlay.prototype.getMouseoverApplabControlId_ = function (eventTarget) {

  // Check that the element is a child of a screen
  if (eventTarget && $(eventTarget).parents('div.screen').length > 0) {
    var controlElement = eventTarget;

    // Check to see the mouseover target is a resize handle.
    // If so, grab the id of associated control instead of the resize handle itself.
    // We need to do this because for very small controls, the resize handle completely
    // covers the control itself, making it impossible to show the id tooltip
    if (VisualizationOverlay.isResizeHandle_(controlElement)) {
      controlElement = VisualizationOverlay.getAssociatedControl_(controlElement);
    }

    // If we're in design mode, get the element id without the prefix
    if (this.props_.isInDesignMode) {
      return elementUtils.getId(controlElement);
    }

    return controlElement.id;
  }

  return null;
};

/**
 * Determines whether an element is a resize handle. The criteria we're using here are:
 * 1) The element has a screen element as its ancestor
 * AND
 * 2) It has the 'ui-resizable-handle' class
 * @param {HTMLElement} element
 * @returns {boolean} True if element is a resize handle
 * @private
 * @static
 */
VisualizationOverlay.isResizeHandle_ = function (element) {
  return $(element).parents('div.screen').length > 0 &&
      $(element).hasClass('ui-resizable-handle');
};

/**
 * Given a resize handle element, find the actual ui control it's associated with
 * @param {HTMLElement} resizeHandleElement
 * @returns {HTMLElement} The UI control element associated with the resize
 *          handle, or null if none exists.
 * @private
 * @static
 */
VisualizationOverlay.getAssociatedControl_ = function (resizeHandleElement) {
  var siblingControl = $(resizeHandleElement).siblings().not('.ui-resizable-handle');

  if (siblingControl.length > 0 && siblingControl[0].id) {
    return siblingControl[0];
  }

  return null;
};
