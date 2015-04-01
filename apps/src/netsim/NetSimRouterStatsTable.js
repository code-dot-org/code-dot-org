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
    tableData: this.routerLogData_
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
