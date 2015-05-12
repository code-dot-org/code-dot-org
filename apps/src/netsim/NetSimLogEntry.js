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

var utils = require('../utils');
var i18n = require('../../locale/current/netsim');
var NetSimEntity = require('./NetSimEntity');
var Packet = require('./Packet');
var dataConverters = require('./dataConverters');
var formatBinary = dataConverters.formatBinary;
var BITS_PER_BYTE = require('./netsimConstants').BITS_PER_BYTE;

/**
 * @typedef {Object} logEntryRow
 * @property {number} nodeID
 * @property {string} binary
 * @property {NetSimLogEntry.LogStatus} status
 * @property {number} timestamp
 */

/**
 * Entry in shared log for a node on the network.
 *
 * Once created, should not be modified until/unless a cleanup process
 * removes it.
 *
 * @param {!NetSimShard} shard - The shard where this log entry lives.
 * @param {logEntryRow} [row] - A row out of the log table on the
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
   * Binary content of the log entry.  Defaults to empty string.
   * @type {string}
   */
  this.binary = utils.valueOr(row.binary, '');

  /**
   * Status value for log entry; for router log, usually SUCCESS for completion
   * of routing or DROPPED if routing failed.
   * @type {NetSimLogEntry.LogStatus}
   */
  this.status = utils.valueOr(row.status, NetSimLogEntry.LogStatus.SUCCESS);

  /**
   * @type {Packet}
   * @private
   */
  this.packet_ = new Packet(utils.valueOr(packetSpec, []), this.binary);

  /**
   * Unix timestamp (local) of log creation time.
   * @type {number}
   */
  this.timestamp = (row.timestamp !== undefined) ? row.timestamp : Date.now();
};
NetSimLogEntry.inherits(NetSimEntity);

/**
 * @enum {string}
 * @const
 */
NetSimLogEntry.LogStatus = {
  SUCCESS: 'success',
  DROPPED: 'dropped'
};

/**
 * Helper that gets the log table for the configured instance.
 * @returns {NetSimTable}
 */
NetSimLogEntry.prototype.getTable_ = function () {
  return this.shard_.logTable;
};

/**
 * Build own row for the log table
 * @returns {logEntryRow}
 */
NetSimLogEntry.prototype.buildRow_ = function () {
  return {
    nodeID: this.nodeID,
    binary: this.binary,
    status: this.status,
    timestamp: this.timestamp
  };
};

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {!number} nodeID - associated node's row ID
 * @param {!string} binary - log contents
 * @param {NetSimLogEntry.LogStatus} status
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimLogEntry.create = function (shard, nodeID, binary, status, onComplete) {
  var entity = new NetSimLogEntry(shard);
  entity.nodeID = nodeID;
  entity.binary = binary;
  entity.status = status;
  entity.timestamp = Date.now();
  entity.getTable_().create(entity.buildRow_(), function (err, result) {
    if (err) {
      onComplete(err, null);
      return;
    }
    onComplete(err, new NetSimLogEntry(shard, result));
  });
};

/**
 * Get requested packet header field as a number.  Returns empty string
 * if the requested field is not in the current packet format.
 * @param {Packet.HeaderType} field
 * @returns {number|string}
 */
NetSimLogEntry.prototype.getHeaderField = function (field) {
  try {
    return this.packet_.getHeaderAsInt(field);
  } catch (e) {
    return '';
  }
};

/** Get packet message as binary. */
NetSimLogEntry.prototype.getMessageBinary = function () {
  return formatBinary(this.packet_.getBodyAsBinary(), BITS_PER_BYTE);
};

/** Get packet message as ASCII */
NetSimLogEntry.prototype.getMessageAscii = function () {
  return this.packet_.getBodyAsAscii(BITS_PER_BYTE);
};

NetSimLogEntry.prototype.getLocalizedStatus = function () {
  if (this.status === NetSimLogEntry.LogStatus.SUCCESS) {
    return i18n.logStatus_success();
  } else if (this.status === NetSimLogEntry.LogStatus.DROPPED) {
    return i18n.logStatus_dropped();
  }
  return '';
};
