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

var buildMarkup = require('./NetSimTabsComponent.html');
var NetSimRouterTab = require('./NetSimRouterTab');
var NetSimMyDeviceTab = require('./NetSimMyDeviceTab');
var NetSimDnsTab = require('./NetSimDnsTab');

/**
 * Wrapper component for tabs panel on the right side of the page.
 * @param {jQuery} rootDiv
 * @param {NetSimConnection} connection
 * @param {function} chunkSizeChangeCallback
 * @param {function} encodingChangeCallback
 * @param {function} dnsModeChangeCallback
 * @param {function} becomeDnsCallback
 * @constructor
 */
var NetSimTabsComponent = module.exports = function (rootDiv, connection,
    chunkSizeChangeCallback, encodingChangeCallback, dnsModeChangeCallback,
    becomeDnsCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * Connection to simulation
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;

  /**
   * @type {function}
   * @private
   */
  this.chunkSizeChangeCallback_ = chunkSizeChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.encodingChangeCallback_ = encodingChangeCallback;

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
   * @type {NetSimRouterTab}
   * @private
   */
  this.routerTab_ = null;

  /**
   * @type {NetSimMyDeviceTab}
   * @private
   */
  this.myDeviceTab_ = null;

  /**
   * @type {NetSimDnsTab}
   * @private
   */
  this.dnsTab_ = null;

  // Initial render
  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimTabsComponent.prototype.render = function () {
  var rawMarkup = buildMarkup({});
  var jQueryWrap = $(rawMarkup);
  this.rootDiv_.html(jQueryWrap);
  this.rootDiv_.find('.netsim_tabs').tabs();

  // TODO: Remove the old one?  What cleanup needs to happen?
  this.routerTab_ = new NetSimRouterTab(
      this.rootDiv_.find('#tab_router'),
      this.connection_);

  this.myDeviceTab_ = new NetSimMyDeviceTab(
      this.rootDiv_.find('#tab_my_device'),
      this.chunkSizeChangeCallback_,
      this.encodingChangeCallback_);

  this.dnsTab_ = new NetSimDnsTab(
      this.rootDiv_.find('#tab_dns'),
      this.dnsModeChangeCallback_,
      this.becomeDnsCallback_);
};

/**
 * @param {number} newChunkSize
 */
NetSimTabsComponent.prototype.setChunkSize = function (newChunkSize) {
  this.myDeviceTab_.setChunkSize(newChunkSize);
};

/**
 * @param {string} newEncoding
 */
NetSimTabsComponent.prototype.setEncoding = function (newEncoding) {
  this.myDeviceTab_.setEncoding(newEncoding);
};

/**
 * @param {string} newDnsMode
 */
NetSimTabsComponent.prototype.setDnsMode = function (newDnsMode) {
  this.dnsTab_.setDnsMode(newDnsMode);
};

/**
 * @param {boolean} isDnsNode
 */
NetSimTabsComponent.prototype.setIsDnsNode = function (isDnsNode) {
  this.dnsTab_.setIsDnsNode(isDnsNode);
};