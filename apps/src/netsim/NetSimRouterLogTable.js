/**
 * @overview Router log table UI component on the "Router" tab.
 */
'use strict';

var markup = require('./NetSimRouterLogTable.html.ejs');

/**
 * Generator and controller for DNS network lookup table component.
 * Shows different amounts of information depending on the DNS mode.
 *
 * @param {jQuery} rootDiv
 * @param {NetSimLevelConfiguration} levelConfig
 * @constructor
 */
var NetSimRouterLogTable = module.exports = function (rootDiv, levelConfig) {
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
   * @type {Array}
   * @private
   */
  this.routerLogData_ = [];

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterLogTable.prototype.render = function () {
  var renderedMarkup = $(markup({
    level: this.levelConfig_,
    tableData: this.routerLogData_
  }));
  this.rootDiv_.html(renderedMarkup);
};

/**
 * @param {Array} logData
 */
NetSimRouterLogTable.prototype.setRouterLogData = function (logData) {
  this.routerLogData_ = logData;
  this.render();
};
