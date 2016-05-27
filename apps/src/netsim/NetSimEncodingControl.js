/**
 * @overview UI controller for set of radio buttons used to select display encodings.
 */
'use strict';

var markup = require('./NetSimEncodingControl.html.ejs');
var EncodingType = require('./NetSimConstants').EncodingType;

/**
 * Generator and controller for message encoding selector: A dropdown that
 * controls whether messages are displayed in some combination of binary, hex,
 * decimal, ascii, etc.
 * @param {jQuery} rootDiv
 * @param {NetSimLevelConfiguration} levelConfig
 * @param {function} changeEncodingCallback
 * @constructor
 */
var NetSimEncodingControl = module.exports = function (rootDiv, levelConfig,
    changeEncodingCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {NetSimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {function}
   * @private
   */
  this.changeEncodingCallback_ = changeEncodingCallback;

  /**
   * @type {jQuery}
   * @private
   */
  this.checkboxes_ = null;

  // Initial render
  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimEncodingControl.prototype.render = function () {
  var renderedMarkup = $(markup({
    level: this.levelConfig_
  }));
  this.rootDiv_.html(renderedMarkup);
  this.checkboxes_ = this.rootDiv_.find(
      'input[type="checkbox"][name="encoding_checkboxes"]');
  this.checkboxes_.change(this.onCheckboxesChange_.bind(this));
};

/**
 * Send new selected encodings to registered callback on change.
 * @private
 */
NetSimEncodingControl.prototype.onCheckboxesChange_ = function () {
  var selectedEncodings = [];
  this.checkboxes_.filter(':checked').each(function (i, element) {
    selectedEncodings.push(element.value);
  });
  this.changeEncodingCallback_(selectedEncodings);
};

/**
 * Change selector value to the new provided value.
 * @param {EncodingType[]} newEncodings
 */
NetSimEncodingControl.prototype.setEncodings = function (newEncodings) {
  this.checkboxes_.each(function (i, element) {
    $(element).attr('checked', (newEncodings.indexOf(element.value) > -1));
  });
};

/**
 * Generate a jQuery selector string that will get all rows that
 * have ANY of the provided classes.
 * @param {EncodingType[]} encodings
 * @returns {string}
 */
var makeEncodingRowSelector = function (encodings) {
  return encodings.map(function (className) {
    return 'tr.' + className;
  }).join(', ');
};

/**
 * Static helper, shows/hides rows under provided element according to the given
 * encoding setting.
 * @param {jQuery} rootElement - root of elements to show/hide
 * @param {EncodingType[]} encodings - a message encoding setting
 */
NetSimEncodingControl.hideRowsByEncoding = function (rootElement, encodings) {
  var hiddenEncodings = [];
  for (var key in EncodingType) {
    if (EncodingType.hasOwnProperty(key) &&
        encodings.indexOf(EncodingType[key]) === -1) {
      hiddenEncodings.push(EncodingType[key]);
    }
  }
  rootElement.find(makeEncodingRowSelector(encodings)).show();
  rootElement.find(makeEncodingRowSelector(hiddenEncodings)).hide();
};

/**
 * Static helper that converts a given array of encodings to an object
 * mapping each encoding to `true`. Used for more efficient
 * isEncodingEnabled checks
 * @param {EncodingType[]} encodings
 * @returns {Object.<EncodingType, boolean>}
 */
NetSimEncodingControl.encodingsAsHash = function (encodings) {
  return encodings.reduce(function (hash, encoding) {
    hash[encoding] = true;
    return hash;
  }, {});
};
