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

var markup = require('./NetSimRouterLogTable.html');
var NetSimRouterNode = require('./NetSimRouterNode');
var DnsMode = NetSimRouterNode.DnsMode;

/**
 * Generator and controller for DNS network lookup table component.
 * Shows different amounts of information depending on the DNS mode.
 *
 * @param {jQuery} rootDiv
 * @constructor
 */
var NetSimRouterLogTable = module.exports = function (rootDiv) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {DnsMode}
   * @private
   */
  this.dnsMode_ = DnsMode.NONE;

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
    dnsMode: this.dnsMode_,
    tableData: this.routerLogData_
  }));
  this.rootDiv_.html(renderedMarkup);
};

/**
 * @param {DnsMode} newDnsMode
 */
NetSimRouterLogTable.prototype.setDnsMode = function (newDnsMode) {
  this.dnsMode_ = newDnsMode;
  this.render();
};

/**
 * @param {Array} tableContents
 */
NetSimRouterLogTable.prototype.setDnsTableContents = function (tableContents) {
  this.routerLogData_ = tableContents;
  this.render();
};
