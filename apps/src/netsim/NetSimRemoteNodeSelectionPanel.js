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
 * Generator and controller for lobby node listing, selection, and connection
 * controls.
 *
 * @param {jQuery} rootDiv
 *
 * @param {Object} options
 * @param {netsimLevelConfiguration} options.levelConfig
 * @param {NetSimNode[]} options.nodesOnShard
 * @param {NetSimNode[]} options.incomingConnectionNodes
 * @param {NetSimNode} options.remoteNode - null if not attempting to connect
 * @param {number} options.myNodeID
 *
 * @param {Object} callbacks
 * @param {function} callbacks.addRouterCallback
 * @param {function} callbacks.cancelButtonCallback
 * @param {function} callbacks.joinButtonCallback
 *
 * @constructor
 * @augments NetSimPanel
 */
var NetSimRemoteNodeSelectionPanel = module.exports = function (rootDiv,
    options, callbacks) {
  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = options.levelConfig;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = options.nodesOnShard;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.incomingConnectionNodes_ = options.incomingConnectionNodes;

  /**
   * @type {NetSimNode}
   * @private
   */
  this.remoteNode_ = options.remoteNode;

  /**
   * @type {number}
   * @private
   */
  this.myNodeID_ = options.myNodeID;

  /**
   * Handler for "Add Router" button
   * @type {function}
   * @private
   */
  this.addRouterCallback_ = callbacks.addRouterCallback;

  /**
   * Handler for cancel button (backs out of non-mutual connection)
   * @type {function}
   * @private
   */
  this.cancelButtonCallback_ = callbacks.cancelButtonCallback;

  /**
   * Handler for "join" button next to each connectable node.
   * @type {function}
   * @private
   */
  this.joinButtonCallback_ = callbacks.joinButtonCallback;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-lobby-panel',
    panelTitle: i18n.connectToANode(),
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
    controller: this,
    showAddRouterButton: this.levelConfig_.showAddRouterButton,
    nodesOnShard: this.nodesOnShard_,
    incomingConnectionNodes: this.incomingConnectionNodes_,
    remoteNode: this.remoteNode_
  }));
  this.getBody().html(newMarkup);

  this.addRouterButton_ = this.getBody().find('#netsim-lobby-add-router');
  this.addRouterButton_.click(this.addRouterCallback_);

  this.getBody().find('.join-button').click(this.onJoinClick_.bind(this));
  this.getBody().find('.accept-button').click(this.onJoinClick_.bind(this));
  this.getBody().find('.cancel-button').click(this.cancelButtonCallback_);
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onJoinClick_ = function (jQueryEvent) {
  var target = $(jQueryEvent.target);
  if (target.is('[disabled]')) {
    return;
  }

  var nodeID = target.data('nodeId');
  var clickedNode = _.find(this.nodesOnShard_, function (node) {
    return node.entityID === nodeID;
  });

  this.joinButtonCallback_(clickedNode);
};

/**
 * @param {NetSimNode} node
 * @returns {boolean}
 */
NetSimRemoteNodeSelectionPanel.prototype.isMyNode = function (node) {
  return this.myNodeID_ === node.entityID;
};

/**
 * Check whether the level configuration allows connections to the specified
 * node.
 * @param {NetSimNode} connectionTarget
 * @returns {boolean} whether connection to the target is allowed
 */
NetSimRemoteNodeSelectionPanel.prototype.canConnectToNode = function (connectionTarget) {
  // Can't connect to own node
  if (this.isMyNode(connectionTarget)) {
    return false;
  }

  // Permissible connection limited by level configuration
  var isClient = (connectionTarget.getNodeType() === NodeType.CLIENT);
  var isRouter = (connectionTarget.getNodeType() === NodeType.ROUTER);
  var allowClients = this.levelConfig_.canConnectToClients;
  var allowRouters = this.levelConfig_.canConnectToRouters;
  return (isClient && allowClients) || (isRouter && allowRouters);
};

/**
 * @returns {boolean} TRUE if we have an open outgoing connection request.
 */
NetSimRemoteNodeSelectionPanel.prototype.hasOutgoingRequest = function () {
  return !!(this.remoteNode_);
};

/**
 * For use with Array.prototype.filter()
 * @param {NetSimNode} node
 * @returns {boolean} TRUE if the given node should show up in the lobby
 */
NetSimRemoteNodeSelectionPanel.prototype.shouldShowNode = function (node) {
  var isClient = (node.getNodeType() === NodeType.CLIENT);
  var isRouter = (node.getNodeType() === NodeType.ROUTER);
  var showClients = this.levelConfig_.showClientsInLobby;
  var showRouters = this.levelConfig_.showRoutersInLobby;
  return (isClient && showClients) || (isRouter && showRouters);
};

