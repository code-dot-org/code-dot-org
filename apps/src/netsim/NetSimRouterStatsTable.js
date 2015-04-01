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

var markup = require('./NetSimRouterStatsTable.html');

/**
 * Generator and controller for DNS network lookup table component.
 * Shows different amounts of information depending on the DNS mode.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @constructor
 */
var NetSimRouterStatsTable = module.exports = function (rootDiv) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * Router's total memory capacity, in bits.
   * @type {number}
   * @private
   */
  this.totalMemory_ = 0;

  /**
   * Current size of the router's packet queue, in bits.
   * @type {number}
   * @private
   */
  this.usedMemory_ = 0;

  /**
   * @type {Array}
   * @private
   */
  this.routerLogData_ = [];

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterStatsTable.prototype.render = function () {
  var renderedMarkup = $(markup({
    totalMemory: this.totalMemory_,
    usedMemory: this.usedMemory_
  }));
  this.rootDiv_.html(renderedMarkup);
};

/**
 * @param {Array} logData
 */
NetSimRouterStatsTable.prototype.setRouterLogData = function (logData) {
  this.routerLogData_ = logData;
  this.render();
};

/** @param {number} totalMemoryInBits */
NetSimRouterStatsTable.prototype.setTotalMemory = function (totalMemoryInBits) {
  this.totalMemory_ = totalMemoryInBits;
  this.render();
};

/** @param {number} usedMemoryInBits */
NetSimRouterStatsTable.prototype.setMemoryInUse = function (usedMemoryInBits) {
  this.usedMemory_ = usedMemoryInBits;
  this.render();
};
