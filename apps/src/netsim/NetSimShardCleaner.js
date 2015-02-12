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
var NetSimEntity = require('./NetSimEntity');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var NetSimLogger = require('./NetSimLogger');

var logger = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

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
          return row.cleaner === true
              && Date.now() - row.time_ < CLEANING_HEARTBEAT_TIMEOUT;
        })
        .map(function (row) {
          return new CleaningHeartbeat(shard, row);
        });
    onComplete(heartbeats);
  });
};

CleaningHeartbeat.prototype.buildRow_ = function () {
  return utils.extend(
      CleaningHeartbeat.superPrototype.buildRow_(),
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
  if (Date.now() > this.nextAttempt_) {
    this.nextAttempt_ = Date.now() + CLEANING_INTERVAL_MS;
    this.cleanShard();
  }

  if (this.heartbeat_) {
    this.heartbeat_.tick(clock);
  }

  if (this.stepRunner_){
    this.stepRunner_.tick(clock);
    if (this.stepRunner_.isDone()){
      this.stepRunner_ = undefined;
    }
  }
};

NetSimShardCleaner.prototype.cleanShard = function () {
  this.getCleaningLock(function (isLockAcquired) {
    if (!isLockAcquired) {
      return;
    }

    this.stepRunner_ = new StepRunner([
      new CacheTable(this, 'heartbeat', this.shard_.heartbeatTable),
      new CacheTable(this, 'node', this.shard_.nodeTable),
      new CacheTable(this, 'wire', this.shard_.wireTable),
      new CacheTable(this, 'message', this.shard_.messageTable),
      new CleanHeartbeats(this),
      // Clean nodes
      // Clean wires
      // Clean messages
      new ReleaseCleaningLock(this)
    ]);
  }.bind(this));
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
        heartbeat.destroy();
        onComplete(false);
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
  }.bind(this))
};

NetSimShardCleaner.prototype.cacheTable = function (key, rows) {
  if (this.tableCache === undefined) {
    this.tableCache = {};
  }
  this.tableCache[key] = rows;
};

var StepRunner = function (steps) {
  this.steps_ = steps;
};

StepRunner.prototype.tick = function (clock) {
  while (this.steps_.length > 0) {
    if (!this.steps_[0].isStarted()) {
      this.steps_[0].begin();
    } else {
      this.steps_[0].tick(clock);
    }

    if (this.steps_[0].isFinished()) {
      this.steps_.shift();
    } else {
      break;
    }
  }
};

StepRunner.prototype.isDone = function () {
  return this.steps_.length === 0;
};

var CleaningStep = function (cleaner) {
  this.cleaner_ = cleaner;
  this.isStarted_ = false;
  this.isFinished_ = false;
};

CleaningStep.prototype.begin = function () {
  this.isStarted_ = true;
  this.onBegin();
};
CleaningStep.prototype.onBegin = function () {};

CleaningStep.prototype.tick = function () {};

CleaningStep.prototype.end = function () {
  this.onEnd();
  this.isFinished_ = true;
};
CleaningStep.prototype.onEnd = function () {};

CleaningStep.prototype.isStarted = function () {
  return this.isStarted_;
};

CleaningStep.prototype.isFinished = function () {
  return this.isFinished_;
};

var CacheTable = function (cleaner, key, table) {
  CleaningStep.call(this, cleaner);
  this.key_ = key;
  this.table_ = table;
};
CacheTable.inherits(CleaningStep);

CacheTable.prototype.onBegin = function () {
  logger.info("Begin caching table " + this.key_);
  this.table_.readAll(function (rows) {
    this.cleaner_.cacheTable(this.key_, rows);
    logger.info("Cached table " + this.key_);
    this.end();
  }.bind(this));
};

var CleanHeartbeats = function (cleaner) {
  CleaningStep.call(this, cleaner);
};
CleanHeartbeats.inherits(CleaningStep);

var HEARTBEAT_TIMEOUT_MS = 30000;
CleanHeartbeats.prototype.onBegin = function () {
  var heartbeatRows = this.cleaner_.tableCache['heartbeat'];
  var toDelete = heartbeatRows.filter(function (row) {
    return Date.now() - row.time > HEARTBEAT_TIMEOUT_MS;
  });
  var steps = toDelete.map(function (row) {
    return new DestroyEntity(this.cleaner_, new NetSimHeartbeat(this.cleaner_.shard_, row));
  }.bind(this));
  this.steps_ = new StepRunner(steps);
};

CleanHeartbeats.prototype.tick = function (clock) {
  this.steps_.tick(clock);
  if (this.steps_.isDone()) {
    this.end();
  }
};

var DestroyEntity = function (cleaner, entity) {
  CleaningStep.call(this, cleaner);
  this.entity_ = entity;
};
DestroyEntity.inherits(CleaningStep);

DestroyEntity.prototype.onBegin = function () {
  this.entity_.destroy(function () {
    this.end();
    logger.info("Deleted entity");
  }.bind(this));
};

var ReleaseCleaningLock = function (cleaner) {
  CleaningStep.call(this, cleaner);
};
ReleaseCleaningLock.inherits(CleaningStep);

ReleaseCleaningLock.prototype.onBegin = function () {
  this.cleaner_.releaseCleaningLock(function (success) {
    this.end();
  }.bind(this));
};
