'use strict';

/* global dashboard */

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

// TODO(dave): remove once all applab data levels are associated with
// a project.
AppStorage.tempChannelId =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "SmwVmYVl1V5UCCw1Ec6Dtw==" : "DvTw9X3pDcyDyil44S6qbw==";

AppStorage.getChannelId = function() {
  // TODO(dave): pull channel id directly from appOptions once available.
  var id = dashboard && dashboard.currentApp && dashboard.currentApp.id;
  return id || AppStorage.tempChannelId;
};

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function(Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.getKeyValue = function(key, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleGetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + AppStorage.getChannelId() + '/' + key;
  req.open('GET', url, true);
  req.send();
};

var handleGetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onSuccess(undefined);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading value: unexpected http status ' + this.status);
    return;
  }
  var value = JSON.parse(this.responseText);
  onSuccess(value);
};

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.setKeyValue = function(key, value, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleSetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + AppStorage.getChannelId() + '/' + key;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(value));
};

var handleSetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error writing value: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {function(Object)} onSuccess Function to call with the new record.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.createRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error creating record: missing required parameter "tableName"');
    return;
  }
  if (record.id) {
    onError('error creating record: record must not have an "id" property');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateRecord.bind(req, onSuccess, onError);
  var url = '/v3/shared-tables/' + AppStorage.getChannelId() + '/' + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateRecord = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error creating record: unexpected http status ' + this.status);
    return;
  }
  var record = JSON.parse(this.responseText);
  onSuccess(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to onSuccess.
 * @param {string} tableName The name of the table to read from.
 * @param {string} searchParams.id Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {function(Array)} onSuccess Function to call with an array of record
       objects.
 * @param {function(string)} onError Function to call with an error message
 *     in case of failure.
 */
AppStorage.readRecords = function(tableName, searchParams, onSuccess, onError) {
  if (!tableName) {
    onError('error reading records: missing required parameter "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadRecords.bind(req,
      searchParams, onSuccess, onError);
  var url = '/v3/shared-tables/' + AppStorage.getChannelId() + '/' + tableName;
  req.open('GET', url, true);
  req.send();
  
};

var handleReadRecords = function(searchParams, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading records: unexpected http status ' + this.status);
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
  onSuccess(records);
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properites to update
 *     on the record.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.updateRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error updating record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error updating record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleUpdateRecord.bind(req, tableName, record, onSuccess, onError);
  var url = '/v3/shared-tables/' + AppStorage.getChannelId() + '/' +
      tableName + '/' + recordId;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleUpdateRecord = function(tableName, record, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onError('error updating record: could not find record id ' + record.id +
            ' in table ' + tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error updating record: unexpected http status ' + this.status);
    return;
  }
  onSuccess(record);
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.deleteRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error deleting record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error deleting record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleDeleteRecord.bind(req, tableName, record, onSuccess, onError);
  var url = '/v3/shared-tables/' + AppStorage.getChannelId() + '/' +
      tableName + '/' + recordId + '/delete';
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleDeleteRecord = function(tableName, record, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onError('error deleting record: could not find record id ' + record.id +
        ' in table ' + tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error deleting record: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};
