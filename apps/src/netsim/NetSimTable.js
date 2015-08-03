/**
 * @overview Wraps remote storage interface and polling behavior.
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
/* global $ */
'use strict';

var _ = require('../utils').getLodash();
var ObservableEvent = require('../ObservableEvent');
var NetSimApi = require('./NetSimApi');

/**
 * Maximum time (in milliseconds) that tables should wait between full cache
 * updates from the server.
 * @type {number}
 */
var DEFAULT_POLLING_DELAY_MS = 10000;

/**
 * Minimum wait time (in milliseconds) between readAll requests.
 * @type {number}
 */
var DEFAULT_REFRESH_THROTTLING_MS = 1000;

/**
 * Wraps the app storage table API in an object with local
 * cacheing and callbacks, which provides a notification API to the rest
 * of the NetSim code.
 * @param {!string} shardID - The shard ID specific to this class' NetSim instance.
 * @param {!string} tableName - The name of the remote storage table to wrap.
 * @param {!Object} options - Additional table configuration options
 * @param {!PubSubChannel} options.channel - The pubsub channel used to listen
 *        for changes to the table.cellPadding
 * @param {boolean} [options.useIncrementalRefresh] - defaults to FALSE.  If
 *        TRUE, this table will only request content that is new since its
 *        last refresh, not the entire table contents.  Currently this option
 *        is not safe to use if you care about updates or deletes in the table.
 * @constructor
 * @throws {Error} if wrong number of arguments are provided.
 */
var NetSimTable = module.exports = function (shardID, tableName, options) {
  // Require channel, shardID and tableName to be provided
  if (!shardID) {
    throw new Error('shardID is required');
  } else if (!tableName) {
    throw new Error('tableName is required');
  } else if (!options) {
    throw new Error('options object is required');
  } else if (!options.channel) {
    throw new Error('options.channel is required');
  }

  /**
   * @type {PubSubChannel}
   * @private
   */
  this.channel_ = options.channel;
  this.channel_.subscribe(tableName, NetSimTable.prototype.onPubSubEvent.bind(this));

  /**
   * If TRUE, will only request deltas from remote storage.  Currently
   * unsafe if we care about more than inserts to the table.
   * @type {boolean}
   * @private
   */
  this.useIncrementalRefresh_ = !!(options.useIncrementalRefresh);

  /**
   * Base URL we hit to make our API calls
   * @type {string}
   * @private
   */
  this.remoteUrl_ = '/v3/netsim/' + shardID + '/' + tableName;

  /**
   * API object for making remote calls
   * @type {NetSimApi}
   * @private
   */
  this.api_ = NetSimApi.create(this.remoteUrl_);

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
   * The row ID of the most recently inserted row retrieved from remote storage.
   * @type {number}
   * @private
   */
  this.latestRowID_ = 0;

  /**
   * Unix timestamp for last time this table's cache contents were fully
   * updated.  Used to determine when to poll the server for changes.
   * @type {number}
   * @private
   */
  this.lastRefreshTime_ = 0;

  /**
   * Minimum time (in milliseconds) to wait between pulling full table contents
   * from remote storage.
   * @type {number}
   * @private
   */
  this.pollingInterval_ = DEFAULT_POLLING_DELAY_MS;

  /**
   * Throttled version (specific to this instance) of the readAll operation,
   * used to coalesce readAll requests.
   * @type {function}
   * @private
   */
  this.refreshTable_ = this.makeThrottledRefresh_(
      DEFAULT_REFRESH_THROTTLING_MS);
};

/**
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.readAll = function (callback) {
  this.api_.all(function (err, data) {
    if (err === null) {
      this.fullCacheUpdate_(data);
    }
    callback(err, data);
  }.bind(this));
};

/**
 * @param {!number} rowID
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.readFromID = function (rowID, callback) {
  this.api_.allFromID(rowID, function (err, data) {
    if (err === null) {
      this.incrementalCacheUpdate_(data);
    }
    callback(err, data);
  }.bind(this));
};

/**
 * Generate throttled refresh function which will generate actual server
 * requests at the maximum given rate no matter how fast it is called. This
 * allows us to coalesce readAll events and reduce server load.
 * @param {number} waitMs - Minimum time (in milliseconds) to wait between
 *        readAll requests to the server.
 * @returns {function}
 * @private
 */
NetSimTable.prototype.makeThrottledRefresh_ = function (waitMs) {
  return _.throttle(function () {
    if (this.useIncrementalRefresh_) {
      this.readFromID(this.latestRowID_ + 1, function () {});
    } else {
      this.readAll(function () {});
    }
  }.bind(this), waitMs);
};

/**
 * @returns {Array} all locally cached table rows
 */
NetSimTable.prototype.readAllCached = function () {
  return this.arrayFromCache_();
};

/**
 * @param {!number} id
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.read = function (id, callback) {
  this.api_.fetch(id, function (err, data) {
    if (err === null) {
      this.updateCacheRow_(id, data);
    }
    callback(err, data);
  }.bind(this));
};

/**
 * @param {Object} value
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.create = function (value, callback) {
  this.api_.create(value, function (err, data) {
    if (err === null) {
      this.addRowToCache_(data);
    }
    callback(err, data);
  }.bind(this));
};

/**
 * @param {!number} id
 * @param {Object} value
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.update = function (id, value, callback) {
  this.api_.update(id, value, function (err, success) {
    if (err === null) {
      this.updateCacheRow_(id, value);
    }
    callback(err, success);
  }.bind(this));
};

/**
 * @param {!number} id
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.delete = function (id, callback) {
  this.api_.delete(id, function (err, success) {
    if (err === null) {
      this.removeRowFromCache_(id);
    }
    callback(err, success);
  }.bind(this));
};

/**
 * Delete a row using a synchronous call. For use when navigating away from
 * the page; most of the time an asynchronous call is preferred.
 * @param id
 */
NetSimTable.prototype.synchronousDelete = function (id) {
  // Client API doesn't support synchronous calls, so we manually make our API
  // call here
  $.ajax({
    url: this.remoteUrl_ + '/' + id,
    type: 'delete',
    async: false,
    error: function (jqXHR, textStatus, errorThrown) {
      // Nothing we can really do with the error, as we're in the process of
      // navigating away. Throw so that high incidence rates will show up in
      // new relic.
      throw new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown);
    }
  });

  this.removeRowFromCache_(id);
};

/**
 * @param {Array} allRows
 * @private
 */
NetSimTable.prototype.fullCacheUpdate_ = function (allRows) {
  // Rebuild entire cache
  var maxRowID = 0;
  var newCache = allRows.reduce(function (prev, currentRow) {
    prev[currentRow.id] = currentRow;
    if (currentRow.id > maxRowID) {
      maxRowID = currentRow.id;
    }
    return prev;
  }, {});

  // Check for changes, if anything changed notify all observers on table.
  if (!_.isEqual(this.cache_, newCache)) {
    this.cache_ = newCache;
    this.latestRowID_ = maxRowID;
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }

  this.lastRefreshTime_ = Date.now();
};

/**
 * @param {Array} newRows
 * @private
 */
NetSimTable.prototype.incrementalCacheUpdate_ = function (newRows) {
  if (newRows.length > 0) {
    var maxRowID = 0;
    newRows.forEach(function (row) {
      this.cache_[row.id] = row;
      maxRowID = Math.max(maxRowID, row.id);
    }, this);
    this.latestRowID_ = maxRowID;
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }

  this.lastRefreshTime_ = Date.now();
};

/**
 * @param {!Object} row
 * @param {!number} row.id
 * @private
 */
NetSimTable.prototype.addRowToCache_ = function (row) {
  this.cache_[row.id] = row;
  this.tableChange.notifyObservers(this.arrayFromCache_());
};

/**
 * @param {!number} id
 * @private
 */
NetSimTable.prototype.removeRowFromCache_ = function (id) {
  if (this.cache_[id] !== undefined) {
    delete this.cache_[id];
    this.tableChange.notifyObservers(this.arrayFromCache_());
  }
};

/**
 * @param {!number} id
 * @param {!Object} row
 * @private
 */
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

/**
 * @returns {Array}
 * @private
 */
NetSimTable.prototype.arrayFromCache_ = function () {
  var result = [];
  for (var k in this.cache_) {
    if (this.cache_.hasOwnProperty(k)) {
      result.push(this.cache_[k]);
    }
  }
  return result;
};

/**
 * Changes how often this table fetches a full table update from the
 * server.
 * @param {number} intervalMs - milliseconds of delay between updates.
 */
NetSimTable.prototype.setPollingInterval = function (intervalMs) {
  this.pollingInterval_ = intervalMs;
};

/**
 * Change the maximum rate at which the readAll operation for this table
 * will _actually_ be executed, no matter how fast readAll() is called.
 * @param {number} waitMs - Minimum number of milliseconds between readAll
 *        requests to the server.
 */
NetSimTable.prototype.setRefreshThrottleTime = function (waitMs) {
  // To do this, we just replace the throttled readAll function with a new one.
  this.refreshTable_ = this.makeThrottledRefresh_(waitMs);
};

/** Polls server for updates, if it's been long enough. */
NetSimTable.prototype.tick = function () {
  var now = Date.now();
  if (now - this.lastRefreshTime_ > this.pollingInterval_) {
    this.lastRefreshTime_ = now;
    this.refreshTable_();
  }
};

/**
 * Called when the PubSub service fires an event that this table is subscribed to.
 * @param {Object} eventData
 */
NetSimTable.prototype.onPubSubEvent = function () {
  this.refreshTable_();
};
