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

var markup = require('./NetSimEncodingSelector.html');


/**
 * Generator and controller for message encoding selector: A dropdown that
 * controls whether messages are displayed in some combination of binary, hex,
 * decimal, ascii, etc.
 * @param {function} changeEncodingCallback
 * @constructor
 */
var NetSimEncodingSelector = module.exports = function (changeEncodingCallback) {
  this.changeEncodingCallback_ = changeEncodingCallback;
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimEncodingSelector.uniqueIDCounter = 0;

/**
 * Generate a new NetSimEncodingSelector, putting it on the page.
 * @param {HTMLElement} element
 * @param {function} changeEncodingCallback
 */
NetSimEncodingSelector.createWithin = function (element, changeEncodingCallback) {
  var controller = new NetSimEncodingSelector(changeEncodingCallback);

  var instanceID = NetSimEncodingSelector.uniqueIDCounter;
  NetSimEncodingSelector.uniqueIDCounter++;

  element.innerHTML = markup({
    instanceID: instanceID
  });
  controller.bindElements_(instanceID);
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimEncodingSelector.prototype.bindElements_ = function (instanceID) {
  this.rootDiv_ = $('#netsim_encoding_selector_' + instanceID);
  this.select_ = this.rootDiv_.find('select');
  this.select_.change(this.onSelectChange_.bind(this));
};

NetSimEncodingSelector.prototype.render = function () {
  // What changes?
};

NetSimEncodingSelector.prototype.onSelectChange_ = function () {
  this.changeEncodingCallback_(this.select_.val());
};

/**
 * Static helper, shows/hides rows under provided element according to the given
 * encoding setting.
 * @param {jQuery} rootElement - root of elements to show/hide
 * @param {string} encoding - a message encoding setting
 */
NetSimEncodingSelector.hideRowsByEncoding = function (rootElement, encoding) {
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

