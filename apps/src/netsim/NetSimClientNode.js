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

require('../utils');
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
  return this.status_ ? this.status_ : 'Online';
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
