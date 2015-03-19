/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 5,
 maxstatements: 200
 */
'use strict';

require('../utils');
var NetSimEntity = require('./NetSimEntity');
var PacketEncoder = require('./PacketEncoder');
var dataConverters = require('./dataConverters');
var formatBinary = dataConverters.formatBinary;

/**
 * @type {number}
 * @const
 */
var BITS_PER_BYTE = 8;

/**
 * Entry in shared log for a node on the network.
 *
 * Once created, should not be modified until/unless a cleanup process
 * removes it.
 *
 * @param {!NetSimShard} shard - The shard where this log entry lives.
 * @param {Object} [row] - A row out of the log table on the
 *        shard.  If provided, will initialize this log with the given
 *        data.  If not, this log will initialize to default values.
 * @param {packetHeaderSpec} [packetSpec] - Packet layout spec used to
 *        interpret the contents of the logged packet
 * @constructor
 * @augments NetSimEntity
 */
var NetSimLogEntry = module.exports = function (shard, row, packetSpec) {
  row = row !== undefined ? row : {};
  NetSimEntity.call(this, shard, row);

  /**
   * Node ID of the node that owns this log entry (e.g. a router node)
   * @type {number}
   */
  this.nodeID = row.nodeID;

  /**
   * Text of the log entry.  Defaults to empty string.
   * @type {string}
   */
  this.packet = (row.packet !== undefined) ? row.packet : '';

  /**
   * @type {PacketEncoder}
   * @private
   */
  this.encoder_ = new PacketEncoder(packetSpec ? packetSpec : []);

  /**
   * Unix timestamp (local) of log creation time.
   * @type {number}
   */
  this.timestamp = (row.timestamp !== undefined) ? row.timestamp : Date.now();
};
NetSimLogEntry.inherits(NetSimEntity);

/**
 * Helper that gets the log table for the configured instance.
 * @returns {NetSimTable}
 */
NetSimLogEntry.prototype.getTable_ = function () {
  return this.shard_.logTable;
};

/** Build own row for the log table  */
NetSimLogEntry.prototype.buildRow_ = function () {
  return {
    nodeID: this.nodeID,
    packet: this.packet,
    timestamp: this.timestamp
  };
};

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {!number} nodeID - associated node's row ID
 * @param {!string} packet - log contents
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimLogEntry.create = function (shard, nodeID, packet, onComplete) {
  var entity = new NetSimLogEntry(shard);
  entity.nodeID = nodeID;
  entity.packet = packet;
  entity.timestamp = Date.now();
  entity.getTable_().create(entity.buildRow_(), function (err, result) {
    if (err !== null) {
      onComplete(err, null);
      return;
    }
    onComplete(err, new NetSimLogEntry(shard, result));
  });
};

/**
 * Get requested packet header field as a number.  Returns empty string
 * if the requested field is not in the current packet format.
 * @param {PacketHeaderType} field
 * @returns {number|string}
 */
NetSimLogEntry.prototype.getHeaderField = function (field) {
  try {
    return this.encoder_.getHeaderFieldAsInt(field, this.packet);
  } catch (e) {
    return '';
  }
};

/** Get packet message as binary. */
NetSimLogEntry.prototype.getMessageBinary = function () {
  return formatBinary(this.encoder_.getBody(this.packet), BITS_PER_BYTE);
};

/** Get packet message as ASCII */
NetSimLogEntry.prototype.getMessageAscii = function () {
  return this.encoder_.getBodyAsAscii(this.packet, BITS_PER_BYTE);
};