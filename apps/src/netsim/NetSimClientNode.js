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
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var i18n = require('../../locale/current/netsim');
var NodeType = require('./netsimConstants').NodeType;
var NetSimEntity = require('./NetSimEntity');
var NetSimNode = require('./NetSimNode');

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
  // Determine status based on cached outgoing wire
  var cachedWireRows = this.shard_.wireTable.readAllCached();
  var outgoingWireRow = _.find(cachedWireRows, function (wireRow) {
    return wireRow.localNodeID === this.entityID;
  }, this);

  if (outgoingWireRow) {
    // Get remote node for display name / hostname
    var cachedNodeRows = this.shard_.nodeTable.readAllCached();
    var remoteNodeRow = _.find(cachedNodeRows, function (nodeRow) {
      return nodeRow.id === outgoingWireRow.remoteNodeID;
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
      mutualConnection = _.find(cachedWireRows, function (wireRow) {
        return wireRow.localNodeID === outgoingWireRow.remoteNodeID &&
            wireRow.remoteNodeID === outgoingWireRow.localNodeID;
      });
    }

    if (mutualConnection) {
      return i18n.connectedToNodeName({nodeName:remoteNodeName});
    } else {
      return i18n.connectingToNodeName({nodeName:remoteNodeName});
    }
  }

  return i18n.notConnected();
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
