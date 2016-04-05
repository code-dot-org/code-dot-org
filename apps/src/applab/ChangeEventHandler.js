var constants = require('../constants');
var KeyCodes = constants.KeyCodes;
var elementLibrary = require('./designElements/library');

/**
 * Helper class for generating a synthetic change event when an element's
 * contents changes between focus and blur.
 * @param {Element} element
 * @param {Function} callback
 * @constructor
 */
var ChangeEventHandler = module.exports = function (element, callback) {
  /**
   * @type {Element}
   * @private
   */
  this.element_ = element;

  /**
   * Callback to call if the element's value changes between focus and blur.
   * @type {function}
   * @private
   */
  this.callback_ = callback;

  /**
   * Value of the element when it was focused.
   * @type {string}
   * @private
   */
  this.initialValue_ = '';
};

ChangeEventHandler.prototype.onFocus = function () {
  this.initialValue_ = this.getValue();
};

/**
 * @param {!Event} event
 */
ChangeEventHandler.prototype.onEnter = function (event) {
  if (this.getValue() !== this.initialValue_) {
    this.initialValue_ = this.getValue();
    this.callback_(event);
  }
};

/**
 * @param {!Event} event
 */
ChangeEventHandler.prototype.onBlur = function (event) {
  if (this.getValue() !== this.initialValue_) {
    this.callback_(event);
  }
};

/**
 * Returns the raw value of the element for the purpose of detecting a
 * change event. This value will generally not be suitable for displaying
 * to the user when the element is a contenteditable div.
 * @returns {string}
 */
ChangeEventHandler.prototype.getValue = function () {
  var elementType = elementLibrary.getElementType(this.element_);
  switch (elementType) {
    case elementLibrary.ElementType.TEXT_INPUT:
      return this.element_.value;
    case elementLibrary.ElementType.TEXT_AREA:
      return this.element_.textContent;
    default:
      throw new Error('ChangeEventHandler: unsupported element type ' + elementType);
  }
};

/**
 * Attaches a synthetic change event to the element, by calling the callback
 * if the element's value changes between focus, enter and blur.
 * @param {Element} element
 * @param {Function} callback
 */
ChangeEventHandler.addChangeEventHandler = function (element, callback) {
  var handler = new ChangeEventHandler(element, callback);
  element.addEventListener("focus", handler.onFocus.bind(handler));
  // Handle enter key for text inputs, which cannot contain newlines.
  var elementType = elementLibrary.getElementType(element);
  if (elementType === elementLibrary.ElementType.TEXT_INPUT) {
    element.addEventListener("keydown", function (event) {
      if (event.keyCode === KeyCodes.ENTER) {
        this.onEnter(event);
      }
    }.bind(handler));
  }
  element.addEventListener("blur", handler.onBlur.bind(handler));
};
