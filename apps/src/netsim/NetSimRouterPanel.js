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
 * Generator and controller for router information view.
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimRouterPanel = module.exports = function (connection) {
  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges
      .register(this.onConnectionStatusChange_.bind(this));

  /**
   * Cached reference to router
   * @type {NetSimRouterNode}
   * @private
   */
  this.myConnectedRouter = undefined;
};

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
 * Handler for connection status changes.  Can update configuration and
 * trigger a refresh of this view.
 * @private
 */
NetSimRouterPanel.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    if (this.connection_.myNode.myRouter !== this.myConnectedRouter) {
      this.myConnectedRouter = this.connection_.myNode.myRouter;
      // TODO : Attach to router change listener
    }
  } else {
    this.myConnectedRouter = undefined;
    this.refresh();
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
