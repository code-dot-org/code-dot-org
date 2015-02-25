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
var NetSimLogger = require('./NetSimLogger');

var logger = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

/**
 * Generator and controller for router information view.
 * @param {jQuery} rootDiv - Parent element for this component.
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimRouterTab = module.exports = function (rootDiv, connection) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

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

  // Initial render
  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state.
 */
NetSimRouterTab.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.bindElements_();
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimRouterTab.prototype.bindElements_ = function () {
  this.connectedDiv_ = this.rootDiv_.find('div.connected');
  this.notConnectedDiv_ = this.rootDiv_.find('div.not_connected');

  this.routerLogDiv_ = this.rootDiv_.find('#router_log');
  this.routerLogTable_ = this.routerLogDiv_.find('#netsim_router_log_table');
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {NetSimShard} newShard - null if disconnected.
 * @param {NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSimRouterTab.prototype.onShardChange_= function (newShard, localNode) {
  this.myLocalNode = localNode;
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
NetSimRouterTab.prototype.onRouterChange_ = function (wire, router) {

  // Unhook old handlers
  if (this.routerStateChangeKey !== undefined) {
    this.myConnectedRouter.stateChange.unregister(this.routerStateChangeKey);
    this.routerStateChangeKey = undefined;
    logger.info("RouterPanel unregistered from router stateChange");
  }

  if (this.routerLogChangeKey !== undefined) {
    this.myConnectedRouter.logChange.unregister(this.routerLogChangeKey);
    this.routerLogChangeKey = undefined;
    logger.info("RouterPanel unregistered from router logChange");
  }

  // Update connected router
  this.myConnectedRouter = router;
  this.refresh();

  // Hook up new handlers
  if (router) {
    this.routerStateChangeKey = router.stateChange.register(
        this.onRouterStateChange_.bind(this));
    logger.info("RouterPanel registered to router stateChange");

    this.routerLogChangeKey = router.logChange.register(
        this.onRouterLogChange_.bind(this));
  }
};

NetSimRouterTab.prototype.onRouterStateChange_ = function () {
  this.refresh();
};

NetSimRouterTab.prototype.onRouterLogChange_ = function () {
  this.refreshLogTable_(this.myConnectedRouter.getLog());
};

/** Update the address table to show the list of nodes in the local network. */
NetSimRouterTab.prototype.refresh = function () {
  if (this.myConnectedRouter) {
    this.connectedDiv_.show();
    this.notConnectedDiv_.hide();
    this.refreshLogTable_(this.myConnectedRouter.getLog());
  } else {
    this.notConnectedDiv_.show();
    this.connectedDiv_.hide();
  }
};

NetSimRouterTab.prototype.refreshLogTable_ = function (logTableData) {
  var tableBody = this.routerLogTable_.find('tbody');
  tableBody.empty();

  // Sort: Most recent first
  logTableData.sort(function (a, b) {
    return a.timestamp > b.timestamp ? -1 : 1;
  });

  logTableData.forEach(function (entry) {
    var tableRow = $('<tr>');
    $('<td>').html(entry.logText).appendTo(tableRow);

    tableRow.appendTo(tableBody);
  }.bind(this));
};
