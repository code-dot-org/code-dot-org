'use strict';

/**
 * @typedef {Object.<number, string>} IdToJsonMap Map from record id
 * to a JSON-stringified copy of the corresponding record.
 */

/**
 * Class which allows callers to listen to changes to data tables.
 * @constructor
 */
var RecordListener = module.exports = function () {
  /**
   * Map from table name to table handler.
   * @type {Object.<string, TableHandler>}
   * @private
   */
  this.tableHandlers_ = {};
};

/**
 *
 * @param {string} tableName
 * @param {function} callback
 * @constructor
 */
var TableHandler = function (tableName, callback) {
  /**
   * @type {{string}}
   * @private
   */
  this.tableName_ = tableName;

  /**
   *  @type {function}
   *  @private
   */
  this.callback_ = callback;

  /**
   * IdToJsonMap representing the contents of the table.
   * We use this to efficiently test whether a record's contents has changed.
   * @type {IdToJsonMap}
   * @private
   */
  this.idToJsonMap_ = {};

  /**
   * Timeout id of the pending call to window.setTimeout.
   * @type {number}
   * @private
   */
  this.timeoutId_ = null;

  this.scheduleNextFetch_();
};

/**
 * Number of ms to wait before polling each table for more data after finishing
 * processing the last batch of data for that table.
 * @type {number}
 */
var RECORD_INTERVAL = 1000; // 1 second

var EventType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};
RecordListener.EventType = EventType;

/**
 * Adds a listener which calls the callback when changes are made to the table.
 * The callback is called once per changed record.
 * @param {string} tableName Name of the table to listen to.
 * @param {function(Object, EventType)} callback Callback to call with the record
 * and the type of event which happened to it. For create and update events,
 * the entire new record is included. For delete events, only the id is included.
 * @returns {boolean} true if adding the listener succeeded, or false if
 * a listener already existed for the specified table.
 */
RecordListener.prototype.addListener = function (tableName, callback) {
  if (this.tableHandlers_[tableName]) {
    return false;
  }

  this.tableHandlers_[tableName] = new TableHandler(tableName, callback);

  return true;
};

/**
 * @private
 */
TableHandler.prototype.scheduleNextFetch_ = function () {
  this.timeoutId_ = setTimeout(function recordListener() {
    this.fetchNewRecords_();
  }.bind(this), RECORD_INTERVAL);
};

/**
 * @private
 */
TableHandler.prototype.fetchNewRecords_ = function () {
  var req = new XMLHttpRequest();
  req.onreadystatechange = this.reportRecords_.bind(this, req);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + this.tableName_;
  req.open('GET', url, true);
  req.send();
};

/**
 * @param {XMLHttpRequest} req
 * @param {string} tableName
 * @private
 */
TableHandler.prototype.reportRecords_ = function (req) {
  var done = XMLHttpRequest.DONE || 4;
  if (req.readyState !== done) {
    return;
  }

  if (req.status < 200 || req.status >= 300) {
    // ignore errors
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

  var callback = this.callback_;
  var records = JSON.parse(req.responseText);
  var oldIdToJsonMap = this.idToJsonMap_;

  // Look for 'create' and 'update' events, and build the new map of this table.
  var newIdToJsonMap = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var oldJson = oldIdToJsonMap[record.id];
    var newJson = JSON.stringify(record);
    if (!oldJson) {
      callback(record, EventType.CREATE);
    } else if (oldJson !== newJson) {
      callback(record, EventType.UPDATE);
    }
    newIdToJsonMap[record.id] = newJson;
  }

  // Look for 'delete' events.
  for (var oldId in oldIdToJsonMap) {
    if (!newIdToJsonMap[oldId]) {
      var deletedRecord = {id: oldId};
      callback(deletedRecord, EventType.DELETE);
    }
  }

  // Update our map of this table.
  this.idToJsonMap_ = newIdToJsonMap;

  this.scheduleNextFetch_();
};

/**
 * Clears the timeouts and resets internal state.
 */
RecordListener.prototype.reset = function () {
  for (var tableName in this.tableHandlers_) {
    this.tableHandlers_[tableName].reset();
  }
  this.tableHandlers_ = {};
};

TableHandler.prototype.reset = function() {
  if (this.timeoutId_) {
    clearTimeout(this.timeoutId_);
  }

  // Make sure we don't call the callback after reset.
  this.timeoutId_ = null;
  this.callback_ = null;
  this.idToJsonMap_ = null;
};
