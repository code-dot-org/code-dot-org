/**
 * @overview Utility methods for generating the right kinds of node controllers
 *           from raw node table rows.
 */
'use strict';

var NetSimConstants = require('./NetSimConstants');

var NodeType = NetSimConstants.NodeType;

var NetSimNodeFactory = module.exports;

/**
 * Given a set of rows from the node table on a shard, gives back a set of node
 * controllers (of appropriate types).
 * @param {!NetSimShard} shard
 * @param {!Array.<Object>} nodeRows
 * @throws when a row doesn't have a mappable node type.
 * @return {Array.<NetSimNode>} nodes for the rows
 */
NetSimNodeFactory.nodesFromRows = function (shard, nodeRows) {
  return nodeRows.map(NetSimNodeFactory.nodeFromRow.bind(this, shard));
};

/**
 * Given a row from the node table on a shard, gives back a node controllers
 * (of appropriate types).
 * @param {!NetSimShard} shard
 * @param {!Object} nodeRow
 * @throws when the row doesn't have a mappable node type.
 * @return {NetSimNode} node for the rows
 */
NetSimNodeFactory.nodeFromRow = function (shard, nodeRow) {
  if (nodeRow.type === NodeType.CLIENT) {
    var NetSimClientNode = require('./NetSimClientNode');
    return new NetSimClientNode(shard, nodeRow);
  } else if (nodeRow.type === NodeType.ROUTER) {
    var NetSimRouterNode = require('./NetSimRouterNode');
    return new NetSimRouterNode(shard, nodeRow);
  }

  // Oops!  We probably shouldn't ever get here.
  throw new Error("Unable to map row to node.");
};
