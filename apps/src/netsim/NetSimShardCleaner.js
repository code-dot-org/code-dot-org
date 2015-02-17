/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

var utils = require('../utils');
var commands = require('../commands');
var Command = commands.Command;
var CommandSequence = commands.CommandSequence;
var NetSimEntity = require('./NetSimEntity');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var NetSimNode = require('./NetSimNode');
var NetSimWire = require('./NetSimWire');
var NetSimMessage = require('./NetSimMessage');
var NetSimLogEntry = require('./NetSimLogEntry');
var NetSimLogger = require('./NetSimLogger');

var logger = NetSimLogger.getSingleton();

/**
 * How often a cleaning job should be kicked off.
 * @type {number}
 */
var CLEANING_RETRY_INTERVAL_MS = 60000;
var CLEANING_SUCCESS_INTERVAL_MS = 300000;

/**
 * How long a cleaning lock (heartbeat) must be untouched before can be
 * ignored and cleaned up by another client.
 * @type {number}
 */
var CLEANING_HEARTBEAT_TIMEOUT = 15000;

/**
 * Special heartbeat type that acts as a cleaning lock across the shard
 * for the NetSimShardCleaner module.
 *
 * @param {!NetSimShard} shard
 * @param {*} row
 * @constructor
 * @augments NetSimHeartbeat
 */
var CleaningHeartbeat = function (shard, row) {
  row = row !== undefined ? row : {};
  NetSimHeartbeat.call(this, shard, row);

  /**
   * @type {number}
   * @private
   * @override
   */
  this.nodeID_ = 0;
};
CleaningHeartbeat.inherits(NetSimHeartbeat);

/**
 * Static creation method for a CleaningHeartbeat.
 * @param {!NetSimShard} shard
 * @param {!function} onComplete - Callback that is passed the new
 *        CleaningHeartbeat object.
 */
CleaningHeartbeat.create = function (shard, onComplete) {
  NetSimEntity.create(CleaningHeartbeat, shard, onComplete);
};

/**
 * Static getter for all non-expired cleaning locks on the shard.
 * @param {!NetSimShard} shard
 * @param {!function} onComplete - callback that receives an array of the non-
 *        expired cleaning locks.
 */
CleaningHeartbeat.getAllCurrent = function (shard, onComplete) {
  shard.heartbeatTable.readAll(function (rows) {
    var heartbeats = rows
        .filter(function (row) {
          return row.cleaner === true &&
              Date.now() - row.time < CLEANING_HEARTBEAT_TIMEOUT;
        })
        .map(function (row) {
          return new CleaningHeartbeat(shard, row);
        });
    onComplete(heartbeats);
  });
};

/**
 * CleaningHeartbeat row has an extra field to indicate its special type.
 * @returns {*}
 * @private
 * @override
 */
CleaningHeartbeat.prototype.buildRow_ = function () {
  return utils.extend(
      CleaningHeartbeat.superPrototype.buildRow_.call(this),
      { cleaner: true }
  );
};

/**
 * Special subsystem that performs periodic cleanup on the shard tables.
 *
 * Every once in a while, a client will invoke the cleaning routine, which
 * begins by attempting to get a cleaning lock on the shard.  If lock is
 * obtained we can be sure that no other client is trying to clean the shard
 * right now, and we proceed to clean the tables of expired rows.
 *
 * @param {!NetSimShard} shard
 * @constructor
 */
var NetSimShardCleaner = module.exports = function (shard) {

  /**
   * Shard we intend to keep clean.
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = shard;

  /**
   * Local timestamp (milliseconds) of when we next intend to
   * kick off a cleaning routine.
   * @type {number}
   * @private
   */
  this.nextAttemptTime_ = Date.now();

  /**
   * A special heartbeat that acts as our cleaning lock on the shard
   * and prevents other clients from cleaning at the same time.
   * @type {CleaningHeartbeat}
   * @private
   */
  this.heartbeat_ = null;
};

/**
 * Check whether enough time has passed since our last cleaning
 * attempt, and if so try to start a cleaning routine.
 * @param {RunLoop.Clock} clock
 */
NetSimShardCleaner.prototype.tick = function (clock) {
  if (Date.now() >= this.nextAttemptTime_) {
    this.nextAttemptTime_ = Date.now() + CLEANING_RETRY_INTERVAL_MS;
    this.cleanShard();
  }

  if (this.heartbeat_) {
    this.heartbeat_.tick(clock);
  }

  if (this.steps_){
    this.steps_.tick(clock);
    if (this.steps_.isFinished()){
      this.steps_ = undefined;
    }
  }
};

/**
 * Attempt to begin a cleaning routine.
 */
NetSimShardCleaner.prototype.cleanShard = function () {
  this.getCleaningLock(function (isLockAcquired) {
    if (!isLockAcquired) {
      return;
    }

    this.steps_ = new CommandSequence([
      new CacheTable(this, 'heartbeat', this.shard_.heartbeatTable),
      new CleanHeartbeats(this),

      new CacheTable(this, 'heartbeat', this.shard_.heartbeatTable),
      new CacheTable(this, 'node', this.shard_.nodeTable),
      new CleanNodes(this),

      new CacheTable(this, 'node', this.shard_.nodeTable),
      new CacheTable(this, 'wire', this.shard_.wireTable),
      new CleanWires(this),

      new CacheTable(this, 'message', this.shard_.messageTable),
      new CleanMessages(this),

      new CacheTable(this, 'log', this.shard_.logTable),
      new CleanLogs(this),

      new ReleaseCleaningLock(this)
    ]);
    this.steps_.begin();
  }.bind(this));
};

/**
 * Whether this cleaner currently has the only permission to clean
 * shard tables.
 * @returns {boolean}
 */
NetSimShardCleaner.prototype.hasCleaningLock = function () {
  return this.heartbeat_ !== null;
};

/**
 * Attempt to acquire a cleaning lock by creating a CleaningHeartbeat
 * of our own, that does not collide with any existing CleaningHeartbeats.
 * @param {!function} onComplete - called when operation completes, with
 *        boolean "success" argument.
 */
NetSimShardCleaner.prototype.getCleaningLock = function (onComplete) {
  CleaningHeartbeat.create(this.shard_, function (heartbeat) {
    if (heartbeat === null) {
      onComplete(false);
      return;
    }

    // We made a heartbeat - now check to make sure there wasn't already
    // another one.
    CleaningHeartbeat.getAllCurrent(this.shard_, function (heartbeats) {
      if (heartbeats.length > 1) {
        // Someone else is already cleaning, back out and try again later.
        logger.info("Failed to acquire cleaning lock");
        heartbeat.destroy(function () {
          onComplete(false);
        });
        return;
      }

      // Success, we have cleaning lock.
      this.heartbeat_ = heartbeat;
      logger.info("Cleaning lock acquired");
      onComplete(true);
    }.bind(this));
  }.bind(this));
};

/**
 * Remove and destroy this cleaner's CleaningHeartbeat, giving another
 * client the chance to acquire a lock.
 * @param {!function} onComplete - called when operation completes, with
 *        boolean "success" argument.
 */
NetSimShardCleaner.prototype.releaseCleaningLock = function (onComplete) {
  this.heartbeat_.destroy(function (success) {
    this.heartbeat_ = null;
    this.nextAttemptTime_ = Date.now() + CLEANING_SUCCESS_INTERVAL_MS;
    logger.info("Cleaning lock released");
    onComplete(success);
  }.bind(this));
};

/**
 * Sets key-value pair on cleaner's table cache.
 * @param {!string} key - usually table's name.
 * @param {!Array} rows - usually table data.
 */
NetSimShardCleaner.prototype.cacheTable = function (key, rows) {
  if (this.tableCache === undefined) {
    this.tableCache = {};
  }
  this.tableCache[key] = rows;
};

/**
 * Look up value for key in cleaner's table cache.
 * @param {!string} key - usually table's name.
 * @returns {Array} table's cached data.
 */
NetSimShardCleaner.prototype.getTableCache = function (key) {
  return this.tableCache[key];
};

/**
 * Get shard that cleaner is operating on.
 * @returns {NetSimShard}
 */
NetSimShardCleaner.prototype.getShard = function () {
  return this.shard_;
};

/**
 * Command that asynchronously fetches all rows for the given table
 * and stores them in the cleaner's tableCache for the given key.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @param {!string} key
 * @param {!NetSimTable} table
 * @constructor
 * @augments Command
 */
var CacheTable = function (cleaner, key, table) {
  Command.call(this);

  /**
   * @type {NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;

  /**
   * @type {string}
   * @private
   */
  this.key_ = key;

  /**
   * @type {!NetSimTable}
   * @private
   */
  this.table_ = table;
};
CacheTable.inherits(Command);

/**
 * Trigger asynchronous readAll request on table.
 * @private
 */
CacheTable.prototype.onBegin_ = function () {
  logger.info('Begin CacheTable[' + this.key_ + ']');
  this.table_.readAll(function (rows) {
    this.cleaner_.cacheTable(this.key_, rows);
    this.succeed();
  }.bind(this));
};

/**
 * Command that calls destroy() on the provided entity.
 *
 * @param {!NetSimEntity} entity
 * @constructor
 * @augments Command
 */
var DestroyEntity = function (entity) {
  Command.call(this);

  /**
   * @type {!NetSimEntity}
   * @private
   */
  this.entity_ = entity;
};
DestroyEntity.inherits(Command);

/**
 * Call destory() on stored entity.
 * @private
 */
DestroyEntity.prototype.onBegin_ = function () {

  logger.info('Begin DestroyEntity[' + this.entity_.entityID + ']');
  this.entity_.destroy(function (success) {
    if (success) {
      logger.info("Deleted entity");
      this.succeed();
    } else {
      this.fail();
    }
  }.bind(this));
};

/**
 * Command that tells cleaner to release its cleaning lock.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @constructor
 * @augments Command
 */
var ReleaseCleaningLock = function (cleaner) {
  Command.call(this);

  /**
   * @type {!NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;
};
ReleaseCleaningLock.inherits(Command);

/**
 * Tell cleaner to release its cleaning lock.
 * @private
 */
ReleaseCleaningLock.prototype.onBegin_ = function () {
  logger.info('Begin ReleaseCleaningLock');
  this.cleaner_.releaseCleaningLock(function (success) {
    if (success) {
      this.succeed();
    } else {
      this.fail();
    }
  }.bind(this));
};

/**
 * Command that scans cleaner's heartbeat table cache for expired heartbeats,
 * and deletes them one at a time.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanHeartbeats = function (cleaner) {
  CommandSequence.call(this);

  /**
   * @type {!NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;
};
CleanHeartbeats.inherits(CommandSequence);

/**
 * How old a heartbeat can be without being cleaned up.
 * @type {number}
 * @const
 */
var HEARTBEAT_TIMEOUT_MS = 30000;

/**
 * @private
 * @override
 */
CleanHeartbeats.prototype.onBegin_ = function () {
  logger.info('Begin CleanHeartbeats');
  var heartbeatRows = this.cleaner_.getTableCache('heartbeat');
  this.commandList_ = heartbeatRows.filter(function (row) {
    return Date.now() - row.time > HEARTBEAT_TIMEOUT_MS;
  }).map(function (row) {
    return new DestroyEntity(new NetSimHeartbeat(this.cleaner_.getShard(), row));
  }.bind(this));
  CommandSequence.prototype.onBegin_.call(this);
};

/**
 * Command that scans cleaner's node table cache, and then deletes all
 * nodes that don't have matching heartbeats in the heartbeat table cache.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanNodes = function (cleaner) {
  CommandSequence.call(this);

  /**
   * @type {!NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;
};
CleanNodes.inherits(CommandSequence);

/**
 * @private
 * @override
 */
CleanNodes.prototype.onBegin_ = function () {
  logger.info('Begin CleanNodes');
  var heartbeatRows = this.cleaner_.getTableCache('heartbeat');
  var nodeRows = this.cleaner_.getTableCache('node');
  this.commandList_ = nodeRows.filter(function (row) {
    return heartbeatRows.every(function (heartbeat) {
      return heartbeat.nodeID !== row.id;
    });
  }).map(function (row) {
    return new DestroyEntity(new NetSimNode(this.cleaner_.getShard(), row));
  }.bind(this));
  CommandSequence.prototype.onBegin_.call(this);
};

/**
 * Command that scans cleaner's Wires table cache, and deletes any wires
 * that are associated with nodes that aren't in the node table cache.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanWires = function (cleaner) {
  CommandSequence.call(this);

  /**
   * @type {!NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;
};
CleanWires.inherits(CommandSequence);

/**
 * @private
 * @override
 */
CleanWires.prototype.onBegin_ = function () {
  logger.info('Begin CleanWires');
  var nodeRows = this.cleaner_.getTableCache('node');
  var wireRows = this.cleaner_.getTableCache('wire');
  this.commandList_ = wireRows.filter(function (wireRow) {
    return !(nodeRows.some(function (nodeRow) {
      return nodeRow.id === wireRow.localNodeID;
    }) && nodeRows.some(function (nodeRow) {
      return nodeRow.id === wireRow.remoteNodeID;
    }));
  }).map(function (row) {
    return new DestroyEntity(new NetSimWire(this.cleaner_.getShard(), row));
  }.bind(this));
  CommandSequence.prototype.onBegin_.call(this);
};

/**
 * Command that scans the cleaner's message table cache, and deletes any
 * messages in transit to nodes that no longer exist in the node table cache.
 *
 * @param {!NetSimShardCleaner} cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanMessages = function (cleaner) {
  CommandSequence.call(this);

  /**
   * @type {!NetSimShardCleaner}
   * @private
   */
  this.cleaner_ = cleaner;
};
CleanMessages.inherits(CommandSequence);

/**
 * @private
 * @override
 */
CleanMessages.prototype.onBegin_ = function () {
  logger.info('Begin CleanMessages');
  var nodeRows = this.cleaner_.getTableCache('node');
  var messageRows = this.cleaner_.getTableCache('message');
  this.commandList_ = messageRows.filter(function (messageRow) {
    return nodeRows.every(function (nodeRow) {
      return nodeRow.id !== messageRow.toNodeID;
    });
  }).map(function (row) {
    return new DestroyEntity(new NetSimMessage(this.cleaner_.getShard(), row));
  }.bind(this));
  CommandSequence.prototype.onBegin_.call(this);
};

/**
 *
 * @param cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanLogs = function (cleaner) {
  CommandSequence.call(this);
  this.cleaner_ = cleaner;
};
CleanLogs.inherits(CommandSequence);

/**
 *
 * @private
 * @override
 */
CleanLogs.prototype.onBegin_ = function () {
  logger.info('Begin CleanLogs');
  var nodeRows = this.cleaner_.getTableCache('node');
  var logRows = this.cleaner_.getTableCache('log');
  this.commandList_ = logRows.filter(function (logRow) {
    return nodeRows.every(function (nodeRow) {
      return nodeRow.id !== logRow.nodeID;
    });
  }).map(function (row) {
    return new DestroyEntity(new NetSimLogEntry(this.cleaner_.getShard(), row));
  }.bind(this));
  CommandSequence.prototype.onBegin_.call(this);
};
