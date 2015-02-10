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
var periodicAction = require('./periodicAction');

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
   * Helper for triggering refresh on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicRefresh_ = periodicAction(this.refresh.bind(this),
      AUTO_REFRESH_INTERVAL_MS);

  /**
   * Cached reference to router
   * @type {NetSimNodeRouter}
   * @private
   */
  this.myConnectedRouter = undefined;
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
  controller.bindElements_();
  controller.refresh();
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimRouterPanel.prototype.bindElements_ = function () {
  this.rootDiv_ = $('#netsim_router_panel');
  this.connectedSpan_ = this.rootDiv_.find('#connected');
  this.notConnectedSpan_ = this.rootDiv_.find('#not_connected');
  this.networkTable_ = this.rootDiv_.find('#netsim_router_network_table');
};

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimRouterPanel.prototype.attachToRunLoop = function (runLoop) {
  this.periodicRefresh_.attachToRunLoop(runLoop);
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a refresh of this view.
 * @private
 */
NetSimRouterPanel.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    if (this.connection_.myNode.myRouter !== this.myConnectedRouter) {
      this.myConnectedRouter = this.connection_.myNode.myRouter;
      this.periodicRefresh_.enable();
      // TODO : Attach to router change listener
    }
  } else {
    this.myConnectedRouter = undefined;
    this.refresh();
    this.periodicRefresh_.disable();
  }
};

/** Update the address table to show the list of nodes in the local network. */
NetSimRouterPanel.prototype.refresh = function () {
  if (this.myConnectedRouter) {
    this.connectedSpan_.show();
    this.notConnectedSpan_.hide();

    var self = this;
    this.myConnectedRouter.getAddressTable(function (rows) {
      self.networkTable_.empty();
      $('<tr><th>Hostname</th><th>Address</th></tr>')
          .appendTo(self.networkTable_);
      rows.forEach(function (row) {
        $('<tr><td>' + row.hostname + '</td><td>' + row.address + '</td></tr>')
            .appendTo(self.networkTable_);
      });
    });
  } else {
    this.notConnectedSpan_.show();
    this.connectedSpan_.hide();
  }
};
