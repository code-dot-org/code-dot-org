'use strict';

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

// TODO(dave): remove once we can store ids for each app.
AppStorage.tempEncryptedAppId =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "SmwVmYVl1V5UCCw1Ec6Dtw==" : "DvTw9X3pDcyDyil44S6qbw==";

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} record.tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {Function} callback Function to call with the resulting record.
 */
AppStorage.createSharedRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateSharedRecord.bind(req, callback);
  var url = "/v3/apps/" + AppStorage.tempEncryptedAppId + "/shared-tables/" + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateSharedRecord = function(callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status < 200 || this.status > 300) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  var record = JSON.parse(this.responseText);
  callback(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to the callback.
 * @param {string} searchParams.tableName The name of the table to read from.
 * @param {string} searchParams.recordId Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {Function} callback Function to call with an array of record objects.
 */
AppStorage.readSharedRecords = function(searchParams, callback) {
  var tableName = searchParams.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadSharedRecords.bind(req, tableName,
      searchParams, callback);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + "/shared-tables/" + tableName;
  req.open('GET', url, true);
  req.send();
  
};

var handleReadSharedRecords = function(tableName, searchParams, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('readRecords failed with status ' + this.status);
    return;
  }
  var records = JSON.parse(this.responseText);
  records = records.filter(function(record) {
    for (var prop in searchParams) {
      if (record[prop] !== searchParams[prop]) {
        return false;
      }
    }
    return true;
  });
  callback(records);
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} record.tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properites to update
 *     on the record.
 * @param {Function} callback Function to call with the resulting record.
 */
AppStorage.updateSharedRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    console.log('updateRecords: missing required property "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    console.log('updateRecord: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleUpdateSharedRecord.bind(req, record, callback);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/shared-tables/' +
      tableName + '/' + recordId;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleUpdateSharedRecord = function(record, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status < 200 || this.status > 300) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  callback(record);
};

/**
 * Deletes a record from the specified table.
 * @param {string} record.tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {Function} callback Function to call on success.
 */
AppStorage.deleteSharedRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    console.log('deleteRecord: missing required property "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    console.log('deleteRecord: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleDeleteSharedRecord.bind(req, callback);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/shared-tables/' +
      tableName + '/' + recordId + '/delete';
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleDeleteSharedRecord = function(callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status < 200 || this.status > 300) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  callback();
};
