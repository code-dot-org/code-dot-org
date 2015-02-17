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
var commands = require('./commands');
var Command = commands.Command;
var CommandSequence = commands.CommandSequence;
var NetSimEntity = require('./NetSimEntity');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var NetSimNode = require('./NetSimNode');
var NetSimWire = require('./NetSimWire');
var NetSimMessage = require('./NetSimMessage');
var NetSimLogger = require('./NetSimLogger');

var logger = NetSimLogger.getSingleton();

/**
 * How often a cleaning job should be kicked off.
 * @type {number}
 */
var CLEANING_INTERVAL_MS = 30000;

/**
 * How long a cleaning lock (heartbeat) must be untouched before can be
 * ignored and cleaned up by another client.
 * @type {number}
 */
var CLEANING_HEARTBEAT_TIMEOUT = 15000;

var CleaningHeartbeat = function (shard, row) {
  row = row !== undefined ? row : {};
  NetSimHeartbeat.call(this, shard, row);

  this.nodeID_ = 0;
};
CleaningHeartbeat.inherits(NetSimHeartbeat);

CleaningHeartbeat.create = function (shard, onComplete) {
  NetSimEntity.create(CleaningHeartbeat, shard, onComplete);
};

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
 * right now, and we proceed to clean the other tables of expired rows.
 *
 * @param {!NetSimShard} shard
 * @constructor
 */
var NetSimShardCleaner = module.exports = function (shard) {
  this.shard_ = shard;

  this.nextAttempt_ = Date.now();

  this.heartbeat_ = null;
};

/**
 * Check whether enough time has passed since our last cleaning
 * attempt, and if so try to start a cleaning routine.
 */
NetSimShardCleaner.prototype.tick = function (clock) {
  if (Date.now() >= this.nextAttempt_) {
    this.nextAttempt_ = Date.now() + CLEANING_INTERVAL_MS;
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

      new ReleaseCleaningLock(this)
    ]);
    this.steps_.begin();
  }.bind(this));
};

NetSimShardCleaner.prototype.hasCleaningLock = function () {
  return this.heartbeat_ !== null;
};

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

NetSimShardCleaner.prototype.releaseCleaningLock = function (onComplete) {
  this.heartbeat_.destroy(function (success) {
    this.heartbeat_ = null;
    this.nextAttempt_ = Date.now() + CLEANING_INTERVAL_MS;
    logger.info("Cleaning lock released");
    onComplete(success);
  }.bind(this));
};

NetSimShardCleaner.prototype.cacheTable = function (key, rows) {
  if (this.tableCache === undefined) {
    this.tableCache = {};
  }
  this.tableCache[key] = rows;
};

NetSimShardCleaner.prototype.getTableCache = function (key) {
  return this.tableCache[key];
};

NetSimShardCleaner.prototype.getShard = function () {
  return this.shard_;
};

/**
 *
 * @param cleaner
 * @param key
 * @param table
 * @constructor
 * @augments Command
 */
var CacheTable = function (cleaner, key, table) {
  Command.call(this);
  this.cleaner_ = cleaner;
  this.key_ = key;
  this.table_ = table;
};
CacheTable.inherits(Command);

CacheTable.prototype.onBegin_ = function () {
  logger.info('Begin CacheTable[' + this.key_ + ']');
  this.table_.readAll(function (rows) {
    this.cleaner_.cacheTable(this.key_, rows);
    this.succeed();
  }.bind(this));
};

/**
 *
 * @param entity
 * @constructor
 * @augments Command
 */
var DestroyEntity = function (entity) {
  Command.call(this);
  this.entity_ = entity;
};
DestroyEntity.inherits(Command);

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
 *
 * @param cleaner
 * @constructor
 * @augments Command
 */
var ReleaseCleaningLock = function (cleaner) {
  Command.call(this);
  this.cleaner_ = cleaner;
};
ReleaseCleaningLock.inherits(Command);

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
 *
 * @param cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanHeartbeats = function (cleaner) {
  CommandSequence.call(this);
  this.cleaner_ = cleaner;
};
CleanHeartbeats.inherits(CommandSequence);

var HEARTBEAT_TIMEOUT_MS = 30000;
/**
 *
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
 *
 * @param cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanNodes = function (cleaner) {
  CommandSequence.call(this);
  this.cleaner_ = cleaner;
};
CleanNodes.inherits(CommandSequence);

/**
 *
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
 *
 * @param cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanWires = function (cleaner) {
  CommandSequence.call(this);
  this.cleaner_ = cleaner;
};
CleanWires.inherits(CommandSequence);

/**
 *
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
 *
 * @param cleaner
 * @constructor
 * @augments CommandSequence
 */
var CleanMessages = function (cleaner) {
  CommandSequence.call(this);
  this.cleaner_ = cleaner;
};
CleanMessages.inherits(CommandSequence);

/**
 *
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