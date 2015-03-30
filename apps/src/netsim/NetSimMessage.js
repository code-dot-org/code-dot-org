/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var NetSimEntity = require('./NetSimEntity');

/**
 * Local controller for a message that is 'on the wire'
 *
 * Doesn't actually have any association with the wire - one could,
 * theoretically, send a message from any node in the simulation to any other
 * node in the simulation.
 *
 * Any message that exists in the table is 'in transit' to a node.  Nodes
 * should remove messages as soon as they receive them.
 *
 * @param {!NetSimShard} shard - The shard where this wire lives.
 * @param {Object} [messageRow] - A row out of the _message table on the
 *        shard.  If provided, will initialize this message with the given
 *        data.  If not, this message will initialize to default values.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimMessage = module.exports = function (shard, messageRow) {
  messageRow = messageRow !== undefined ? messageRow : {};
  NetSimEntity.call(this, shard, messageRow);

  /**
   * Node ID that this message is 'in transit' from.
   * @type {number}
   */
  this.fromNodeID = messageRow.fromNodeID;

  /**
   * Node ID that this message is 'in transit' to.
   * @type {number}
   */
  this.toNodeID = messageRow.toNodeID;

  /**
   * ID of the node responsible for operations on this message.
   * @type {number}
   */
  this.simulatedBy = messageRow.simulatedBy;

  /**
   * All other message content, including the 'packets' students will send.
   * @type {*}
   */
  this.payload = messageRow.payload;
};
NetSimMessage.inherits(NetSimEntity);

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {!number} fromNodeID - sender node ID
 * @param {!number} toNodeID - destination node ID
 * @param {!number} simulatedBy - node ID of client simulating message
 * @param {*} payload - message content
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimMessage.send = function (shard, fromNodeID, toNodeID, simulatedBy,
    payload, onComplete) {
  var entity = new NetSimMessage(shard);
  entity.fromNodeID = fromNodeID;
  entity.toNodeID = toNodeID;
  entity.simulatedBy = simulatedBy;
  entity.payload = payload;
  entity.getTable_().create(entity.buildRow_(), onComplete);
};

/**
 * Helper that gets the wires table for the configured instance.
 * @returns {NetSimTable}
 */
NetSimMessage.prototype.getTable_ = function () {
  return this.shard_.messageTable;
};

/**
 * @typedef {Object} messageRow
 * @property {number} fromNodeID - this message in-flight-from node
 * @property {number} toNodeID - this message in-flight-to node
 * @property {number} simulatedBy - Node ID of the client responsible for
 *           all operations involving this message.
 * @property {string} payload - binary message content, all of which can be
 *           exposed to the student.  May contain headers of its own.
 */

/**
 * Build own row for the message table
 * @returns {messageRow}
 */
NetSimMessage.prototype.buildRow_ = function () {
  return {
    fromNodeID: this.fromNodeID,
    toNodeID: this.toNodeID,
    simulatedBy: this.simulatedBy,
    payload: this.payload
  };
};
