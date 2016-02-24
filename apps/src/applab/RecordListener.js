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
   *  Map from tableName to callback.
   *  @type {Object.<string, function>}
   *  @private
   */
  this.recordListeners_ = {};

  /**
   * Map from tableName to an IdToJsonMap representing the contents of the table.
   * We use this to efficiently test whether a record's contents has changed.
   * @type {Object.<string, IdToJsonMap>}
   * @private
   */
  this.idToJsonMaps_ = {};

  /**
   * Map from table name to the pending timeout id.
   * @type {{Object.<string, number>}}
   * @private
   */
  this.recordTimeouts_ = {};
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
  if (typeof this.recordListeners_[tableName] === 'function') {
    return false;
  }

  this.recordListeners_[tableName] = callback;
  this.idToJsonMaps_[tableName] = {};

  this.scheduleNextFetch_(tableName);

  return true;
};

/**
 * @param {string} tableName
 * @private
 */
RecordListener.prototype.scheduleNextFetch_ = function (tableName) {
  this.recordTimeouts_[tableName] = setTimeout(function recordListener() {
    this.fetchNewRecords_(tableName);
  }.bind(this), RECORD_INTERVAL);
};

/**
 * @param {string} tableName
 * @private
 */
RecordListener.prototype.fetchNewRecords_ = function (tableName) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = this.reportRecords_.bind(this, req, tableName);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('GET', url, true);
  req.send();
};

/**
 * @param {XMLHttpRequest} req
 * @param {string} tableName
 * @private
 */
RecordListener.prototype.reportRecords_ = function (req, tableName) {
  var done = XMLHttpRequest.DONE || 4;
  if (req.readyState !== done) {
    return;
  }

  if (req.status < 200 || req.status >= 300) {
    // ignore errors
    return;
  }

  if (!this.idToJsonMaps_[tableName]) {
    // The maps may have been reset while we were fetching the data.
    return;
  }

  // Performance notes: on a table with 2000 records on localhost it takes ~1.5 seconds
  // to fetch the data from dynamodb and 30ms to process it here. Processing time may be
  // longer on slower machines. One quick and dirty performance improvement is to cache
  // the responseText here and return if it has not changed (only 1ms). However, a better
  // performance improvement is to only poll when Pusher tells us to, which would render
  // the responseText check unnecessary.

  var callback = this.recordListeners_[tableName];
  var records = JSON.parse(req.responseText);
  var oldIdToJsonMap = this.idToJsonMaps_[tableName];

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
  this.idToJsonMaps_[tableName] = newIdToJsonMap;

  this.scheduleNextFetch_(tableName);
};

/**
 * Clears the timeouts and resets internal state.
 */
RecordListener.prototype.reset = function () {
  for (var tableName in this.recordTimeouts_) {
    var timeoutId = this.recordTimeouts_[tableName];
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  this.recordTimeouts_ = {};
  this.recordListeners_ = {};
  this.idToJsonMaps_ = {};
};
