/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var markup = require('./NetSimDnsTab.html');
var NetSimDnsModeControl = require('./NetSimDnsModeControl');

/**
 * Generator and controller for "My Device" tab.
 * @param {jQuery} rootDiv
 * @param {function} dnsModeChangeCallback
 * @constructor
 */
var NetSimDnsTab = module.exports = function (rootDiv,
    dnsModeChangeCallback) {
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
  this.dnsModeChangeCallback_ = dnsModeChangeCallback;

  /**
   * @type {NetSimDnsModeControl}
   * @private
   */
  this.dnsModeControl_ = null;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimDnsTab.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.dnsModeControl_ = new NetSimDnsModeControl(
      this.rootDiv_.find('.dns_mode'),
      this.dnsModeChangeCallback_);
};

/**
 * @param {string} newDnsMode
 */
NetSimDnsTab.prototype.setDnsMode = function (newDnsMode) {
  this.dnsModeControl_.setDnsMode(newDnsMode);
};
