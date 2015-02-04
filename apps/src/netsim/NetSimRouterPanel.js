/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generator and controller for router information view.
 */

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

var markup = require('./NetSimRouterPanel.html');

/**
 * How often the lobby should be auto-refreshed.
 * @type {number}
 * @const
 */
var AUTO_REFRESH_INTERVAL_MS = 5000;

/**
 *
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimRouterPanel = function (connection) {
  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this, this.onConnectionStatusChange_);

  /**
   * When the lobby should be refreshed next
   * @type {Number}
   * @private
   */
  this.nextAutoRefreshTime_ = Infinity;

  /**
   * Cached reference to router
   * @type {NetSimRouter}
   * @private
   */
  this.router_ = undefined;
};
module.exports = NetSimRouterPanel;

/**
 * Generate a new NetSimRouterPanel, puttig it on the page and hooking
 * it up to the given connection where it will update to reflect the
 * state of the connected router, if there is one.
 * @param element
 * @param connection
 */
NetSimRouterPanel.createWithin = function (element, connection) {
  var controller = new NetSimRouterPanel(connection);
  element.innerHTML = markup({});
  controller.initialize();
  return controller;
};

NetSimRouterPanel.prototype.initialize = function () {
  this.bindElements_();
  this.refresh();
};

NetSimRouterPanel.prototype.bindElements_ = function () {
  this.rootDiv_ = $('#netsim_router_panel');
  this.connectedSpan_ = this.rootDiv_.find('#connected');
  this.notConnectedSpan_ = this.rootDiv_.find('#not_connected');
  this.networkTable_ = this.rootDiv_.find('#netsim_router_network_table');
};

NetSimRouterPanel.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    if (this.connection_.router_ !== this.router_) {
      this.router_ = this.connection_.router_;
      this.nextAutoRefreshTime_ = 0;
      // TODO : Attach to router change listener
    }
  } else {
    this.router_ = undefined;
    this.nextAutoRefreshTime_ = Infinity;
  }
};

NetSimRouterPanel.prototype.refresh = function () {
  if (this.router_) {
    this.connectedSpan_.show();
    this.notConnectedSpan_.hide();

    var self = this;
    this.router_.getAddressTable(function (rows) {
      self.networkTable_.empty();
      $('<tr><th>Hostname</th><th>Address</th></tr>').
          appendTo(self.networkTable_);
      rows.forEach(function (row) {
        $('<tr><td>' + row.hostname + '</td><td>' + row.address + '</td></tr>').
            appendTo(self.networkTable_);
      });
    });
  } else {
    this.notConnectedSpan_.show();
    this.connectedSpan_.hide();
  }
};

/**
 *
 * @param {RunLoop.Clock} clock
 */
NetSimRouterPanel.prototype.tick = function (clock) {
  if (clock.time >= this.nextAutoRefreshTime_) {
    this.refresh();
    var refreshInterval = AUTO_REFRESH_INTERVAL_MS;

    // TODO (bbuchanan) : Extract "interval" method generator for this and connection.
    if (this.nextAutoRefreshTime_ === 0) {
      this.nextAutoRefreshTime_ = clock.time + refreshInterval;
    } else {
      // Stable increment
      while (this.nextAutoRefreshTime_ < clock.time) {
        this.nextAutoRefreshTime_ += refreshInterval;
      }
    }
  }
};