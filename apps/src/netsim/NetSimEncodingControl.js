/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */
'use strict';

var markup = require('./NetSimEncodingControl.html');

/**
 * Generator and controller for message encoding selector: A dropdown that
 * controls whether messages are displayed in some combination of binary, hex,
 * decimal, ascii, etc.
 * @param {jQuery} rootDiv
 * @param {function} changeEncodingCallback
 * @constructor
 */
var NetSimEncodingControl = module.exports = function (rootDiv,
    changeEncodingCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.changeEncodingCallback_ = changeEncodingCallback;

  /**
   * @type {jQuery}
   * @private
   */
  this.select_ = null;

  // Initial render
  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimEncodingControl.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.select_ = this.rootDiv_.find('select');
  this.select_.change(this.onSelectChange_.bind(this));

};

/**
 * Send new value to registered callback on change.
 * @private
 */
NetSimEncodingControl.prototype.onSelectChange_ = function () {
  this.changeEncodingCallback_(this.select_.val());
};

/**
 * Change selector value to the new provided value.
 * @param newEncoding
 */
NetSimEncodingControl.prototype.setEncoding = function (newEncoding) {
  this.select_.val(newEncoding);
};

/**
 * Static helper, shows/hides rows under provided element according to the given
 * encoding setting.
 * @param {jQuery} rootElement - root of elements to show/hide
 * @param {string} encoding - a message encoding setting
 */
NetSimEncodingControl.hideRowsByEncoding = function (rootElement, encoding) {
  if (encoding === 'all') {
    rootElement.find('tr.binary, tr.hexadecimal, tr.decimal, tr.ascii').show();
  } else if (encoding === 'binary') {
    rootElement.find('tr.binary').show();
    rootElement.find('tr.hexadecimal, tr.decimal, tr.ascii').hide();
  } else if (encoding === 'hexadecimal') {
    rootElement.find('tr.binary, tr.hexadecimal').show();
    rootElement.find('tr.decimal, tr.ascii').hide();
  } else if (encoding === 'decimal') {
    rootElement.find('tr.binary, tr.decimal').show();
    rootElement.find('tr.hexadecimal, tr.ascii').hide();
  } else if (encoding === 'ascii') {
    rootElement.find('tr.binary, tr.ascii').show();
    rootElement.find('tr.hexadecimal, tr.decimal').hide();
  }
};

