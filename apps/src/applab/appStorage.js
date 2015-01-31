'use strict';

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

// TODO(dave): remove once we can store ids for each app. (userid:1, appid:1337).
AppStorage.tempEncryptedAppId =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "SmwVmYVl1V5UCCw1Ec6Dtw==" : "DvTw9X3pDcyDyil44S6qbw==";

/**
 * The visibility types supported by the app storage system.
 * @enum {string}
 */
var Visibility = {
  USER: "user",   // accessible only to the user who wrote the data.
  SHARED: "shared"  // accessible to all users of the app.
};
AppStorage.Visibility = Visibility;

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Visibility} visibility The visibility of the data.
 * @param {function(Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.readRemoteValue = function(key, visibility, onSuccess, onError) {
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  checkVisibility(visibility);
  req.onreadystatechange = handleReadRemoteValue.bind(req, onSuccess, onError);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-properties/' + key;
  req.open('GET', url, true);
  req.send();
};

var handleReadRemoteValue = function(onSuccess, onError) {
  if (this.readyState !== 4) {
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
AppStorage.writeRemoteValue = function(key, value, visibility, onSuccess, onError) {
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleWriteRemoteValue.bind(req, onSuccess, onError);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-properties/' + key;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(value));
};

var handleWriteRemoteValue = function(onSuccess, onError) {
  if (this.readyState !== 4) {
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
 * @param {string} record.tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {function(Object)} onSuccess Function to call with the new record.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.createRecord = function(record, visibility, onSuccess, onError) {
  var tableName = record.tableName;
  if (!tableName) {
    onError('error creating record: missing required property "tableName"');
    return;
  }
  if (record.id) {
    onError('error creating record: record must not have an "id" property');
    return;
  }
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateRecord.bind(req, onSuccess, onError);
  var url = "/v3/apps/" + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-tables/' + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateRecord = function(onSuccess, onError) {
  if (this.readyState !== 4) {
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
 * @param {string} searchParams.tableName The name of the table to read from.
 * @param {string} searchParams.recordId Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {function(Array)} onSuccess Function to call with an array of record
       objects.
 * @param {function(string)} onError Function to call with an error message
 *     in case of failure.
 */
AppStorage.readRecords = function(searchParams, visibility, onSuccess, onError) {
  var tableName = searchParams.tableName;
  if (!tableName) {
    onError('error reading records: missing required property "tableName"');
    return;
  }
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadRecords.bind(req, tableName,
      searchParams, onSuccess, onError);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-tables/' + tableName;
  req.open('GET', url, true);
  req.send();
  
};

var handleReadRecords = function(tableName, searchParams, onSuccess, onError) {
  if (this.readyState !== 4) {
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
 * @param {string} record.tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properites to update
 *     on the record.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.updateRecord = function(record, visibility, onSuccess, onError) {
  var tableName = record.tableName;
  if (!tableName) {
    onError('error updating record: missing required property "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error updating record: missing required property "id"');
    return;
  }
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleUpdateRecord.bind(req, record, onSuccess, onError);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-tables/' + tableName + '/' + recordId;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleUpdateRecord = function(record, onSuccess, onError) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status === 404) {
    onError('error updating record: could not find record id ' + record.id +
            ' in table ' + record.tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error updating record: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

/**
 * Deletes a record from the specified table.
 * @param {string} record.tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.deleteRecord = function(record, visibility, onSuccess, onError) {
  var tableName = record.tableName;
  if (!tableName) {
    onError('error deleting record: missing required property "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error deleting record: missing required property "id"');
    return;
  }
  checkVisibility(visibility);
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleDeleteRecord.bind(req, record, onSuccess, onError);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + '/' + visibility +
      '-tables/' + tableName + '/' + recordId + '/delete';
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleDeleteRecord = function(record, onSuccess, onError) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status === 404) {
    onError('error deleting record: could not find record id ' + record.id +
        ' in table ' + record.tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error deleting record: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

var checkVisibility = function (visibility) {
  if (visibility !== Visibility.USER && visibility !== Visibility.SHARED) {
    throw new Error("visibility must be 'user' or 'shared'.");
  }
};
