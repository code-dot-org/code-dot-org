/**
 * @overview Simulated client node.
 */
'use strict';

var _ = require('../lodash');
var i18n = require('./locale');
var NodeType = require('./NetSimConstants').NodeType;
var NetSimEntity = require('./NetSimEntity');
var NetSimNode = require('./NetSimNode');
var NetSimWire = require('./NetSimWire');
require('../utils'); // Provides Function.prototype.inherits

/**
 * Client model of simulated node
 *
 * Represents the client's view of a node that is controlled by a user client,
 * either by our own client or somebody else's.  Is a NetSimEntity, meaning
 * it wraps a row in the node table and provides functionality around it.
 *
 * You may be looking for NetSimLocalClientNode if you're trying to manipulate
 * your local client node.
 *
 * @param {!NetSimShard} shard
 * @param {Object} [clientRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimClientNode = module.exports = function (shard, clientRow) {
  NetSimNode.call(this, shard, clientRow);
};
NetSimClientNode.inherits(NetSimNode);

/** @inheritdoc */
NetSimClientNode.prototype.getNodeType = function () {
  return NodeType.CLIENT;
};

/** @inheritdoc */
NetSimClientNode.prototype.getStatus = function () {
  var outgoingWire = this.getOutgoingWire();
  if (!outgoingWire) {
    return i18n.notConnected();
  }

  // Get remote node for display name / hostname
  var cachedNodeRows = this.shard_.nodeTable.readAll();
  var remoteNodeRow = _.find(cachedNodeRows, function (nodeRow) {
    return nodeRow.id === outgoingWire.remoteNodeID;
  });

  var remoteNodeName = i18n.unknownNode();
  if (remoteNodeRow) {
    remoteNodeName = remoteNodeRow.name;
  }

  // Check for connection state
  var mutualConnection;
  if (remoteNodeRow && remoteNodeRow.type === NodeType.ROUTER) {
    mutualConnection = true;
  } else {
    var cachedWireRows = this.shard_.wireTable.readAll();
    mutualConnection = cachedWireRows.some(function (wireRow) {
      return wireRow.localNodeID === outgoingWire.remoteNodeID &&
          wireRow.remoteNodeID === outgoingWire.localNodeID;
    });
  }

  if (mutualConnection) {
    return i18n.connectedToNodeName({nodeName:remoteNodeName});
  }
  return i18n.connectingToNodeName({nodeName:remoteNodeName});
};

/** @inheritdoc */
NetSimClientNode.prototype.isFull = function () {
  var outgoingWire = this.getOutgoingWire();
  if (!outgoingWire) {
    return false;
  }
  var cachedWireRows = this.shard_.wireTable.readAll();
  return cachedWireRows.some(function (wireRow) {
    return wireRow.localNodeID === outgoingWire.remoteNodeID &&
        wireRow.remoteNodeID === outgoingWire.localNodeID;
  });
};

/**
 * Determine what address has been assigned to this client on its outgoing
 * wire.
 * @returns {string|undefined}
 */
NetSimClientNode.prototype.getAddress = function () {
  var wire = this.getOutgoingWire();
  if (!wire) {
    return undefined;
  }
  return wire.localAddress;
};

/**
 * Based on cached wire data, retrieve this node's outgoing wire.
 * @returns {NetSimWire|null} null if wire does not exist.
 */
NetSimClientNode.prototype.getOutgoingWire = function () {
  var cachedWireRows = this.shard_.wireTable.readAll();
  var outgoingWireRow = _.find(cachedWireRows, function (wireRow) {
    return wireRow.localNodeID === this.entityID;
  }, this);
  if (outgoingWireRow) {
    return new NetSimWire(this.shard_, outgoingWireRow);
  }
  return null;
};

/**
 * Static async retrieval method.  See NetSimEntity.get().
 * @param {!number} nodeID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimClientNode.get = function (nodeID, shard, onComplete) {
  NetSimEntity.get(NetSimClientNode, nodeID, shard, onComplete);
};
