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

/**
 * Wrapper component for tabs panel on the right side of the page.
 * @param {jQuery} rootDiv
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimTabsComponent = module.exports = function (rootDiv, connection) {
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
};
