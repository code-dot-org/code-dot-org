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
  row = row !== undefined ? row : {};
  NetSimEntity.call(this, shard, row);

  /** @type {number} Row ID in node table */
  this.nodeID_ = row.nodeID;

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
          newHeartbeat.nodeID_ = nodeID;
        }
        onComplete(newHeartbeat);
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
    nodeID: this.nodeID_,
    time: Date.now()
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
