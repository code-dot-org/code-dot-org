var constants = require('../constants');
var KeyCodes = constants.KeyCodes;
var elementUtils = require('./designElements/elementUtils');

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

ChangeEventHandler.prototype.onEnter = function () {
  if (this.getValue() !== this.initialValue_) {
    this.initialValue_ = this.getValue();
    this.callback_();
  }
};

ChangeEventHandler.prototype.onBlur = function () {
  if (this.getValue() !== this.initialValue_) {
    this.callback_();
  }
};

/**
 * Returns the raw value of the element for the purpose of detecting a
 * change event. This value will generally not be suitable for displaying
 * to the user when the element is a contenteditable div.
 * @returns {string}
 */
ChangeEventHandler.prototype.getValue = function () {
  if (elementUtils.isTextInput(this.element_)) {
    return this.element_.value;
  } else if (elementUtils.isContentEditable(this.element_)) {
    return this.element_.textContent;
  } else {
    throw new Error('Unsupported element type: ' + this.element_);
  }
};

/**
 * Attaches a synthetic change event to the element, by calling the callback
 * if the element's value changes between focus, enter and blur.
 * @param {Element} element
 * @param {Function} callback
 */
ChangeEventHandler.addChangeEventHandler = function(element, callback) {
  var handler = new ChangeEventHandler(element, callback);
  element.addEventListener("focus", handler.onFocus.bind(handler));
  // Handle enter key for text inputs, which cannot contain newlines.
  if (elementUtils.isTextInput(element)) {
    element.addEventListener("keydown", function(event) {
      if (event.keyCode === KeyCodes.ENTER) {
        this.onEnter();
      }
    }.bind(handler));
  }
  element.addEventListener("blur", handler.onBlur.bind(handler));
};
