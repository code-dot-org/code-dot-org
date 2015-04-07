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
var NetSimPanel = require('./NetSimPanel');
var markup = require('./NetSimRemoteNodeSelectionPanel.html');
var NodeType = require('./netsimConstants').NodeType;

/**
 * Generator and controller for lobby/connection controls.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimShard} shard
 * @param {number} myNodeID
 * @param {function} addRouterCallback
 * @param {function} connectToRouterCallback
 * @param {function} connectToClientCallback
 * @constructor
 * @augments NetSimPanel
 */
var NetSimRemoteNodeSelectionPanel = module.exports = function (rootDiv,
    levelConfig, shard, myNodeID, addRouterCallback,
    connectToRouterCallback, connectToClientCallback) {
  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * A reference to the currently connected shard.
   * @type {?NetSimShard}
   * @private
   */
  this.shard_ = shard;

  this.myNodeID_ = myNodeID;

  this.addRouterCallback_ = addRouterCallback;

  this.connectToRouterCallback_ = connectToRouterCallback;

  this.connectToClientCallback_ = connectToClientCallback;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = [];

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesRequestingConnection_ = [];

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

  // Hook up listeners
  this.nodeTableKey_ = this.shard_.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this));
  this.wireTableKey_ = this.shard_.wireTable.tableChange.register(
      this.onWireTableChange_.bind(this));

  // Trigger a node table read, which should refresh the lobby contents.
  this.shard_.nodeTable.readAll(function (err, rows) {
    this.onNodeTableChange_(rows);
  }.bind(this));
};
NetSimRemoteNodeSelectionPanel.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimRemoteNodeSelectionPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimRemoteNodeSelectionPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    level: this.levelConfig_,
    nodesOnShard: this.nodesOnShard_,
    nodesRequestingConnection: this.nodesRequestingConnection_,
    canConnectToNode: this.canConnectToNode_.bind(this),
    isMyNode: this.isMyNode_.bind(this),
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
NetSimRemoteNodeSelectionPanel.prototype.addRouterButtonClick_ = function () {
  this.addRouterCallback_();
};

/** Handler for clicking the "Connect" button. */
NetSimRemoteNodeSelectionPanel.prototype.connectButtonClick_ = function () {
  if (!this.selectedNode_) {
    return;
  }

  if (this.selectedNode_ instanceof NetSimRouterNode) {
    this.connectToRouterCallback_(this.selectedNode_);
  } else if (this.selectedNode_ instanceof NetSimClientNode) {
    this.connectToClientCallback_(this.selectedNode);
  }
};

/**
 * Called whenever a change is detected in the nodes table - which should
 * trigger a refresh of the lobby listing
 * @param {!Array} rows
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onNodeTableChange_ = function (rows) {
  this.nodesOnShard_ = netsimNodeFactory.nodesFromRows(this.shard_, rows);
  this.render();
};

/**
 * Called whenever a change is detected in the wires table.
 * @param {!Array} rows
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onWireTableChange_ = function (rows) {
  this.nodesRequestingConnection_ = rows.filter(function (wireRow) {
    return wireRow.remoteNodeID === this.myNodeID_;
  }).map(function (wireRow) {
    return _.find(this.nodesOnShard_, function (node) {
      return node.entityID === wireRow.localNodeID;
    });
  }.bind(this)).filter(function (node) {
    // In case the wire table change comes in before the node table change.
    return node !== undefined;
  });
  this.render();
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onRowClick_ = function (jQueryEvent) {
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
NetSimRemoteNodeSelectionPanel.prototype.isMyNode_ = function (node) {
  return this.myNodeID_ === node.entityID;
};

/**
 * Check whether the level configuration allows connections to the specified
 * node.
 * @param {NetSimNode} connectionTarget
 * @returns {boolean} whether connection to the target is allowed
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.canConnectToNode_ = function (connectionTarget) {
  // Can't connect to own node
  if (this.isMyNode_(connectionTarget)) {
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
NetSimRemoteNodeSelectionPanel.prototype.isSelectedNode_ = function (node) {
  return node && this.selectedNode_ &&
      node.entityID === this.selectedNode_.entityID;
};

/** Handler for selecting/deselecting a row in the lobby listing. */
NetSimRemoteNodeSelectionPanel.prototype.onSelectionChange = function () {
  this.connectButton_.attr('disabled', (this.selectedNode_ === null));
};

