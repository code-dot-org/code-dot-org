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
  this.initialValue_ = this.element_.innerText;
};

ChangeEventHandler.prototype.onBlur = function () {
  if (this.element_.innerText !== this.initialValue_) {
    this.callback_();
  }
};

/**
 * Attaches a synthetic change event to the element, by calling the callback
 * if the element's value changes between focus and blur.
 * @param {Element} element
 * @param {Function} callback
 */
ChangeEventHandler.addChangeEventHandler = function(element, callback) {
  var handler = new ChangeEventHandler(element, callback);
  element.addEventListener("focus", handler.onFocus.bind(handler));
  element.addEventListener("blur", handler.onBlur.bind(handler));
};
