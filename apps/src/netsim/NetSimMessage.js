/**
 * @overview Simulation entity for a message between two nodes.
 */
'use strict';

var utils = require('../utils'); // Provides Function.prototype.inherits
var NetSimEntity = require('./NetSimEntity');
var DataConverters = require('./DataConverters');
var base64ToBinary = DataConverters.base64ToBinary;
var binaryToBase64 = DataConverters.binaryToBase64;
var NetSimLogger = require('./NetSimLogger');

var logger = NetSimLogger.getSingleton();

/**
 * @typedef {Object} MessageData
 * @property {!number} fromNodeID - sender node ID
 * @property {!number} toNodeID - destination node ID
 * @property {!number} simulatedBy - node ID of client simulating message
 * @property {!string} payload - message content in a binary string
 * @property {number} extraHopsRemaining
 * @property {number[]} visitedNodeIDs
 */

/**
 * @typedef {Object} MessageRow
 * @property {!number} fromNodeID - this message in-flight-from node
 * @property {!number} toNodeID - this message in-flight-to node
 * @property {!number} simulatedBy - Node ID of the client responsible for
 *           all operations involving this message.
 * @property {!Base64Payload} base64Payload - base64-encoded binary
 *           message content, all of which can be exposed to the
 *           student.  May contain headers of its own.
 * @property {!number} extraHopsRemaining
 * @property {!number[]} visitedNodeIDs
 */

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
 * @param {MessageRow} [messageRow] - A row out of the _message table on the
 *        shard.  If provided, will initialize this message with the given
 *        data.  If not, this message will initialize to default values.
 * @constructor
 * @augments NetSimEntity
 * @implements MessageData
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
  this.payload = '';
  if (messageRow.base64Payload) {
    try {
      this.payload = base64ToBinary(messageRow.base64Payload.string,
          messageRow.base64Payload.len);
    } catch (e) {
      logger.error(e.message);
    }
  }

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
 * Static row construction method. Used by dynamic buildRow method and
 * by static async API creation methods to create a properly-formatted
 * row for database insertion
 * @param {MessageData} messageData
 * @returns {MessageRow}
 * @throws {TypeError} if payload is invalid
 */
NetSimMessage.buildRowFromData = function (messageData) {
  return {
    fromNodeID: messageData.fromNodeID,
    toNodeID: messageData.toNodeID,
    simulatedBy: messageData.simulatedBy,
    base64Payload: binaryToBase64(messageData.payload),
    extraHopsRemaining: utils.valueOr(messageData.extraHopsRemaining, 0),
    visitedNodeIDs: utils.valueOr(messageData.visitedNodeIDs, [])
  };
};

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {!MessageData} messageData
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimMessage.send = function (shard, messageData, onComplete) {
  try {
    var row = NetSimMessage.buildRowFromData(messageData);
    shard.messageTable.create(row, onComplete);
  } catch (err) {
    onComplete(err, null);
  }
};

/**
 * Static async multi-create method. Creates new messages on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {MessageData[]} messageDatas
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimMessage.sendMany = function (shard, messageDatas, onComplete) {
  try {
    var rows = messageDatas.map(NetSimMessage.buildRowFromData);
    shard.messageTable.multiCreate(rows, onComplete);
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
 * Build own row for the message table
 * @returns {MessageRow}
 * @throws {TypeError} if payload is invalid
 */
NetSimMessage.prototype.buildRow = function () {
  return NetSimMessage.buildRowFromData(this);
};
