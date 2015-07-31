/**
 * @overview Simulation entity for a message between two nodes.
 */
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

var utils = require('../utils');
var NetSimEntity = require('./NetSimEntity');
var dataConverters = require('./dataConverters');
var base64ToBinary = dataConverters.base64ToBinary;
var binaryToBase64 = dataConverters.binaryToBase64;

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
  var base64Payload = messageRow.base64Payload;
  this.payload = (base64Payload) ?
    base64ToBinary(base64Payload.string, base64Payload.len) :
    '';

  /**
   * If this is an inter-router message, the number of routers this
   * message should try to visit before going to the router that
   * will actually lead to its destination.
   * @type {number}
   */
  this.extraHopsRemaining = utils.valueOr(messageRow.extraHopsRemaining, 0);

  /**
   * A history of router node IDs this message has visited.
   * @type {number[]}
   */
  this.visitedNodeIDs = utils.valueOr(messageRow.visitedNodeIDs, []);
};
NetSimMessage.inherits(NetSimEntity);

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {Object} messageData
 * @param {!number} messageData.fromNodeID - sender node ID
 * @param {!number} messageData.toNodeID - destination node ID
 * @param {!number} messageData.simulatedBy - node ID of client simulating message
 * @param {*} messageData.payload - message content
 * @param {number} messageData.extraHopsRemaining
 * @param {number[]} messageData.visitedNodeIDs
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimMessage.send = function (shard, messageData, onComplete) {
  var entity = new NetSimMessage(shard);
  entity.fromNodeID = messageData.fromNodeID;
  entity.toNodeID = messageData.toNodeID;
  entity.simulatedBy = messageData.simulatedBy;
  entity.payload = messageData.payload;
  entity.extraHopsRemaining = utils.valueOr(messageData.extraHopsRemaining, 0);
  entity.visitedNodeIDs = utils.valueOr(messageData.visitedNodeIDs, []);
  try {
    entity.getTable().create(entity.buildRow(), onComplete);
  } catch (err) {
    onComplete(err, null);
  }
};

/**
 * Static helper.
 * @param {NetSimMessage} message
 * @returns {boolean} TRUE iff the given message is well-formed.
 */
NetSimMessage.isValid = function (message) {
  return /^[01]*$/.test(message.payload);
};

/**
 * Helper that gets the wires table for the configured instance.
 * @returns {NetSimTable}
 */
NetSimMessage.prototype.getTable = function () {
  return this.shard_.messageTable;
};

/**
 * @typedef {Object} messageRow
 * @property {number} fromNodeID - this message in-flight-from node
 * @property {number} toNodeID - this message in-flight-to node
 * @property {number} simulatedBy - Node ID of the client responsible for
 *           all operations involving this message.
 * @property {base64Payload} base64Payload - base64-encoded binary
 *           message content, all of which can be exposed to the
 *           student.  May contain headers of its own.
 */

/**
 * Build own row for the message table
 * @returns {messageRow}
 * @throws {TypeError} if payload is invalid
 */
NetSimMessage.prototype.buildRow = function () {
  return {
    fromNodeID: this.fromNodeID,
    toNodeID: this.toNodeID,
    simulatedBy: this.simulatedBy,
    base64Payload: binaryToBase64(this.payload),
    extraHopsRemaining: this.extraHopsRemaining,
    visitedNodeIDs: this.visitedNodeIDs
  };
};
