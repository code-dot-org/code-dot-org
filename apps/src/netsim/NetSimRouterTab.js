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

var markup = require('./NetSimRouterTab.html');
var NetSimBandwidthControl = require('./NetSimBandwidthControl');
var NetSimRouterLogTable = require('./NetSimRouterLogTable');

/**
 * Generator and controller for router information view.
 * @param {jQuery} rootDiv - Parent element for this component.
 * @param {netsimLevelConfiguration} levelConfig
 * @param {function} bandwidthChangeCallback
 * @constructor
 */
var NetSimRouterTab = module.exports = function (rootDiv, levelConfig,
    bandwidthChangeCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {function}
   * @private
   */
  this.bandwidthChangeCallback_ = bandwidthChangeCallback;

  /**
   * @type {NetSimRouterLogTable}
   * @private
   */
  this.routerLogTable_ = null;

  /**
   * @type {NetSimBandwidthControl}
   * @private
   */
  this.bandwidthControl_ = null;

  // Initial render
  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state.
 */
NetSimRouterTab.prototype.render = function () {
  var renderedMarkup = $(markup({
    level: this.levelConfig_
  }));
  this.rootDiv_.html(renderedMarkup);
  this.routerLogTable_ = new NetSimRouterLogTable(
      this.rootDiv_.find('.router_log_table'), this.levelConfig_);
  if (this.levelConfig_.showRouterBandwidthControl) {
    this.bandwidthControl_ = new NetSimBandwidthControl(
        this.rootDiv_.find('.bandwidth-control'), this.bandwidthChangeCallback_);
  }
};

/**
 * @param {Array} logData
 */
NetSimRouterTab.prototype.setRouterLogData = function (logData) {
  this.routerLogTable_.setRouterLogData(logData);
};

/**
 * @param {number} newBandwidth in bits/second
 */
NetSimRouterTab.prototype.setBandwidth = function (newBandwidth) {
  if (this.bandwidthControl_) {
    this.bandwidthControl_.setBandwidth(newBandwidth);
  }
};

/**
 * @param {number} newMemory in bits/second
 */
NetSimRouterTab.prototype.setMemory = function (/*newMemory*/) {
  // TODO
};
