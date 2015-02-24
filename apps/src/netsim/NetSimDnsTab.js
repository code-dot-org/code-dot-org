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
var NetSimDnsManualControl = require('./NetSimDnsManualControl');

/**
 * Generator and controller for "My Device" tab.
 * @param {jQuery} rootDiv
 * @param {function} dnsModeChangeCallback
 * @param {function} becomeDnsCallback
 * @constructor
 */
var NetSimDnsTab = module.exports = function (rootDiv,
    dnsModeChangeCallback, becomeDnsCallback) {
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
   * @type {function}
   * @private
   */
  this.becomeDnsCallback_ = becomeDnsCallback;

  /**
   * @type {NetSimDnsModeControl}
   * @private
   */
  this.dnsModeControl_ = null;

  /**
   * @type {NetSimDnsManualControl}
   * @private
   */
  this.dnsManualControl_ = null;

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
  this.dnsManualControl_ = new NetSimDnsManualControl(
      this.rootDiv_.find('.dns_manual_control'),
      this.becomeDnsCallback_);
};

/**
 * @param {string} newDnsMode
 */
NetSimDnsTab.prototype.setDnsMode = function (newDnsMode) {
  this.dnsModeControl_.setDnsMode(newDnsMode);
  if (newDnsMode === 'manual') {
    this.rootDiv_.find('.dns_manual_control').show();
  } else {
    this.rootDiv_.find('.dns_manual_control').hide();
  }
};

/**
 * @param {boolean} isDnsNode
 */
NetSimDnsTab.prototype.setIsDnsNode = function (isDnsNode) {
  this.dnsManualControl_.setIsDnsNode(isDnsNode);
};
