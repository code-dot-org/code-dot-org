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

require('../utils');
var netsimNodeFactory = require('./netsimNodeFactory');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimLogger = require('./NetSimLogger');
var markup = require('./NetSimLobby.html');
var NodeType = require('./netsimConstants').NodeType;

var logger = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

/**
 * Generator and controller for shard lobby/connection controls.
 *
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimConnection} connection - The shard connection that this
 *        lobby control will manipulate.
 * @constructor
 */
var NetSimLobby = module.exports = function (levelConfig, connection) {
  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * Shard connection that this lobby control will manipulate.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this.refresh_.bind(this));
  logger.info("NetSimLobby registered to connection statusChanges");
  this.connection_.shardChange.register(this.onShardChange_.bind(this));
  logger.info("NetSimLobby registered to connection shardChanges");

  /**
   * A reference to the currently connected shard.
   * @type {?NetSimShard}
   * @private
   */
  this.shard_ = null;

  /**
   * Which node in the lobby is currently selected
   * @type {NetSimClientNode|NetSimRouterNode}
   * @private
   */
  this.selectedNode_ = null;

  /**
   * Which listItem DOM element is currently selected
   * @type {*}
   * @private
   */
  this.selectedListItem_ = undefined;
};

/**
 * Generate a new NetSimLobby object, putting
 * its markup within the provided element and returning
 * the controller object.
 * @param {HTMLElement} element The container for the lobby markup
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimConnection} connection The connection manager to use
 * @return {NetSimLobby} A new controller for the generated lobby
 * @static
 */
NetSimLobby.createWithin = function (element, levelConfig, connection) {
  // Create a new NetSimLobby
  var controller = new NetSimLobby(levelConfig, connection);
  element.innerHTML = markup({
    level: levelConfig
  });
  controller.bindElements_();
  controller.refresh_();
  return controller;
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  // Root
  this.openRoot_ = $('#netsim_lobby_open');

  this.addRouterButton_ = this.openRoot_.find('#netsim_lobby_add_router');
  this.addRouterButton_.click(this.addRouterButtonClick_.bind(this));
  this.lobbyList_ = this.openRoot_.find('#netsim_lobby_list');
  this.connectButton_ = this.openRoot_.find('#netsim_lobby_connect');
  this.connectButton_.click(this.connectButtonClick_.bind(this));
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {?NetSimShard} newShard - null if disconnected.
 * @private
 */
NetSimLobby.prototype.onShardChange_= function (newShard) {
  this.shard_ = newShard;
  if (this.shard_ !== null) {
    this.shard_.nodeTable.tableChange
        .register(this.onNodeTableChange_.bind(this));
    logger.info("NetSimLobby registered to nodeTable tableChange");
  }
};

/**
 * Called whenever a change is detected in the nodes table - which should
 * trigger a refresh of the lobby listing
 * @param {!Array} rows
 * @private
 */
NetSimLobby.prototype.onNodeTableChange_ = function (rows) {
  // Refresh lobby listing.
  var nodes = netsimNodeFactory.nodesFromRows(this.shard_, rows);
  this.refreshLobbyList_(nodes);
};

/** Handler for clicking the "Add Router" button. */
NetSimLobby.prototype.addRouterButtonClick_ = function () {
  this.connection_.addRouterToLobby();
};

/** Handler for clicking the "Connect" button. */
NetSimLobby.prototype.connectButtonClick_ = function () {
  if (!this.selectedNode_) {
    return;
  }

  if (this.selectedNode_ instanceof NetSimRouterNode) {
    this.connection_.connectToRouter(this.selectedNode_.entityID);
  } else if (this.selectedNode_ instanceof NetSimClientNode) {
    this.connection_.connectToRemoteClient(this.selectedNode_);
  }
};

/**
 * Show preconnect controls (name, shard-select) and actual lobby listing.
 * @private
 */
NetSimLobby.prototype.refresh_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    return;
  }

  this.openRoot_.show();
  this.addRouterButton_.show();
  this.lobbyList_.show();
  this.connectButton_.show();
  this.connection_.getAllNodes(function (lobbyData) {
    this.refreshLobbyList_(lobbyData);
  }.bind(this));
};

/**
 * Reload the lobby listing of nodes.
 * @param {!NetSimNode[]} lobbyData
 * @private
 */
NetSimLobby.prototype.refreshLobbyList_ = function (lobbyData) {
  this.lobbyList_.empty();

  var filteredLobbyData = lobbyData.filter(function (simNode) {
    var showClients = this.levelConfig_.showClientsInLobby;
    var showRouters = this.levelConfig_.showRoutersInLobby;
    var nodeType = simNode.getNodeType();
    return (nodeType === NodeType.CLIENT && showClients) ||
        (nodeType === NodeType.ROUTER && showRouters);
  }.bind(this));

  filteredLobbyData.sort(function (a, b) {
    // TODO (bbuchanan): Make this sort localization-friendly.
    if (a.getDisplayName() > b.getDisplayName()) {
      return 1;
    }
    return -1;
  });

  this.selectedListItem_ = undefined;
  filteredLobbyData.forEach(function (simNode) {
    var item = $('<li>').html(
        simNode.getDisplayName() + ' : ' +
        simNode.getStatus() + ' ' +
        simNode.getStatusDetail());

    // Style rows by row type.
    if (simNode.getNodeType() === NodeType.ROUTER) {
      item.addClass('router-row');
    } else {
      item.addClass('user-row');
      if (simNode.entityID === this.connection_.myNode.entityID) {
        item.addClass('own-row');
      }
    }

    // Specify by style which rows can be selected (handles rollover behavior)
    if (this.canConnectToNode_(simNode)) {
      item.addClass('selectable-row');
    }

    // Preserve selected item across refresh.
    if (this.selectedNode_ && simNode.entityID === this.selectedNode_.entityID) {
      item.addClass('selected-row');
      this.selectedListItem_ = item;
    }

    item.click(this.onRowClick_.bind(this, item, simNode));
    item.appendTo(this.lobbyList_);
  }.bind(this));

  this.onSelectionChange();
};

/**
 * @param {jQuery} listItem - Clicked row
 * @param {NetSimNode} connectionTarget - Node represented by clicked row
 * @private
 */
NetSimLobby.prototype.onRowClick_ = function (listItem, connectionTarget) {
  // Don't even allow selection of nodes we can't connect to.
  if (!this.canConnectToNode_(connectionTarget)) {
    return;
  }

  var oldSelectedNode = this.selectedNode_;
  var oldSelectedListItem = this.selectedListItem_;

  // Deselect old row
  if (oldSelectedListItem) {
    oldSelectedListItem.removeClass('selected-row');
  }
  this.selectedNode_ = null;
  this.selectedListItem_ = undefined;

  // If we clicked on a different row, select the new row
  if (!oldSelectedNode || connectionTarget.entityID !== oldSelectedNode.entityID) {
    this.selectedNode_ = connectionTarget;
    this.selectedListItem_ = listItem;
    this.selectedListItem_.addClass('selected-row');
  }

  this.onSelectionChange();
};

/**
 * Check whether the level configuration allows connections to the specified
 * node.
 * @param {NetSimNode} connectionTarget
 * @returns {boolean} whether connection to the target is allowed
 * @private
 */
NetSimLobby.prototype.canConnectToNode_ = function (connectionTarget) {
  // Can't connect to own node
  if (connectionTarget.entityID === this.connection_.myNode.entityID) {
    return false;
  }

  // Permissible connection limited by level configuration
  return (
      this.levelConfig_.canConnectToClients &&
      connectionTarget.getNodeType() === NodeType.CLIENT
      ) || (
      this.levelConfig_.canConnectToRouters &&
      connectionTarget.getNodeType() === NodeType.ROUTER );
};

/** Handler for selecting/deselcting a row in the lobby listing. */
NetSimLobby.prototype.onSelectionChange = function () {
  this.connectButton_.attr('disabled', (this.selectedListItem_ === undefined));
};
