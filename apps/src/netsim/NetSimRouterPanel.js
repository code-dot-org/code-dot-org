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
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimLogger = require('./NetSimLogger');

var logger = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

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
  this.connection_.shardChange.register(this.onShardChange_.bind(this));
  logger.info("RouterPanel registered to connection shardChange");

  /**
   * Cached reference to router
   * @type {NetSimRouterNode}
   * @private
   */
  this.myConnectedRouter = null;
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

  this.dnsModeRadios_ = this.rootDiv_.find('input[type="radio"][name="dns_mode"]');
  this.dnsModeRadios_.change(this.onDnsModeChange_.bind(this));
  this.dnsModeNone_ = this.dnsModeRadios_.siblings('#dns_mode_none');
  this.dnsModeManual_ = this.dnsModeRadios_.siblings('#dns_mode_manual');
  this.dnsModeAutomatic_ = this.dnsModeRadios_.siblings('#dns_mode_automatic');

  this.connectedSpan_ = this.rootDiv_.find('#connected');
  this.notConnectedSpan_ = this.rootDiv_.find('#not_connected');
  this.networkTable_ = this.rootDiv_.find('#netsim_router_network_table');
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {?NetSimShard} newShard - null if disconnected.
 * @param {?NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSimRouterPanel.prototype.onShardChange_= function (newShard, localNode) {
  if (localNode) {
    localNode.routerChange.register(this.onRouterChange_.bind(this));
    logger.info("RouterPanel registered to localNode routerChange");
  }
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @param {?NetSimWire} wire - null if disconnected.
 * @param {?NetSimRouterNode} router - null if disconnected
 * @private
 */
NetSimRouterPanel.prototype.onRouterChange_ = function (wire, router) {
  this.myConnectedRouter = router;
  this.refresh();
  if (router) {
    router.stateChange.register(this.onRouterStateChange_.bind(this));
    logger.info("RouterPanel registered to router stateChange");

    router.addressTableChange.register(this.onAddressTableChange_.bind(this));
    logger.info("RouterPanel registered to router addressTableChange");
  }
};

NetSimRouterPanel.prototype.onRouterStateChange_ = function () {
  this.refresh();
};

NetSimRouterPanel.prototype.onAddressTableChange_ = function (addressTableData) {
  this.refreshAddressTable_(addressTableData);
};

NetSimRouterPanel.prototype.onDnsModeChange_ = function () {
  var router = this.myConnectedRouter;
  router.dnsMode = this.dnsModeRadios_.siblings(':checked').val();
  router.update();
};

/** Update the address table to show the list of nodes in the local network. */
NetSimRouterPanel.prototype.refresh = function () {
  if (this.myConnectedRouter) {
    this.connectedSpan_.show();
    this.notConnectedSpan_.hide();
    this.refreshDnsModeSelector_();
    this.refreshAddressTable_(this.myConnectedRouter.getAddressTable());
  } else {
    this.notConnectedSpan_.show();
    this.connectedSpan_.hide();
  }
};

NetSimRouterPanel.prototype.refreshDnsModeSelector_ = function () {
  var dnsMode = this.getDnsMode_();
  if (dnsMode === NetSimRouterNode.DnsMode.NONE) {
    this.dnsModeNone_.prop('checked', true);
  } else if (dnsMode === NetSimRouterNode.DnsMode.MANUAL) {
    this.dnsModeManual_.prop('checked', true);
  } else if (dnsMode === NetSimRouterNode.DnsMode.AUTOMATIC) {
    this.dnsModeAutomatic_.prop('checked', true);
  }
};

NetSimRouterPanel.prototype.refreshAddressTable_ = function (addressTableData) {
  var dnsMode = this.getDnsMode_();
  var tableBody = this.networkTable_.find('tbody');
  tableBody.empty();

  addressTableData.forEach(function (row) {
    var displayHostname = row.hostname;
    if (row.isDnsNode && dnsMode !== NetSimRouterNode.DnsMode.NONE) {
      displayHostname += " (DNS)";
    }
    var displayAddress = '';
    if (dnsMode === NetSimRouterNode.DnsMode.NONE || row.isDnsNode || row.isLocal) {
      displayAddress = row.address;
    }

    var tableRow = $('<tr>');
    $('<td>').html(displayHostname).appendTo(tableRow);
    $('<td>').html(displayAddress).appendTo(tableRow);

    if (row.isLocal) {
      tableRow.addClass('localNode');
    }

    if (row.isDnsNode){
      tableRow.addClass('dnsNode');
    }

    tableRow.appendTo(tableBody);
  });
};

NetSimRouterPanel.prototype.getDnsMode_ = function () {
  if (this.myConnectedRouter) {
    return this.myConnectedRouter.dnsMode;
  }
  return NetSimRouterNode.DnsMode.NONE;
};