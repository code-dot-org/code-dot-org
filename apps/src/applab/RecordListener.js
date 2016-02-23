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
   * @type {Object.<string, IdToJsonMap>}
   * @private
   */
  this.idToJsonMaps_ = {};

  /**
   * Interval ID of the current setInterval call, if any listeners have been added.
   * @type {number}
   * @private
   */
  this.recordIntervalId_ = null;
};

/**
 * @type {number} Number of ms to wait between polling for changes to tables.
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

  if (this.recordIntervalId_ === null) {
    this.recordIntervalId_ = setInterval(function recordListener() {
      for (var tableName in this.recordListeners_) {
        this.fetchNewRecords_(tableName);
      }
    }.bind(this), RECORD_INTERVAL);
  }
  return true;
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

  var callback = this.recordListeners_[tableName];
  var records = JSON.parse(req.responseText);

  // Set up some maps to help with analysis
  var oldIdToJsonMap = this.idToJsonMaps_[tableName];
  var newIdToJsonMap = {};
  var newIdToRecordMap = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    newIdToRecordMap[record.id] = record;
    newIdToJsonMap[record.id] = JSON.stringify(record);
  }

  // Iterate over all records (including old ones) so that deletes can be detected.
  var allRecordIds = Object.keys($.extend({}, oldIdToJsonMap, newIdToJsonMap));
  for (var j = 0; j < allRecordIds.length; j++) {
    var id = allRecordIds[j];
    reportRecord(callback, id, newIdToRecordMap[id], oldIdToJsonMap[id], newIdToJsonMap[id]);
  }

  // Update the map for this table to reflect the new records.
  this.idToJsonMaps_[tableName] = newIdToJsonMap;
};

/**
 * @param {function} callback
 * @param {number} id
 * @param {Object} record
 * @param {string} oldJson
 * @param {string} newJson
 */
function reportRecord(callback, id, record, oldJson, newJson) {
  if (newJson) {
    if (!oldJson) {
      callback(record, EventType.CREATE);
    } else if (oldJson != newJson) {
      callback(record, EventType.UPDATE);
    }
  } else {
    if (oldJson) {
      // Provide only the id of the deleted record.
      callback({id: id}, EventType.DELETE);
    }
  }
}

/**
 * Clears the interval timer and resets state.
 */
RecordListener.prototype.reset = function () {
  if (this.recordIntervalId_) {
    clearInterval(this.recordIntervalId_);
    this.recordIntervalId_ = null;
  }
  this.recordListeners_ = {};
  this.idToJsonMaps_ = {};
};