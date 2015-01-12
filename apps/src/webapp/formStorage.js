/**
 * CodeOrgApp: Webapp
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

/**
 * Namespace for form storage.
 */ 
var FormStorage = module.exports;


/**
 * Creates a new record in the specified table.
 * @param {string} record.tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {Function} callback Function to call with the resulting record.
 */
FormStorage.createRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    // TODO(dave): remove console.log for IE9 compatability, here and below.
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  FormStorage.fetchTableSecret(
      tableName, 
      putRecord.bind(this, record, callback));
};

var putRecord = function(record, callback, tableSecret) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handlePutRecord.bind(req, record, callback, tableSecret);
  var url = '//' + getFormDataHost() + '/v2/forms/CspTable/' + tableSecret +
      '/children/CspRecord';
  delete record.tableName;
  var postData = {record_data_s: JSON.stringify(record)};
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(postData));
};

var handlePutRecord = function(record, callback, tableSecret) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 201) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  
  // TODO(dave): merge tableSecret into record once XSS issues are resolved.
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
FormStorage.readRecords = function(searchParams, callback) {
  var tableName = searchParams.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  // TODO(dave): optimization: call fetchRecords here if table data is cached.
  FormStorage.fetchTableSecret(
      tableName, 
      fetchRecords.bind(this, tableName, searchParams, callback));
};

var fetchRecords = function(tableName, searchParams, callback, tableSecret) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleFetchRecords.bind(req, tableName,
      searchParams, callback);
  var url = '//' + getFormDataHost() + '/v2/forms/CspTable/' + tableSecret +
      '/children/CspRecord';
  req.open('GET', url, true);
  req.send();
};

var handleFetchRecords = function(tableName, searchParams, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('readRecords failed with status ' + this.status);
    return;
  }
  var forms = JSON.parse(this.responseText);
  var records = forms.map(function(form) {
    var record = JSON.parse(form.record_data_s);
    record.tableName = tableName;
    record.recordId = form.secret;
    return record;
  });
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

// Helper methods

/**
 * Retrieves the table secret for a given table name.
 * @param {string} tableName Table name.
 * @param {function(string)} callback Callback to call with the table secret.
 */
FormStorage.fetchTableSecret = function(tableName, callback) {
  var req = new XMLHttpRequest();
  req.onreadystatechange =
      handleFetchTableSecret.bind(req, tableName, callback);
  var url = '//' + getFormDataHost() + '/v2/forms/CspTable';
  req.open('GET', url, true);
  req.send();
};

var handleFetchTableSecret = function(tableName, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  var formData = JSON.parse(this.responseText);
  if (!(formData instanceof Array)) {
    console.log('formData is not an array');
    return;
  }

  var tableData = formData.filter(function(table) {
    return table.table_name_s === tableName;
  });
  var tableSecret = tableData[0] && tableData[0].secret;
  if (!tableSecret) {
    console.log('table not found: ' + tableName);
    console.log(tableData);
    return;
  }
  callback(tableSecret);
};

// TODO(dave): move this logic to dashboard.
var getFormDataHost = function() {
  // Forms api is already mapped to pegasus on all non-local deployments.
  // Caveat: local api access only works with temporary hacks in place
  // to set dashboard_user cookie and access-control-allow-origin header.
  return window.location.hostname.split('.')[0] === 'localhost' ?
      'localhost.code.org:9393' : window.location.hostname;
};

