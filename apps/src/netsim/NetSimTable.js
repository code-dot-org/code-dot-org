/**
 * @overview Wraps remote storage interface and polling behavior.
 */
'use strict';

var _ = require('../lodash');
var ObservableEvent = require('../ObservableEvent');
var NetSimApi = require('./NetSimApi');
var NetSimGlobals = require('./NetSimGlobals');
var ArgumentUtils = require('./ArgumentUtils');

/**
 * Maximum time (in milliseconds) that tables should wait between full cache
 * updates from the server.
 * @type {number}
 */
var DEFAULT_POLLING_DELAY_MS = 10000;

/**
 * Minimum time (in ms) to wait after an invalidation event before attempting
 * to trigger a refresh request.  This produces a window in which clustered
 * invalidations can be captured and coalesced together.
 * @type {number}
 */
var DEFAULT_MINIMUM_DELAY_BEFORE_REFRESH_MS = 250;

/**
 * Maximum additional random delay (in ms) to add before the refresh request.
 * Helps spread out requests from different clients responding to the same
 * invalidation events.
 * @type {number}
 */
var DEFAULT_MAXIMUM_DELAY_JITTER_MS = 200;

/**
 * Minimum time (in ms) to wait between refresh requests, regardless of how
 * many invalidation events occur.
 * @type {number}
 */
var DEFAULT_MINIMUM_DELAY_BETWEEN_REFRESHES_MS = 2500;

/**
 * Wraps the app storage table API in an object with local
 * caching and callbacks, which provides a notification API to the rest
 * of the NetSim code.
 * @param {!PubSubChannel} channel - The pubsub channel used to listen
 *        for changes to the table.cellPadding
 * @param {!string} shardID - The shard ID specific to this class' NetSim instance.
 * @param {!string} tableName - The name of the remote storage table to wrap.
 * @param {Object} [options] - Additional table configuration options
 * @param {boolean} [options.useIncrementalRefresh] - defaults to FALSE.  If
 *        TRUE, this table will only request content that is new since its
 *        last refresh, not the entire table contents.  Currently this option
 *        is not safe to use if you care about updates or deletes in the table.
 * @param {number} [options.minimumDelayBeforeRefresh] - Minimum time (in ms)
 *        to wait after an invalidation event before attempting to trigger a
 *        refresh request.  This produces a window in which clustered
 *        invalidations can be captured and coalesced together.
 * @param {number} [options.maximumJitterDelay] - Maximum additional random
 *        delay (in ms) to add before the refresh request.  Helps spread out
 *        requests from different clients responding to the same invalidation
 *        events.
 * @param {number} [options.minimumDelayBetweenRefreshes] - Minimum time (in ms)
 *        to wait between refresh requests, regardless of how many invalidation
 *        events occur.
 * @constructor
 * @throws {Error} if wrong number of arguments are provided.
 * @throws {TypeError} if invalid types are passed in the options object.
 */
var NetSimTable = module.exports = function (channel, shardID, tableName, options) {
  ArgumentUtils.validateRequired(channel, 'channel');
  ArgumentUtils.validateRequired(shardID, 'shardID', ArgumentUtils.isString);
  ArgumentUtils.validateRequired(tableName, 'tableName', ArgumentUtils.isString);
  options = ArgumentUtils.extendOptionsObject(options);

  /**
   * @private {string}
   */
  this.tableName_ = tableName;

  /**
   * @private {PubSubChannel}
   */
  this.channel_ = channel;
  this.subscribe();

  /**
   * API object for making remote calls
   * @type {NetSimApi}
   * @private
   */
  this.api_ = NetSimApi.makeTableApi(shardID, tableName);

  /**
   * Event that fires when full table updates indicate a change,
   * when rows are added, or when rows are removed, or when rows change.
   * @type {ObservableEvent}
   */
  this.tableChange = new ObservableEvent();

  /**
   * Store table contents locally, so we can detect when changes occur.
   * @private {Object}
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
   * @private {number}
   */
  this.lastRefreshTime_ = 0;

  /**
   * If TRUE, will only request deltas from remote storage.  Currently
   * unsafe if we care about more than inserts to the table.
   * @type {boolean}
   * @private
   */
  this.useIncrementalRefresh_ = options.get(
      'useIncrementalRefresh',
      ArgumentUtils.isBoolean,
      false);

  /**
   * Minimum time (in ms) to wait after an invalidation event before attempting
   * to trigger a refresh request.  This produces a window in which clustered
   * invalidations can be captured and coalesced together.
   * @private {number}
   */
  this.minimumDelayBeforeRefresh_ = options.get(
      'minimumDelayBeforeRefresh',
      ArgumentUtils.isPositiveNoninfiniteNumber,
      DEFAULT_MINIMUM_DELAY_BEFORE_REFRESH_MS);

  /**
   * Maximum additional random delay (in ms) to add before the refresh request.
   * Helps spread out requests from different clients responding to the same
   * invalidation events.
   * @private {number}
   */
  this.maximumJitterDelay_ = options.get(
      'maximumJitterDelay',
      ArgumentUtils.isPositiveNoninfiniteNumber,
      DEFAULT_MAXIMUM_DELAY_JITTER_MS);

  /**
   * Minimum time (in ms) to wait between refresh requests, regardless of how
   * many invalidation events occur.
   * @private {number}
   */
  this.minimumDelayBetweenRefreshes_ = options.get(
      'minimumDelayBetweenRefreshes',
      ArgumentUtils.isPositiveNoninfiniteNumber,
      DEFAULT_MINIMUM_DELAY_BETWEEN_REFRESHES_MS);

  /**
   * Minimum time (in milliseconds) to wait between pulling full table contents
   * from remote storage.
   * @private {number}
   */
  this.pollingInterval_ = DEFAULT_POLLING_DELAY_MS;

  /**
   * Throttled version (specific to this instance) of the refresh operation,
   * used to coalesce refresh requests.
   * @private {function}
   */
  this.refreshTable_ = this.makeThrottledRefresh_();
};

/**
 * @returns {string} the configured table name.
 */
NetSimTable.prototype.getTableName = function () {
  return this.tableName_;
};

/**
 * Subscribes this table's onPubSubEvent method to events for this table
 * on our local channel.
 */
NetSimTable.prototype.subscribe = function () {
  this.channel_.subscribe(this.tableName_,
      NetSimTable.prototype.onPubSubEvent_.bind(this));
};

/**
 * Unubscribes the saved callback from events for this table on our
 * local channel.
 */
NetSimTable.prototype.unsubscribe = function () {
  this.channel_.unsubscribe(this.tableName_);
};

/**
 * Asynchronously retrieve new/updated table content from the server, using
 * whatever method is most appropriate to this table's configuration.
 * When done, updates the local cache and hits the provided callback to
 * indicate completion.
 * @param {NodeStyleCallback} [callback] - indicates completion of the operation.
 * @returns {jQuery.Promise} Guaranteed to resolve after the cache update,
 *          so .done() operations can interact with the cache.
 */
NetSimTable.prototype.refresh = function (callback) {
  callback = callback || function () {};
  var deferred = $.Deferred();

  // Which API call to make
  var apiCall = this.useIncrementalRefresh_ ?
      this.api_.allRowsFromID.bind(this.api_, this.latestRowID_ + 1) :
      this.api_.allRows.bind(this.api_);

  // How to update the cache (depends on what we expect to get back)
  var cacheUpdate = this.useIncrementalRefresh_ ?
      this.incrementalCacheUpdate_.bind(this) :
      this.fullCacheUpdate_.bind(this);

  // What should happen when the API call completes.
  var apiCallCallback = function (err, data) {
    if (err) {
      callback(err, data);
      deferred.reject(err);
    } else {
      cacheUpdate(data);
      callback(err, data);
      deferred.resolve();
    }
  };

  // Do we fire the API call now, or after a random delay?
  if (this.maximumJitterDelay_ === 0) {
    apiCall(apiCallCallback);
  } else {
    var jitterTime = NetSimGlobals.randomIntInRange(0, this.maximumJitterDelay_);
    setTimeout(apiCall.bind(this, apiCallCallback), jitterTime);
  }

  return deferred.promise();
};

/**
 * Generate throttled refresh function which will generate actual server
 * requests at the maximum given rate no matter how fast it is called. This
 * allows us to coalesce refreshAll events and reduce server load.
 *
 * How this works:
 * Wraps a longer throttle with leading and trailing events in a shorter debounce
 * with a maximum wait time.  This gives grouped events a chance to coalesce
 * without triggering an unneeded trailing event on the longer throttle.
 *
 * Here are some examples of what's going on, if using a 1000ms throttle
 * wrapped in a 250ms debounce.
 *
 * In low traffic we collapse two groups of events to just two events.
 *
 * original events   :   || |                     | |
 * debounced         :   -250>|                   -250>|
 * then throttled    :        |--------------1000->    |--------------1000->
 *
 * In higher traffic we collapse the groups but still keep events at least
 * one second apart.
 *
 * original events   :   || |        |     |      | |
 * debounced         :   -250>|      -250>|-250>| -250>|
 * then throttled    :        |--------------1000->|--------------1000->|
 *
 * @returns {function()}
 * @private
 */
NetSimTable.prototype.makeThrottledRefresh_ = function () {
  var throttledRefresh = _.throttle(this.refresh.bind(this),
      this.minimumDelayBetweenRefreshes_);
  return _.debounce(throttledRefresh, this.minimumDelayBeforeRefresh_,
      {maxWait: this.minimumDelayBeforeRefresh_});
};

/**
 * @returns {Array} all locally cached table rows
 */
NetSimTable.prototype.readAll = function () {
  return this.arrayFromCache_();
};

/**
 * @param {!number} firstRowID
 * @returns {Array} all locally cached table rows having row ID >= firstRowID
 */
NetSimTable.prototype.readAllFromID = function (firstRowID) {
  return this.arrayFromCache_(function (key) {
    return key >= firstRowID;
  });
};

/**
 * @param {!number} id
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.read = function (id, callback) {
  this.api_.fetchRow(id, function (err, data) {
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
  this.api_.createRow(value, function (err, data) {
    if (err === null) {
      this.addRowToCache_(data);
    }
    callback(err, data);
  }.bind(this));
};

/**
 * @param {Object[]} values
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.multiCreate = function (values, callback) {
  this.api_.createRow(values, function (err, datas) {
    if (err === null) {
      datas.forEach(function (data) {
        this.addRowToCache_(data);
      }, this);
    }
    callback(err, datas);
  }.bind(this));
};

/**
 * @param {!number} id
 * @param {Object} value
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.update = function (id, value, callback) {
  this.api_.updateRow(id, value, function (err, success) {
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
  this.deleteMany([id], callback);
};

/**
 * Deletes multiple rows from the table.
 * @param {!number[]} ids
 * @param {!NodeStyleCallback} callback
 */
NetSimTable.prototype.deleteMany = function (ids, callback) {
  this.api_.deleteRows(ids, function (err, success) {
    if (err === null) {
      this.removeRowsFromCache_(ids);
    }
    callback(err, success);
  }.bind(this));
};

/**
 * Delete a row using a synchronous call. For use when navigating away from
 * the page; most of the time an asynchronous call is preferred.
 * @param {!number} id
 */
NetSimTable.prototype.synchronousDelete = function (id) {
  var async = false; // Force synchronous request
  this.api_.deleteRows([id], function (err) {
    if (err) {
      // Nothing we can really do with the error, as we're in the process of
      // navigating away. Throw so that high incidence rates will show up in
      // new relic.
      throw err;
    }
    this.removeRowsFromCache_([id]);
  }.bind(this), async);
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
    this.tableChange.notifyObservers();
  }

  this.lastRefreshTime_ = Date.now();
};

/**
 * Add and update rows in the local cache from the given set of new rows
 * (probably retrieved from the server).
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
    this.tableChange.notifyObservers();
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
  this.tableChange.notifyObservers();
};

/**
 * @param {!number[]} ids
 * @private
 */
NetSimTable.prototype.removeRowsFromCache_ = function (ids) {
  var cacheChanged = false;
  ids.forEach(function (id) {
    if (this.cache_[id] !== undefined) {
      delete this.cache_[id];
      cacheChanged = true;
    }
  }, this);

  if (cacheChanged) {
    this.tableChange.notifyObservers();
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

  // Manually apply IDs which should be present in row.
  newRow.id = id;
  newRow.uuid = oldRow.uuid;

  if (!_.isEqual(oldRow, newRow)) {
    this.cache_[id] = newRow;
    this.tableChange.notifyObservers();
  }
};

/**
 * @param {function(key, value)} [predicate] - A condition on returning the row.
 * @returns {Array}
 * @private
 */
NetSimTable.prototype.arrayFromCache_ = function (predicate) {
  predicate = predicate || function () { return true; };
  var result = [];
  for (var k in this.cache_) {
    if (this.cache_.hasOwnProperty(k) && predicate(k, this.cache_[k])) {
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
 * Change the maximum rate at which the refresh operation for this table
 * will _actually_ be executed, no matter how fast we receive invalidations.
 * @param {number} delayMs - Minimum number of milliseconds
 *        between invalidation-triggered requests to the server.
 */
NetSimTable.prototype.setMinimumDelayBetweenRefreshes = function (delayMs) {
  // To do this, we just replace the throttled refresh function with a new one.
  this.minimumDelayBetweenRefreshes_ = delayMs;
  this.refreshTable_ = this.makeThrottledRefresh_();
};

/**
 * Change the minimum time (in ms) to wait after an invalidation event before
 * attempting to trigger a refresh request.  This produces a window in which
 * clustered invalidations can be captured and coalesced together.
 * @param {number} delayMs - Minimum number of milliseconds between first
 *        invalidation and request to server.
 */
NetSimTable.prototype.setMinimumDelayBeforeRefresh = function (delayMs) {
  // To do this, we just replace the throttled refresh function with a new one.
  this.minimumDelayBeforeRefresh_ = delayMs;
  this.refreshTable_ = this.makeThrottledRefresh_();
};

/**
 * Change the Maximum additional random delay (in ms) to add before the refresh
 * request.  Helps spread out requests from different clients responding to the
 * same events.
 * @param {number} delayMs - Maximum number of milliseconds to add before
 *        refresh request fires.
 */
NetSimTable.prototype.setMaximumJitterDelay = function (delayMs) {
  // To do this, we just replace the throttled refresh function with a new one.
  this.maximumJitterDelay_ = delayMs;
};

/** Polls server for updates, if it's been long enough. */
NetSimTable.prototype.tick = function () {
  var now = Date.now();
  if (now - this.lastRefreshTime_ >= this.pollingInterval_) {
    this.lastRefreshTime_ = now;
    this.refreshTable_();
  }
};

/**
 * Called when the PubSub service fires an event that this table is subscribed to.
 * @private
 */
NetSimTable.prototype.onPubSubEvent_ = function () {
  this.refreshTable_();
};
