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

var utils = require('../utils');
var _ = utils.getLodash();
var i18n = require('../../locale/current/netsim');
var netsimNodeFactory = require('./netsimNodeFactory');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimLogger = require('./NetSimLogger');
var NetSimPanel = require('./NetSimPanel');
var markup = require('./NetSimLobby.html');
var NodeType = require('./netsimConstants').NodeType;

var logger = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

/**
 * Generator and controller for lobby/connection controls.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimConnection} connection - The shard connection that this
 *        lobby control will manipulate.
 * @constructor
 * @augments NetSimPanel
 */
var NetSimLobby = module.exports = function (rootDiv, levelConfig, connection) {
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

  /**
   * A reference to the currently connected shard.
   * @type {?NetSimShard}
   * @private
   */
  this.shard_ = null;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = [];

  /**
   * Which node in the lobby is currently selected
   * @type {NetSimClientNode|NetSimRouterNode}
   * @private
   */
  this.selectedNode_ = null;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-lobby-panel',
    panelTitle: i18n.lobby(),
    canMinimize: false
  });

  this.connection_.statusChanges.register(this.render.bind(this));
  logger.info("NetSimLobby registered to connection statusChanges");
  this.connection_.shardChange.register(this.onShardChange_.bind(this));
  logger.info("NetSimLobby registered to connection shardChanges");
};
NetSimLobby.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimLobby.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimLobby.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    level: this.levelConfig_,
    nodesOnShard: this.nodesOnShard_,
    isMyNode: this.isMyNode_.bind(this),
    canConnectToNode: this.canConnectToNode_.bind(this),
    isSelectedNode: this.isSelectedNode_.bind(this)
  }));
  this.getBody().html(newMarkup);

  this.addRouterButton_ = this.getBody().find('#netsim_lobby_add_router');
  this.addRouterButton_.click(this.addRouterButtonClick_.bind(this));

  this.connectButton_ = this.getBody().find('#netsim_lobby_connect');
  this.connectButton_.click(this.connectButtonClick_.bind(this));

  this.getBody().find('.selectable-row').click(this.onRowClick_.bind(this));

  this.onSelectionChange();
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
    this.connection_.connectToClient(this.selectedNode_);
  }
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

    // Trigger a node table read, which should refresh the lobby contents.
    if (this.shard_) {
      this.shard_.nodeTable.readAll(function (err, rows) {
        this.onNodeTableChange_(rows);
      }.bind(this));
    }
  }
};

/**
 * Called whenever a change is detected in the nodes table - which should
 * trigger a refresh of the lobby listing
 * @param {!Array} rows
 * @private
 */
NetSimLobby.prototype.onNodeTableChange_ = function (rows) {
  this.nodesOnShard_ = netsimNodeFactory.nodesFromRows(this.shard_, rows);
  this.render();
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimLobby.prototype.onRowClick_ = function (jQueryEvent) {
  var target = $(jQueryEvent.target);
  var nodeID = target.data('nodeId');
  var clickedNode = _.find(this.nodesOnShard_, function (node) {
    return node.entityID === nodeID;
  });

  // Don't even allow selection of nodes we can't connect to.
  if (!clickedNode || !this.canConnectToNode_(clickedNode)) {
    return;
  }

  // Deselect old row
  var oldSelectedNode = this.selectedNode_;
  this.selectedNode_ = null;
  this.getBody().find('.selected-row').removeClass('selected-row');

  // If we clicked on a different row, select the new row
  if (!oldSelectedNode || clickedNode.entityID !== oldSelectedNode.entityID) {
    this.selectedNode_ = clickedNode;
    target.addClass('selected-row');
  }

  this.onSelectionChange();
};

/**
 * @param {NetSimNode} node
 * @returns {boolean}
 * @private
 */
NetSimLobby.prototype.isMyNode_ = function (node) {
  return node && this.connection_.myNode &&
      this.connection_.myNode.entityID === node.entityID;
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

/**
 * @param {NetSimNode} node
 * @returns {boolean}
 * @private
 */
NetSimLobby.prototype.isSelectedNode_ = function (node) {
  return node && this.selectedNode_ &&
      node.entityID === this.selectedNode_.entityID;
};

/** Handler for selecting/deselcting a row in the lobby listing. */
NetSimLobby.prototype.onSelectionChange = function () {
  this.connectButton_.attr('disabled', (this.selectedNode_ === null));
};
