'use strict';

/**
 * Class which allows callers to listen to changes to data tables. This is currently
 * done by polling. Some modest rate-limiting is achieved by waiting for one second
 * after the previous response is processed for data from a given table, rather than
 * polling on a fixed interval and allowing a backlog to accumulate.
 *
 * The most logical incremental performance improvement is to use pusher to only
 * re-read from the table if any of its contents have changed. Down the road, we
 * may be able to use DynamoDB Streams / Lambda / SQS to deliver fine-grained
 * notifications to the client without ever needing to  re-read the entire table.
 *
 * @constructor
 */
var RecordListener = module.exports = function () {
  /**
   * Map from table name to table handler.
   * @private {Object.<string, TableHandler>}
   */
  this.tableHandlers_ = {};
};

/**
 * Number of ms to wait before polling each table for more data after finishing
 * processing the last batch of data for that table.
 * @type {number}
 */
var RECORD_INTERVAL = 3000; // 3 seconds

var EventType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};
RecordListener.EventType = EventType;

/**
 * Sets the listener which calls the callback when changes are made to the table.
 * Only one listener can be set per table. The callback is called once per changed record.
 * @param {string} tableName Name of the table to listen to.
 * @param {function(Object, EventType)} callback Callback to call with the record
 * and the type of event which happened to it. For create and update events,
 * the entire new record is included. For delete events, only the id is included.
 * @returns {boolean} true if adding the listener succeeded, or false if
 * a listener already existed for the specified table.
 */
RecordListener.prototype.setListener = function (tableName, callback) {
  if (this.tableHandlers_[tableName]) {
    return false;
  }

  this.tableHandlers_[tableName] = new TableHandler(tableName, callback);

  return true;
};

/**
 * Stop listening for changes to tables, and forget about all tables it was listening to.
 * It is necessary to call reset before any registered callbacks to become invalid,
 * e.g. when the user presses the resetButton.
 */
RecordListener.prototype.reset = function () {
  for (var tableName in this.tableHandlers_) {
    this.tableHandlers_[tableName].reset();
  }
  this.tableHandlers_ = {};
};

//////////////////////////////////////////////////
// TableHandler
//////////////////////////////////////////////////

/**
 * This class encapsulates all the logic and state required for listening to
 * changes to a single table.
 * @param {string} tableName
 * @param {function} callback
 * @constructor
 */
var TableHandler = function (tableName, callback) {
  /** @private {string} */
  this.tableName_ = tableName;

  /** @private {function} */
  this.callback_ = callback;

  /**
   * @typedef {Object.<number, string>} IdToJsonMap Map from record id
   * to a JSON-stringified copy of the corresponding record.
   */

  /**
   * IdToJsonMap representing the contents of the table.
   * We use this to efficiently test whether a record's contents has changed.
   * @private {IdToJsonMap}
   */
  this.idToJsonMap_ = {};

  /**
   * Timeout id of the pending call to window.setTimeout.
   * @private {number}
   */
  this.timeoutId_ = null;

  this.scheduleNextFetch_();
};

/** @private */
TableHandler.prototype.scheduleNextFetch_ = function () {
  this.timeoutId_ = window.setTimeout(function recordListener() {
    this.fetchRecords_();
  }.bind(this), RECORD_INTERVAL);
};

/** @private */
TableHandler.prototype.fetchRecords_ = function () {
  var req = new XMLHttpRequest();
  req.onreadystatechange = this.handleFetchRecords_.bind(this, req);
  // TODO(dave): extract url creation logic from here and AppStorage
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + this.tableName_;
  req.open('GET', url, true);
  req.send();
};

/**
 * @param {XMLHttpRequest} req
 * @private
 */
TableHandler.prototype.handleFetchRecords_ = function (req) {
  if (req.readyState !== XMLHttpRequest.DONE) {
    return;
  }

  if (!this.idToJsonMap_) {
    // The maps may have been reset while we were fetching the data.
    return;
  }

  // Performance notes: on a table with 2000 records on localhost it takes ~1.5 seconds
  // to fetch the data from dynamodb and 30ms to process it here. Processing time may be
  // longer on slower machines. One quick and dirty performance improvement is to cache
  // the responseText here and return if it has not changed (only 1ms). However, a better
  // performance improvement is to only poll when Pusher tells us to, which would render
  // the responseText check unnecessary.

  // Schedule the next data fetch before doing anything that could raise an exception,
  // so that an exception doesn't cause us to stop polling for new data.
  // Per above profiling notes, don't worry about the amount of time needed to process
  // the data below, since it is small compared to the amount of time taken to
  // retrieve the data.
  this.scheduleNextFetch_();

  if (req.status < 200 || req.status >= 300) {
    // Ignore errors. In the future we may want to add monitoring or notify
    // the user that this is happening.
    return;
  }

  var callback = this.callback_;
  var records = JSON.parse(req.responseText);

  // Update the IdToJsonMap before calling the callback. This is so that in the future
  // readRecords can share this cache of records with the guarantee that calls to
  // readRecords made during the callback will return a up-to-date view of the data.
  // This work is tracked by: https://www.pivotaltracker.com/story/show/114505801
  var oldIdToJsonMap = this.idToJsonMap_;
  var newIdToJsonMap = TableHandler.buildIdToJsonMap_(records);
  this.idToJsonMap_ = newIdToJsonMap;

  TableHandler.reportEvents_(records, oldIdToJsonMap, newIdToJsonMap, callback);
};

/**
 * Builds an IdToJsonMap based on the array of records.
 * @param {Array.<Object>} records Array of records.
 * @returns {IdToJsonMap}
 * @private
 */
TableHandler.buildIdToJsonMap_ = function (records) {
  var idToJsonMap = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    idToJsonMap[record.id] = JSON.stringify(record);
  }
  return idToJsonMap;
};

TableHandler.reportEvents_ = function (records, oldIdToJsonMap, newIdToJsonMap, callback) {
  // Look for 'create' and 'update' events.
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var oldJson = oldIdToJsonMap[record.id];
    var newJson = newIdToJsonMap[record.id];
    if (!oldJson) {
      callback(record, EventType.CREATE);
    } else if (oldJson !== newJson) {
      callback(record, EventType.UPDATE);
    }
  }

  // Look for 'delete' events.
  for (var oldId in oldIdToJsonMap) {
    if (!newIdToJsonMap[oldId]) {
      var deletedRecord = {id: parseInt(oldId, 10)};
      callback(deletedRecord, EventType.DELETE);
    }
  }
};

TableHandler.prototype.reset = function () {
  if (this.timeoutId_) {
    window.clearTimeout(this.timeoutId_);
  }

  // Make sure we don't call the callback after reset.
  this.timeoutId_ = null;
  this.callback_ = null;
  this.idToJsonMap_ = null;
};

RecordListener.__TestInterface = {
  TableHandler: TableHandler
};
