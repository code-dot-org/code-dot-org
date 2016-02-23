

var RecordListener = module.exports = function () {
  this.reset();
};

var RECORD_INTERVAL = 1000; // 1 second

/**
 *  @type {Object} Map from tableName to callback
 */
var recordListeners = {};

/**
 * @typedef {Object.<number, string>} IdToJsonMap Map from record id
 * to a JSON.stringified copy of the corresponding record.
 */

/**
 * @type {Object.<string, IdToJsonMap>} Map from tableName to a
 * IdToJsonMap of its previous contents.
 */
var idToJsonMaps = {};

var recordIntervalId = null;

var RecordEventType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

/**
 * Returns true if adding the listener succeeded, or false if
 * a listener already existed for the specified table.
 */

RecordListener.prototype.add = function (tableName, callback) {
  if (typeof recordListeners[tableName] === 'function') {
    return false;
  }

  recordListeners[tableName] = callback;
  idToJsonMaps[tableName] = {};

  if (recordIntervalId === null) {
    recordIntervalId = setInterval(function recordListener() {
      for (var tableName in recordListeners) {
        fetchNewRecords(tableName);
      }
    }, RECORD_INTERVAL);
  }
  return true;
};

function fetchNewRecords(tableName) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = reportRecords.bind(req, tableName);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('GET', url, true);
  req.send();
}

function reportRecords(tableName) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status < 200 || this.status >= 300) {
    // ignore errors
    return;
  }

  var callback = recordListeners[tableName];
  var records = JSON.parse(this.responseText);

  // Set up some maps to help with analysis
  var oldIdToJsonMap = idToJsonMaps[tableName];
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
  idToJsonMaps[tableName] = newIdToJsonMap;
}

function reportRecord(callback, id, record, oldJson, newJson) {
  if (newJson) {
    if (!oldJson) {
      callback(record, RecordEventType.CREATE);
    } else if (oldJson != newJson) {
      callback(record, RecordEventType.UPDATE);
    }
  } else {
    if (oldJson) {
      // Provide only the id of the deleted record.
      callback({id: id}, RecordEventType.DELETE);
    }
  }
}

RecordListener.prototype.reset = function () {
  if (recordIntervalId) {
    clearInterval(recordIntervalId);
    recordIntervalId = null;
  }
  recordListeners = {};
  idToJsonMaps = {};
};