/**
 * @overview Simulation Entity: A connection between two nodes and related
 *           metadata.
 */
'use strict';

require('../utils');
var NetSimEntity = require('./NetSimEntity');
var ArgumentUtils = require('./ArgumentUtils');

/**
 * @typedef {Object} WireRow
 * @property {!number} localNodeID
 * @property {!number} remoteNodeID
 * @property {string} localAddress
 * @property {string} remoteAddress
 * @property {string} localHostname
 * @property {string} remoteHostname
 */

/**
 * Local controller for a simulated connection between nodes,
 * which is stored in the wire table on the shard.  The controller can
 * be initialized with the JSON row from the table, effectively wrapping that
 * data in helpful methods.
 *
 * @param {!NetSimShard} shard - The shard where this wire lives.
 * @param {WireRow} [wireRow] - A row out of the _wire table on the shard.
 *        If provided, will initialize this wire with the given data.  If not,
 *        this wire will initialize to default values.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimWire = module.exports = function (shard, wireRow) {
  wireRow = wireRow !== undefined ? wireRow : {};
  NetSimEntity.call(this, shard, wireRow);

  /**
   * Connected node row IDs within the _lobby table
   * @type {number}
   */
  this.localNodeID = wireRow.localNodeID;
  /** @type {number} */
  this.remoteNodeID = wireRow.remoteNodeID;

  /**
   * Assigned local addresses for the ends of this wire.
   * @type {string}
   */
  this.localAddress = wireRow.localAddress;
  /** @type {string} */
  this.remoteAddress = wireRow.remoteAddress;

  /**
   * Display hostnames for the ends of this wire.
   * Generally, each endpoint should set its own hostname.
   * @type {string}
   */
  this.localHostname = wireRow.localHostname;
  /** @type {string} */
  this.remoteHostname = wireRow.remoteHostname;
};
NetSimWire.inherits(NetSimEntity);

/**
 * Static async creation method.  See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!WireRow} initialRow
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimWire.create = function (shard, initialRow, onComplete) {
  ArgumentUtils.validateRequired(initialRow, "initialRow");
  ArgumentUtils.validateRequired(initialRow.localNodeID, "localNodeID",
      ArgumentUtils.isPositiveNoninfiniteNumber);
  ArgumentUtils.validateRequired(initialRow.remoteNodeID, "remoteNodeID",
      ArgumentUtils.isPositiveNoninfiniteNumber);
  var entity = new NetSimWire(shard, initialRow);
  entity.getTable().create(entity.buildRow(), function (err, row) {
    if (err) {
      onComplete(err, null);
      return;
    }
    onComplete(null, new NetSimWire(shard, row));
  });
};

/**
 * Helper that gets the wires table for the configured shard.
 * @returns {NetSimTable}
 */
NetSimWire.prototype.getTable = function () {
  return this.shard_.wireTable;
};

/**
 * Build own row for the wire table
 * @returns {WireRow}
 */
NetSimWire.prototype.buildRow = function () {
  return {
    localNodeID: this.localNodeID,
    remoteNodeID: this.remoteNodeID,
    localAddress: this.localAddress,
    remoteAddress: this.remoteAddress,
    localHostname: this.localHostname,
    remoteHostname: this.remoteHostname
  };
};

/**
 * @param {MessageRow} messageRow
 * @returns {boolean} TRUE if the given message is travelling between the nodes
 *          that this wire connects, in the wire's direction.
 */
NetSimWire.prototype.isMessageRowOnDuplexWire = function (messageRow) {
  return this.localNodeID === messageRow.fromNodeID &&
      this.remoteNodeID === messageRow.toNodeID;
};

/**
 * @param {MessageRow} messageRow
 * @returns {boolean} TRUE if the given message is travelling between the nodes
 *          that this wire connects, in either direction.
 */
NetSimWire.prototype.isMessageRowOnSimplexWire = function (messageRow) {
  var onWire = this.isMessageRowOnDuplexWire(messageRow);
  var onReverseWire = this.localNodeID === messageRow.toNodeID &&
      this.remoteNodeID === messageRow.fromNodeID;
  return onWire || onReverseWire;
};
