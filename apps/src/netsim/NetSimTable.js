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

var _ = require('../utils').getLodash();
var ObservableEvent = require('../ObservableEvent');

/**
 * Maximum time (in milliseconds) that tables should wait between full cache
 * updates from the server.
 * @type {number}
 */
var POLLING_DELAY_MS = 5000;

/**
 * Wraps the app storage table API in an object with local
 * cacheing and callbacks, which provides a notification API to the rest
 * of the NetSim code.
 * @param {!SharedTable} storageTable - The remote storage table to wrap.
 * @constructor
 */
var NetSimTable = module.exports = function (storageTable) {
  /**
   * Actual API to the remote shared table.
   * @type {SharedTable}
   * @private
   */
  this.remoteTable_ = storageTable;


  /**
   * Event that fires when full table updates indicate a change,
   * when rows are added, or when rows are removed, or when rows change.
   * @type {ObservableEvent}
   */
  this.tableChange = new ObservableEvent();

  /**
   * Store table contents locally, so we can detect when changes occur.
   * @type {Object}
   * @private
   */
  this.cache_ = {};

  /**
   * Unix timestamp for last time this table's cache contents were fully
   * updated.  Used to determine when to poll the server for changes.
   * @type {number}
   * @private
   */
  this.lastFullUpdateTime_ = 0;
};

NetSimTable.prototype.readAll = function (callback) {
  this.remoteTable_.readAll(function (data) {
    callback(data);
    if (data !== null) {
      this.fullCacheUpdate_(data);
    }
  }.bind(this));
};

NetSimTable.prototype.read = function (id, callback) {
  this.remoteTable_.read(id, function (data) {
    callback(data);
    if (data !== undefined) {
      this.updateCacheRow_(id, data);
    }
  }.bind(this));
};

NetSimTable.prototype.create = function (value, callback) {
  this.remoteTable_.create(value, function (data) {
    callback(data);
    if (data !== undefined) {
      this.addRowToCache_(data);
    }
  }.bind(this));
};

NetSimTable.prototype.update = function (id, value, callback) {
  this.remoteTable_.update(id, value, function (success) {
    callback(success);
    if (success) {
      this.updateCacheRow_(id, value);
    }
  }.bind(this));
};

NetSimTable.prototype.delete = function (id, callback) {
  this.remoteTable_.delete(id, function (success) {
    callback(success);
    if (success) {
      this.removeRowFromCache_(id);
    }
  }.bind(this));
};

NetSimTable.prototype.fullCacheUpdate_ = function (allRows) {
  // Rebuild entire cache
  var newCache = allRows.reduce(function (prev, currentRow) {
    prev[currentRow.id] = currentRow;
    return prev;
  }, {});

  // Check for changes, if anything changed notify all observers on table.
  if (!_.isEqual(this.cache_, newCache)) {
    this.cache_ = newCache;
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }

  this.lastFullUpdateTime_ = Date.now();
};

NetSimTable.prototype.addRowToCache_ = function (row) {
  this.cache_[row.id] = row;
  this.tableChange.notifyObservers(this.arrayFromCache_());
};

NetSimTable.prototype.removeRowFromCache_ = function (id) {
  if (this.cache_[id] !== undefined) {
    delete this.cache_[id];
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }
};

NetSimTable.prototype.updateCacheRow_ = function (id, row) {
  var oldRow = this.cache_[id];
  var newRow = row;

  // Manually apply ID which should be present in row.
  newRow.id = id;

  if (!_.isEqual(oldRow, newRow)) {
    this.cache_[id] = newRow;
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }
};

NetSimTable.prototype.arrayFromCache_ = function () {
  var result = [];
  for (var k in this.cache_) {
    if (this.cache_.hasOwnProperty(k)) {
      result.push(this.cache_[k]);
    }
  }
  return result;
};

/** Polls server for updates, if it's been long enough. */
NetSimTable.prototype.tick = function () {
  if (Date.now() - this.lastFullUpdateTime_ > POLLING_DELAY_MS) {
    this.readAll(function () {});
  }
};
