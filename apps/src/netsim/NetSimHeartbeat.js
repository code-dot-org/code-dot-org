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
var NetSimEntity = require('./NetSimEntity');

/**
 * How often a heartbeat is sent, in milliseconds
 * @type {number}
 * @const
 */
var HEARTBEAT_INTERVAL_MS = 5000;

/**
 * Sends regular heartbeat messages to the heartbeat table on the given
 * shard, for the given node.
 * @param {!NetSimShard} shard
 * @param {*} row
 * @constructor
 * @augments NetSimEntity
 */
var NetSimHeartbeat = module.exports = function (shard, row) {
  // TODO (bbuchanan): Consider:
  //      Will this scale?  Can we move the heartbeat system to an in-memory
  //      store on the server - or even better, hook into whatever our
  //      notification service uses to read presence on a channel?
  
  row = row !== undefined ? row : {};
  NetSimEntity.call(this, shard, row);

  /** @type {number} Row ID in node table */
  this.nodeID = row.nodeID;

  /** @type {number} unix timestamp (ms) */
  this.time_ = row.time !== undefined ? row.time : 0;
};
NetSimHeartbeat.inherits(NetSimEntity);

/**
 * Static async creation method.  See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!function} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimHeartbeat.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimHeartbeat, shard, onComplete);
};

// TODO (bbuchanan): Extend storage API to support an upsert operation, and
//      use that here.  Would be even better if our backend storage supported
//      it (like mongodb).
NetSimHeartbeat.getOrCreate = function (shard, nodeID, onComplete) {
  shard.heartbeatTable.readAll(function (rows) {
    var nodeRows = rows
        .filter(function (row) {
          return row.nodeID == nodeID;
        })
        .sort(function (a, b) {
          return a.time < b.time ? 1 : -1;
        });

    if (nodeRows.length > 0) {
      onComplete(new NetSimHeartbeat(shard, nodeRows[0]));
    } else {
      NetSimHeartbeat.create(shard, function (newHeartbeat) {
        if (newHeartbeat) {
          newHeartbeat.nodeID = nodeID;
        }
        newHeartbeat.update(function (success) {
          if (!success) {
            // Failed to fully create heartbeat
            newHeartbeat.destroy();
            onComplete(null);
            return;
          }
          onComplete(newHeartbeat);
        });
      });
    }
  });
};

/**
 * Helper that gets the wires table for the configured shard.
 * @returns {NetSimTable}
 * @override
 */
NetSimHeartbeat.prototype.getTable_ = function () {
  return this.shard_.heartbeatTable;
};

/**
 * Build own row for the wire table
 * @override
 */
NetSimHeartbeat.prototype.buildRow_ = function () {
  return {
    nodeID: this.nodeID,
    time: this.time_
  };
};

/**
 * Updates own row on regular interval, as long as something's making
 * it tick.
 */
NetSimHeartbeat.prototype.tick = function () {
  if (Date.now() - this.time_ > HEARTBEAT_INTERVAL_MS) {
    this.time_ = Date.now();
    this.update();
  }
};
