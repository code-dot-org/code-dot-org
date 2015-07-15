/**
 * @overview Simulation entity representing a client's presence in the simulation.
 */
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
var logger = require('./NetSimLogger').getSingleton();

/**
 * How often a heartbeat is sent, in milliseconds
 * Six seconds, against the one-minute timeout over in NetSimShardCleaner,
 * gives a heartbeat at least nine chances to update before it gets cleaned up.
 * @type {number}
 * @const
 */
var DEFAULT_HEARTBEAT_INTERVAL_MS = 6000;

/**
 * How many consecutive failed heartbeat updates must occur before we call it
 * and kick the client out of the simulator.
 * @type {number}
 */
var NUM_FAILED_UPDATES_TO_KICK = 3;

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

  /**
   * @type {number} unix timestamp (ms)
   * @private
   */
  this.time_ = row.time !== undefined ? row.time : Date.now();

  /**
   * @type {number} How often heartbeat is sent, in milliseconds
   * @private
   */
  this.intervalMs_ = DEFAULT_HEARTBEAT_INTERVAL_MS;

  /**
   * A heartbeat can be given a recovery action to take if it fails to
   * update its remote row.
   * @type {function}
   * @private
   */
  this.onFailedHeartbeat = undefined;

  /**
   * Fake age to apply to this heartbeat's remote row, allowing us to manually
   * expire it for debugging purposes.
   * @type {number}
   * @private
   */
  this.falseAgeMS_ = 0;

  /**
   * Count of consecutive failed heartbeat updates by this controller.
   * Used to implement three-strikes rule.
   * @type {number}
   * @private
   */
  this.consecutiveFailedUpdates_ = 0;
};
NetSimHeartbeat.inherits(NetSimEntity);

/**
 * Static async creation method.  See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimHeartbeat.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimHeartbeat, shard, onComplete);
};

/**
 * Static "upsert" of heartbeat
 * @param {!NetSimShard} shard
 * @param {!number} nodeID
 * @param {!NodeStyleCallback} onComplete
 */
NetSimHeartbeat.getOrCreate = function (shard, nodeID, onComplete) {
  // TODO (bbuchanan): Extend storage API to support an upsert operation, and
  //      use that here.  Would be even better if our backend storage supported
  //      it (like mongodb).
  shard.heartbeatTable.readAll(function (err, rows) {
    var nodeRows = rows
        .filter(function (row) {
          return row.nodeID == nodeID;
        })
        .sort(function (a, b) {
          return a.time < b.time ? 1 : -1;
        });

    if (nodeRows.length > 0) {
      onComplete(null, new NetSimHeartbeat(shard, nodeRows[0]));
    } else {
      NetSimHeartbeat.create(shard, function (err, newHeartbeat) {
        if (err) {
          onComplete(err, null);
          return;
        }

        newHeartbeat.nodeID = nodeID;
        newHeartbeat.update(function (err) {
          if (err) {
            // Failed to fully create heartbeat
            newHeartbeat.destroy();
            onComplete(err, null);
            return;
          }
          onComplete(null, newHeartbeat);
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
NetSimHeartbeat.prototype.getTable = function () {
  return this.shard_.heartbeatTable;
};

/**
 * Build own row for the wire table
 * @override
 */
NetSimHeartbeat.prototype.buildRow = function () {
  return {
    nodeID: this.nodeID,
    time: (this.time_ - this.falseAgeMS_)
  };
};

/**
 * Change how often this heartbeat attempts to update its remote storage
 * self.  Default value is 6 seconds.  Warning! If set too high, this
 * heartbeat may be seen as expired by another client and get cleaned up!
 *
 * @param {number} intervalMs - time between udpates, in milliseconds
 */
NetSimHeartbeat.prototype.setBeatInterval = function (intervalMs) {
  this.intervalMs_ = intervalMs;
};

/**
 * Set a handler to call if this heartbeat is unable to update its remote
 * storage representation.  Can be used to go into a recovery mode,
 * acknowledge disconnect, and/or attempt an auto-reconnect.
 * @param {function} failedHeartbeatCallback
 * @throws if set would clobber a previously-set callback
 */
NetSimHeartbeat.prototype.setFailureCallback = function (failedHeartbeatCallback) {
  if (this.onFailedHeartbeat !== undefined && failedHeartbeatCallback !== undefined) {
    throw new Error("Heartbeat already has a failure callback.");
  }
  this.onFailedHeartbeat = failedHeartbeatCallback;
};

/**
 * Updates own row on regular interval, as long as something's making
 * it tick.
 */
NetSimHeartbeat.prototype.tick = function () {
  if (Date.now() - this.time_ > this.intervalMs_) {
    this.time_ = Date.now();
    this.update(function (err) {
      if (err) {
        // Implement a three-strikes rule for failed updates, to be more
        // resilient against brief service interruptions.
        this.consecutiveFailedUpdates_++;
        logger.warn("Heartbeat update failed; strike " + this.consecutiveFailedUpdates_);
        if (this.consecutiveFailedUpdates_ >= NUM_FAILED_UPDATES_TO_KICK) {
          // A failed heartbeat update may indicate that we've been disconnected
          // or kicked from the shard.  We may want to take action.
          if (this.onFailedHeartbeat !== undefined) {
            this.onFailedHeartbeat(err);
          }
        }
      } else {
        this.consecutiveFailedUpdates_ = 0;
      }
    }.bind(this));
  }
};

/**
 * Cause this heartbeat to look like it's ten minutes old to the other
 * nodes on the shard, so it will be cleaned up by another node.
 */
NetSimHeartbeat.prototype.spoofExpired = function () {
  this.falseAgeMS_ += 600000; // 10 minutes old
  this.update();
};
