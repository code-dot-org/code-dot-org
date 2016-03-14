'use strict';

/* global Applab */

var Firebase = require("firebase");

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

// HACKHACK: Need to make this configurable
var BASE_DB_URL = 'https://radiant-fire-5518.firebaseio.com';

var databaseCache = {};
function getDatabase(channelId) {
  var db = databaseCache[channelId];
  if (db == null) {
    db = new Firebase(BASE_DB_URL + '/v3/shared-tables/' + channelId);
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
  counters.child(counterName).transaction(function(currentValue) {
    return (currentValue || 0) + 1;
  }, function(err, committed, data) {
    if(err) {
      onError(err);
    }
    else if (committed) {
      // This should always be available if there was no error, since our
      // update functions always returns a value.
      onSuccess(data.val());
    } else {
      onError("Unexpected error");
    }
  });
}

var firebase = new Firebase('https://radiant-fire-5518.firebaseio.com/applab');

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
 * Calls onError with a message generated from commandName and status.
 * @param {function} onError Function to call with error message.
 * @param {string} commandName App Lab command name to include in error message.
 * @param {number} status Http status code.
 */
function onErrorStatus(onError, commandName, status) {
  if (onError) {
    onError('Error in ' + commandName + ': ' + getStatusDescription(status));
  }
}

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function(Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.getKeyValue = function(key, onSuccess, onError) {
  var entry = getKeyValues(Applab.channelId).child(key);
  entry.once("value", function(object) {
    onSuccess(object.val());
  }, onError);
};

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.setKeyValue = function(key, value, onSuccess, onError) {
  var entries = getKeyValues(Applab.channelId);
  entries.update(createEntry(key, value), function(error) {
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
 * @param {function(Object)} onSuccess Function to call with the new record.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.createRecord = function(tableName, record, onSuccess, onError) {
  // Assign a unique id for the new record.
  var idCounter = tableName + '_id';
  getCounter(Applab.channelId, idCounter, function(counter) {
    record.id = counter;
    console.log(counter);
    var recordRef = getTable(Applab.channelId, tableName).child(counter);
    recordRef.update(record, function(error) {
      if (!error) {
	onSuccess(record);
      } else {
	onError(error);
      }
    });
  }, onError);
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
  var table = getTable(Applab.channelId, tableName);
  table.once("value", function(recordsRef) {
    var records = recordsRef.val() || [];
    console.log(records);
    var recordArray = Object.keys(records).map(function(id) {
      return records[id];
    });
    onSuccess(recordArray);
  }, onError);
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properties to update
 *     on the record.
 * @param {function(Object, boolean)} onComplete Function to call on success,
 *     or if the record id is not found.
 * @param {function(string)} onError Function to call with an error message
 *     in case of other types of failures.
 */
AppStorage.updateRecord = function(tableName, record, onComplete, onError) {
  var recordRef = getTable(Applab.channelId, tableName).child(record.id);
  recordRef.set(record, function(error) {
    if (!error) {
      // TODO: We need to handle the 404 case, probably by attempting a read.
      onComplete(record, true);
    } else {
      onError(error);
    }
  });
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function(boolean)} onComplete Function to call on success, or if the
 *     record id is not found.
 * @param {function(string)} onError Function to call with an error message
 *     in case of other types of failures.
 */
AppStorage.deleteRecord = function(tableName, record, onComplete, onError) {
  var table = getTable(Applab.channelId, tableName);
  table.child(record.id).remove(function(error) {
    if (error) {
      onError(error);
    } else {
      onComplete(true);  // TODO: Return false if record is not present.
    }
  });
};

/**
 * Listens to tableName for any changes to the data it contains, and calls
 * onRecord with the record and eventType as follows:
 * - for 'create' events, returns the new record
 * - for 'update' events, returns the updated record
 * - for 'delete' events, returns a record containing the id of the deleted record
 * @param {string} tableName Table to listen to.
 * @param {function(Object, RecordListener.EventType)} onRecord Callback to call when
 * a change occurs with the record object (described above) and event type.
 * @param {function(string)} onError Callback to call with an error to show to the user.
 */
AppStorage.onRecordEvent = function(tableName, onRecord, onError) {
  if (!onError || typeof onError !== 'function') {
    throw new Error('onError is a required parameter to AppStorage.onRecordEvent');
  }
  if (!tableName) {
    onError('Error listening for record events: missing required parameter "tableName"');
    return;
  }

  var table = getTable(Applab.channelId, tableName);
  // CONSIDER: Do we need to make sure a client doesn't hear about updates that it triggered?

  table.on('child_added', function(childSnapshot, prevChildKey) {
    onRecord(childSnapshot, 'create');
  });

  table.on('value', function(dataSnapshot) {
    onRecord(dataSnapshot, 'update');
  });

  table.on('child_removed', function(oldChildSnapshot) {
    onRecord({'id': oldChildSnapshot.id}, 'delete');
  });
};

AppStorage.resetRecordListener = function () {
  getDatabase().off();
};

/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateTable = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var tables = getDatabase(Applab.channelId).child('tables');

  // TODO: Respect overwrite
  tables.set(jsonData, function(error) {
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
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateKeyValue = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  // TODO: Test this; Implement overwrite.
  var tables = getDatabase(Applab.channelId).child('tables');
  var keyValues = getKeyValues(Applab.channelId);
  tables.set(jsonData, function(error) {
    if (!error) {
      onSuccess();
    } else {
      onError(error);
    }
  });
};
