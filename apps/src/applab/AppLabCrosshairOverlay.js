/** @file */
'use strict';

require('../utils'); // Provides Function.prototype.inherits
var CrosshairOverlay = require('../templates/CrosshairOverlay');
var elementUtils = require('../applab/designElements/elementUtils');
var gridUtils = require('../applab/gridUtils');

var CROSSHAIR_MARGIN = CrosshairOverlay.CROSSHAIR_MARGIN;
var TEXT_RECT_HEIGHT = CrosshairOverlay.TEXT_RECT_HEIGHT;
var ELEMENT_ID_Y_OFFSET = CrosshairOverlay.TEXT_RECT_HEIGHT + 4;
var ELEMENT_ID_TEXT_MAX_CHAR = 12;

/**
 * App Lab specific Crosshair Overlay that supports element ID tooltips and
 * special behavior when dragging design mode elements.
 * @constructor
 * @extends CrosshairOverlay
 */
var AppLabCrosshairOverlay = function () {
  CrosshairOverlay.call(this);

  /**
   * Element id of control user's hovering over
   * @private {String}
   */
  this.mouseoverApplabControlId_ = null;

  /**
   * Whether an element is being dragged.
   * @private {boolean}
   */
  this.isDragging_ = false;

  /**
   * Whether we're currently in design mode.
   * @private {boolean}
   */
  this.isInDesignMode_ = false;
};
AppLabCrosshairOverlay.inherits(CrosshairOverlay);
module.exports = AppLabCrosshairOverlay;

/**
 * Set whether we're currently in design mode.
 * @param {boolean} inDesignMode
 */
AppLabCrosshairOverlay.prototype.setInDesignMode = function (inDesignMode) {
  this.isInDesignMode_ = inDesignMode;
};

/**
 * To be called on mouse move.
 * @param {!MouseEvent} event
 * @override
 */
AppLabCrosshairOverlay.prototype.onSvgMouseMove = function (event) {
  this.mouseoverApplabControlId_ = this.getMouseoverApplabControlId_(event.target);
};

/**
 * @param {SVGElement} intoElement
 * @param {Object} nextProps
 * @param {number} nextProps.x
 * @param {number} nextProps.y
 * @param {number} nextProps.appWidth
 * @param {number} nextProps.appHeight
 * @override
 */
AppLabCrosshairOverlay.prototype.render = function (intoElement, nextProps) {
  // Modify passed props if we're in a 'dragging' mode.
  var draggingElement = $(".ui-draggable-dragging");
  this.isDragging_ = !!draggingElement.length;
  if (this.isDragging_) {
    // If we're dragging an element, use our util method to determine the right
    // mouse pos (top left of the dragged element)
    var point = gridUtils.scaledDropPoint(draggingElement);
    nextProps = $.extend(nextProps, {
      x: point.left,
      y: point.top
    });
  }

  // Use parent render() method
  CrosshairOverlay.prototype.render.call(this, intoElement, nextProps);

  // If user is hovering over a control, show the element's id as a second tooltip
  if (this.mouseoverApplabControlId_) {
    var rectX = parseFloat(this.bubble_.getAttribute('x'));
    var rectY = parseFloat(this.bubble_.getAttribute('y'));
    var textX = parseFloat(this.text_.getAttribute('x'));
    var textY = parseFloat(this.text_.getAttribute('y'));

    var elementIdRectX = rectX;
    var elementIdRectY = rectY + ELEMENT_ID_Y_OFFSET;

    var elementIdTextX = textX;
    var elementIdTextY = textY + ELEMENT_ID_Y_OFFSET;

    this.elementIdBubble_.setAttribute('x', elementIdRectX);
    this.elementIdBubble_.setAttribute('y', elementIdRectY);

    this.elementIdText_.setAttribute('x', elementIdTextX);
    this.elementIdText_.setAttribute('y', elementIdTextY);
    this.elementIdText_.textContent = this.getElementIdText_();

    this.elementIdBubble_.style.display = 'block';
    this.elementIdText_.style.display = 'block';
  } else {
    // Otherwise, hide the element id tooltip
    this.elementIdBubble_.style.display = 'none';
    this.elementIdText_.style.display = 'none';
  }
};

/**
 * Given current properties, calculates the position for rendering the tooltip.
 * Custom behavior: When dragging an element, position tooltip above element.
 * @returns {{rectX: number, rectY: number}}
 * @override
 */
AppLabCrosshairOverlay.prototype.getBubbleCoordinates_ = function () {
  var coordinates = CrosshairOverlay.prototype.getBubbleCoordinates_.call(this);

  // If we're dragging an element, instead put the text above and right of the
  // cross hair, while making sure it doesnt go past the top of the overlay
  if (this.isDragging_) {
    coordinates.rectY = this.props_.y - CROSSHAIR_MARGIN - TEXT_RECT_HEIGHT - ELEMENT_ID_Y_OFFSET;
    coordinates.rectY = Math.max(0, coordinates.rectY);
  }
  return coordinates;
};

/**
 * Modify base behavior to reflect larger tooltip when showing element ID.
 * @returns {{width: number, height: number}}
 * @private
 * @override
 */
AppLabCrosshairOverlay.prototype.getTooltipDimensions_ = function () {
  var size = CrosshairOverlay.prototype.getTooltipDimensions_.call(this);
  if (this.mouseoverApplabControlId_) {
    size.height += ELEMENT_ID_Y_OFFSET;
  }
  return size;
};

/**
 * Override create to add tooltip elements for the element ID
 * @private
 * @override
 */
AppLabCrosshairOverlay.prototype.create_ = function () {
  CrosshairOverlay.prototype.create_.call(this);

  // Add the element id tooltip
  this.elementIdBubble_ = this.createBubbleElement_();
  this.elementIdText_ = this.createTextElement_();
};

/**
 * Gets the element id of the Applab UI control user is hovering over, if any.
 * If the user is in design mode, we strip the element id prefix.
 * @param {EventTarget} eventTarget The mouseover event target
 * @returns {string} id of the Applab UI control the mouse is over. Returns null if none exist.
 * @private
 */
AppLabCrosshairOverlay.prototype.getMouseoverApplabControlId_ = function (eventTarget) {

  // Check that the element is a child of a screen
  if (eventTarget && $(eventTarget).parents('div.screen').length > 0) {
    var controlElement = eventTarget;

    // Check to see the mouseover target is a resize handle.
    // If so, grab the id of associated control instead of the resize handle itself.
    // We need to do this because for very small controls, the resize handle completely
    // covers the control itself, making it impossible to show the id tooltip
    if (AppLabCrosshairOverlay.isResizeHandle_(controlElement)) {
      controlElement = AppLabCrosshairOverlay.getAssociatedControl_(controlElement);
    }

    // If we're in design mode, get the element id without the prefix
    if (this.isInDesignMode_) {
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
AppLabCrosshairOverlay.isResizeHandle_ = function (element) {
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
AppLabCrosshairOverlay.getAssociatedControl_ = function (resizeHandleElement) {
  var siblingControl = $(resizeHandleElement).siblings().not('.ui-resizable-handle');

  if (siblingControl.length > 0 && siblingControl[0].id) {
    return siblingControl[0];
  }

  return null;
};

/**
 * Internal helper to generate the element id string to display in tooltip.
 * @returns {string}
 * @private
 */
AppLabCrosshairOverlay.prototype.getElementIdText_ = function () {
  return "id: " +
      CrosshairOverlay.ellipsify(this.mouseoverApplabControlId_, ELEMENT_ID_TEXT_MAX_CHAR);
};
