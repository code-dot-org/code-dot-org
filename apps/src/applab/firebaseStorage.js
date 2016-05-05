'use strict';

/* global Applab */

var Firebase = require("firebase");

/**
 * Namespace for app storage.
 */
var FirebaseStorage = module.exports;

var databaseCache = {};
function getDatabase(channelId) {
  var db = databaseCache[channelId];
  if (db == null) {
    if (!Applab.firebaseName) {
      throw new Error("Error connecting to Firebase: Firebase name not specified");
    }
    if (!Applab.firebaseAuthToken) {
      throw new Error("Error connecting to Firebase: Firebase auth token not specified");
    }
    var base_url = 'https://' + Applab.firebaseName + '.firebaseio.com';
    db = new Firebase(base_url + '/v3/shared-tables/' + channelId);
    if (Applab.firebaseAuthToken) {
      db.auth(Applab.firebaseAuthToken);
    }
    databaseCache[channelId] = db;
  }
  console.log(db);
  return db;
}

function getKeyValues(channelId) {
  var kv = getDatabase(channelId).child('keys');
  console.log(kv);
  return kv;
}

function getTable(channelId, tableName) {
  return getDatabase(channelId).child('tables').child(tableName);
}

/**
 * Increments the given counter, specified by channelId and counterName.
 * Calls onSuccess with the counter value, or onError with an error string
 * if it was not possible to determine the value of the counter.
 */
function getCounter(channelId, counterName, onSuccess, onError) {
  var counters = getDatabase(channelId).child('counters');
  counters.child(counterName).transaction(function (currentValue) {
    return (currentValue || 0) + 1;
  }, function (err, committed, data) {
    if (err) {
      onError(err);
    } else if (committed) {
      // This should always be available if there was no error, since our
      // update functions always returns a value.
      onSuccess(data.val());
    } else {
      onError("Unexpected error");
    }
  });
}

/**
 * @param {number} status Http status code.
 * @returns {string} An error message corresponding to the http status code.
 */
function getStatusDescription(status) {
  if (status === 429) {
    return 'Rate limit exceeded.';
  } else if (status === 413) {
    return 'Storage item size exceeded';
  } else {
    return 'Unexpected http status ' + status;
  }
}

/**
 * Calls onError with a message generated from commandName and status and the status code
 * @param {function (string, number)} onError Function to call with error message and http status.
 * @param {string} commandName App Lab command name to include in error message.
 * @param {number} status Http status code.
 * @param {string?} detailedErrorMessage Optional detailed error message.
 */
function onErrorStatus(onError, commandName, status, detailedErrorMessage) {
  if (onError) {
    var errorMessage;
    // If a detailed error message is provided and its not too long, display that to
    // the user. (The long message heuristic is intended to prevent us from displaying
    // e.g. stack traces from server errors.)
    if (detailedErrorMessage && detailedErrorMessage.length < 256) {
      errorMessage = detailedErrorMessage;
    } else {
      // Otherwise display a generic description based on the HTTP status.
      errorMessage = getStatusDescription(status);
    }
    onError('Error in ' + commandName + ': http status ' + status + ' - ' + errorMessage, status);
  }
  // HTTP 429 - Too many requests. We hit this when our data APis are throttled
  if (status === 429) {
    Applab.showRateLimitAlert();
  }
}

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function (Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function (string, number)} onError Function to call on error with error msg and http status.
 */
FirebaseStorage.getKeyValue = function (key, onSuccess, onError) {
  var entry = getKeyValues(Applab.channelId).child(key);
  entry.once("value", function (object) {
    onSuccess(object.val());
  }, onError);
};

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function (string, number)} onError Function to call on error with error msg and
 *    http status.
 */
FirebaseStorage.setKeyValue = function (key, value, onSuccess, onError) {
  var entries = getKeyValues(Applab.channelId);
  entries.update(createEntry(key, value), function (error) {
    if (error) {
      onError();
    } else {
      onSuccess();
    }
  });
};

/**
 * Creates a hash with given key and value.
 */
function createEntry(key, value) {
  var result = {};
  result[key] = value;
  return result;
}

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {function (Object)} onSuccess Function to call with the new record.
 * @param {function (string, number)} onError Function to call with an error message
 *    and http status in case of failure.
 */
FirebaseStorage.createRecord = function (tableName, record, onSuccess, onError) {
  // Assign a unique id for the new record.
  var idCounter = tableName + '_id';
  getCounter(Applab.channelId, idCounter, function (counter) {
    record.id = counter;
    console.log(counter);

    var tableRef = getTable(Applab.channelId, tableName);
    tableRef.child('row_count').once('value', function (rowCountSnapshot) {
      var data = {};
      data[counter] = JSON.stringify(record);
      data.target_record_id = String(counter);
      var newRowCount = (rowCountSnapshot.val() || 0) + 1;
      data.row_count = newRowCount;

      tableRef.update(data, function (error) {
        if (!error) {
          onSuccess(record);
        } else {
          onError(error);
        }
      });
    });
  }, onError);
};

/**
 * Returns true if record matches the given search parameters, which are a map
 * from key name to expected value.
 */
function matchesSearch(record, searchParams) {
  var matches = true;
  Object.keys(searchParams || {}).forEach(function (key) {
    matches = matches && (record[key] == searchParams[key]);
  });
  return matches;
}

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to onSuccess.
 * @param {string} tableName The name of the table to read from.
 * @param {string} searchParams.id Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {function (Array)} onSuccess Function to call with an array of record
       objects.
 * @param {function (string, number)} onError Function to call with an error message
 *     and http status in case of failure.
 */
FirebaseStorage.readRecords = function (tableName, searchParams, onSuccess, onError) {
  var table = getTable(Applab.channelId, tableName);
  var searchKeys = searchParams ? Object.keys(searchParams) : [];

  if (searchKeys.length == 1) {
     // If there is only a single search parameter, use the firebase equalTo
     // query to return only the records matching that parameter from the server.
     var key = searchKeys[0];
     table.orderByChild(key).equalTo(searchParams[key]).once('value', function (recordsRef) {
       var recordMap = recordsRef.val() || {};
       var records = Object.keys(recordMap).map(function (id) { return recordMap[id]; });
       onSuccess(records);
     }, onError);
   } else {
    // If there is more than one search parameters, Get all records in the table
    // and filter them on the client.
    table.once('value', function (recordsRef) {
      var recordMap = recordsRef.val() || {};
      var records = [];
      // Collect all of the records matching the searchParams.
      Object.keys(recordMap).forEach(function (id) {
        var record = recordMap[id];
        if (matchesSearch(record, searchParams)) {
          records.push(record);
        }
      });
      onSuccess(records);
    }, onError);
  }
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properties to update
 *     on the record.
 * @param {function (Object, boolean)} onComplete Function to call on success,
 *     or if the record id is not found.
 * @param {function (string, number)} onError Function to call with an error message
 *     and http status in case of other types of failures.
 */
FirebaseStorage.updateRecord = function (tableName, record, onComplete, onError) {
  var tableRef = getTable(Applab.channelId, tableName);
  tableRef.child('row_count').once('value', function (rowCountSnapshot) {

    var data = {};
    data[record.id] = JSON.stringify(record);
    data.target_record_id = String(record.id);

    // TODO: We need to handle the 404 case, probably by attempting a read.
    data.row_count = rowCountSnapshot.val();

    tableRef.update(data, function (error) {
      if (!error) {
        onComplete(record, true);
      } else {
        onError(error);
      }
    });
  });
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function (boolean)} onComplete Function to call on success, or if the
 *     record id is not found.
 * @param {function (string, number)} onError Function to call with an error message
 *     and http status in case of other types of failures.
 */
FirebaseStorage.deleteRecord = function (tableName, record, onComplete, onError) {
  var tableRef = getTable(Applab.channelId, tableName);

  tableRef.child('row_count').once('value', function (rowCountSnapshot) {
    var data = {};
    data[record.id] = null;
    data.target_record_id = String(record.id);
    data.row_count = rowCountSnapshot.val() - 1;

    tableRef.update(data, function (error) {
      if (error) {
        onError(error);
      } else {
        onComplete(true);  // TODO: Return false if record is not present.
      }
    });
  });
};

/**
 * Listens to tableName for any changes to the data it contains, and calls
 * onRecord with the record and eventType as follows:
 * - for 'create' events, returns the new record
 * - for 'update' events, returns the updated record
 * - for 'delete' events, returns a record containing the id of the deleted record
 * @param {string} tableName Table to listen to.
 * @param {function (Object, RecordListener.EventType)} onRecord Callback to call when
 * a change occurs with the record object (described above) and event type.
 * @param {function (string, number)} onError Callback to call with an error to show to the user and
 *   http status code.
 */
FirebaseStorage.onRecordEvent = function (tableName, onRecord, onError) {
  if (!onError || typeof onError !== 'function') {
    throw new Error('onError is a required parameter to FirebaseStorage.onRecordEvent');
  }
  if (!tableName) {
    onError('Error listening for record events: missing required parameter "tableName"', 400);
    return;
  }

  var table = getTable(Applab.channelId, tableName);
  // CONSIDER: Do we need to make sure a client doesn't hear about updates that it triggered?

  table.on('child_added', function (childSnapshot, prevChildKey) {
    onRecord(childSnapshot.val(), 'create');
  });

  table.on('value', function (dataSnapshot) {
    onRecord(dataSnapshot.val(), 'update');
  });

  table.on('child_removed', function (oldChildSnapshot) {
    onRecord(oldChildSnapshot.val(), 'delete');
  });
};

FirebaseStorage.resetRecordListener = function () {
  getDatabase(Applab.channelId).off();
};

/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function (string, number)} onError Function to call with an error message
 *    and http status in case of failure.
 */
FirebaseStorage.populateTable = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var tables = getDatabase(Applab.channelId).child('tables');

  // TODO: Respect overwrite
  tables.set(jsonData, function (error) {
    if (error) {
      onError(error);
    } else {
      onSuccess();
    }
  });
};

/**
 * Populates the key/value store with initial data
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "click_count": 5,
 *     "button_color": "blue"
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function (string, number)} onError Function to call with an error message
 *    and http status in case of failure.
 */
FirebaseStorage.populateKeyValue = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  // TODO: Test this; Implement overwrite.
  var tables = getDatabase(Applab.channelId).child('tables');
  var keyValues = getKeyValues(Applab.channelId);
  tables.set(jsonData, function (error) {
    if (!error) {
      onSuccess();
    } else {
      onError(error);
    }
  });
};
