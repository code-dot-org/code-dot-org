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
var NetSimPanel = require('./NetSimPanel');
var markup = require('./NetSimRemoteNodeSelectionPanel.html');
var NodeType = require('./netsimConstants').NodeType;

/**
 * Generator and controller for lobby/connection controls.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimNode[]} nodesOnShard
 * @param {NetSimNode[]} nodesRequestingConnection
 * @param {NetSimNode} selectedNode
 * @param {number} myNodeID
 * @param {function} addRouterCallback
 * @param {function} selectNodeCallback
 * @param {function} connectButtonCallback
 * @constructor
 * @augments NetSimPanel
 */
var NetSimRemoteNodeSelectionPanel = module.exports = function (rootDiv,
    levelConfig, nodesOnShard, nodesRequestingConnection, selectedNode,
    myNodeID, addRouterCallback, selectNodeCallback, connectButtonCallback) {
  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = nodesOnShard;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesRequestingConnection_ = nodesRequestingConnection;

  /**
   * Which node in the lobby is currently selected
   * @type {NetSimNode}
   * @private
   */
  this.selectedNode_ = selectedNode;

  this.myNodeID_ = myNodeID;

  this.addRouterCallback_ = addRouterCallback;

  this.selectNodeCallback_ = selectNodeCallback;

  this.connectButtonCallback_ = connectButtonCallback;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-lobby-panel',
    panelTitle: i18n.lobby(),
    canMinimize: false
  });
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
    selectedNode: this.selectedNode_,
    canConnectToNode: this.canConnectToNode_.bind(this),
    isMyNode: this.isMyNode_.bind(this)
  }));
  this.getBody().html(newMarkup);

  this.addRouterButton_ = this.getBody().find('#netsim_lobby_add_router');
  this.addRouterButton_.click(this.addRouterButtonClick_.bind(this));

  this.connectButton_ = this.getBody().find('#netsim_lobby_connect');
  this.connectButton_.click(this.connectButtonClick_.bind(this));

  this.getBody().find('.selectable-row').click(this.onRowClick_.bind(this));
};

/** Handler for clicking the "Add Router" button. */
NetSimRemoteNodeSelectionPanel.prototype.addRouterButtonClick_ = function () {
  this.addRouterCallback_();
};

/** Handler for clicking the "Connect" button. */
NetSimRemoteNodeSelectionPanel.prototype.connectButtonClick_ = function () {
  this.connectButtonCallback_();
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

  // Don't even allow clicking on nodes we can't connect to.
  if (!clickedNode || !this.canConnectToNode_(clickedNode)) {
    return;
  }

  // If the selected node was clicked, we want to deselect.
  if (this.selectedNode_ && this.selectedNode_.entityID === clickedNode.entityID) {
    this.selectNodeCallback_(null);
  } else {
    this.selectNodeCallback_(clickedNode);
  }
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
