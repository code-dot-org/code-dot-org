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

/**
 * @fileoverview Wraps a shard ID with helpers for getting certain tables
 * out of the shard.
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
/* global window */
'use strict';

var SharedTable = require('../appsApi').SharedTable;
var _ = require('../utils').getLodash();
var ObservableEvent = require('./ObservableEvent');

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 * @readonly
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
var APP_PUBLIC_KEY =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "JGW2rHUp_UCMW_fQmRf6iQ==" : "HQJ8GCCMGP7Yh8MrtDusIA==";


/**
 * Wrap remote storage table in a netsim-specific wrapper.
 * I hope to implement local cache and/or notifications here.
 * @param {!string} tableName
 * @constructor
 */
var NetSimTable = function (tableName) {
  /**
   * Actual API to the remote shared table.
   * @type {SharedTable}
   * @private
   */
  this.remoteTable_ = new SharedTable(APP_PUBLIC_KEY, tableName);

  /**
   * Store table contents locally, so we can detect when changes occur.
   * @type {Object}
   * @private
   */
  this.cache_ = {};

  /**
   * Event that fires when full table updates indicate a change,
   * when rows are added, or when rows are removed, or when rows change.
   * @type {ObservableEvent}
   */
  this.tableChangeEvent = new ObservableEvent();
};

NetSimTable.prototype.readAll = function (callback) {
  var self = this;
  this.remoteTable_.readAll(function (data) {
    callback(data);
    if (data !== null) {
      self.fullCacheUpdate_(data);
    }
  });
};

NetSimTable.prototype.read = function (id, callback) {
  var self = this;
  this.remoteTable_.read(id, function (data) {
    callback(data);
    if (data !== undefined) {
      self.updateCacheRow_(id, data);
    }
  });
};

NetSimTable.prototype.create = function (value, callback) {
  var self = this;
  this.remoteTable_.create(value, function (data) {
    callback(data);
    if (data !== undefined) {
      self.addRowToCache_(data);
    }
  });
};

NetSimTable.prototype.update = function (id, value, callback) {
  var self = this;
  this.remoteTable_.update(id, value, function (success) {
    callback(success);
    if (success) {
      self.updateCacheRow_(id, value);
    }
  });
};

NetSimTable.prototype.delete = function (id, callback) {
  var self = this;
  this.remoteTable_.delete(id, function (success) {
    callback(success);
    if (success) {
      self.removeRowFromCache_(id);
    }
  });
};

NetSimTable.prototype.fullCacheUpdate_ = function (allRows) {
  // Rebuild entire cache
  var newCache = allRows.reduce(function (prev, currentRow) {
    prev[currentRow] = currentRow;
    return prev;
  }, {});

  // Check for changes, if anything changed notify all observers on table.
  if (!_.isEqual(this.cache_, newCache)) {
    this.cache_ = newCache;
    this.tableChangeEvent.notifyObservers();
  }
};

NetSimTable.prototype.addRowToCache_ = function (row) {
  this.cache_[row.id] = row;
  this.tableChangeEvent.notifyObservers();
};

NetSimTable.prototype.removeRowFromCache_ = function (id) {
  if (this.cache_[id] !== undefined) {
    this.cache_[id] = undefined;
    this.tableChangeEvent.notifyObservers();
  }
};

NetSimTable.prototype.updateCacheRow_ = function (id, row) {
  var oldRow = this.cache_[id];
  if (!_.isEqual(oldRow, row)) {
    this.cache_[id] = row;
    this.tableChangeEvent.notifyObservers();
  }
};

/**
 * A shard is an isolated, complete simulation state shared by a subset of
 * users.  It's made of a set of storage tables set apart by a particular
 * shard ID in their names.  We use shards to allow students to interact only
 * with their particular class while still storing all NetSim tables under
 * the same App ID.
 *
 * @param {!string} shardID
 * @constructor
 */
var NetSimShard = function (shardID) {
  /** @type {string} */
  this.shardID = shardID;

  /** @type {NetSimTable} */
  this.lobbyTable = new NetSimTable(instanceID + '_node');

  /** @type {NetSimTable} */
  this.wireTable = new NetSimTable(instanceID + '_wire');
};

module.exports = NetSimShard;