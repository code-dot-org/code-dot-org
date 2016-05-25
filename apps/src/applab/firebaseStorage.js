'use strict';

/* global Applab */

var Firebase = require("firebase");

/**
 * Namespace for app storage.
 */
var FirebaseStorage = module.exports;

var databaseCache = {};
var firebaseUserId;
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
    db = new Firebase(base_url + '/v3/channels/' + channelId);
    if (Applab.firebaseAuthToken) {
      db.authWithCustomToken(Applab.firebaseAuthToken, function (err, user) {
        if (err) {
          throw new Error('error authenticating to Firebase: ' + err);
        } else {
          firebaseUserId = user.uid;
        }
      });
    }
    databaseCache[channelId] = db;
  }
  //console.log(db);
  return db;
}

function getKeyValues(channelId) {
  var kv = getDatabase(channelId).child('keys');
  //console.log(kv);
  return kv;
}

function getTable(channelId, tableName) {
  return getDatabase(channelId).child('data').child('tables').child(tableName);
}

/**
 * @param {string} tableName
 * @returns {Promise<number>} next record id to assign.
 */
function getNextIdPromise(tableName) {
  var lastIdRef = getDatabase(Applab.channelId).child('counters').child('tables')
      .child(tableName).child('last_id');
  return lastIdRef.transaction(function (currentValue) {
    return (currentValue || 0) + 1;
  }).then(function (transactionData) {
    return transactionData.snapshot.val();
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
 * Map representing the rate limit over each time interval.
 *
 * @type {Object.<string, number>} Map from rate limit interval in seconds
 *     to the maximum number of operations allowed during that interval.
 */
var RATE_LIMITS = {
  15: 30,
  60: 60
};

/**
 * List of rate limit intervals, longest-first so that the first limit we hit
 * will tell us the maximum amount of time the client must wait before retrying.
 *
 * @type {Array.<string>} Array of rate limit intervals in seconds, in descending
 * numerical order.
 */
var RATE_LIMIT_INTERVALS = Object.keys(RATE_LIMITS).sort(function (a, b) {
  return Number(b) - Number(a);
});

const ROW_COUNT_BUCKETS = 10;

const TOKEN_BATCH_SIZE = 10;

var rateLimitTokenMap = {
  15: [],
  60: []
};

var tokenFetchPromiseMap = {
  15: null,
  60: null
};

/**
 * Increments each rate limit counter, calling the callback with map from
 * rate limit intervals to the corresponding token to use.
 */
function getRateLimitTokenMapPromise() {
  return Promise.all([
    getRateLimitTokenPromise(15),
    getRateLimitTokenPromise(60)
  ]).then(function (results) {
    return {
      15: results[0],
      60: results[1]
    };
  });
}

/**
 *
 * @param {number} interval
 */
function getRateLimitTokenPromise(interval) {
  var tokens = rateLimitTokenMap[interval];
  if (tokens.length > 0) {
    return tokens.shift();
  }
  return getTokenFetchPromise(interval).then(function () {
    if (tokens.length > 0) {
      return tokens.shift();
    } else {
      // More than TOKEN_BATCH_SIZE requests were waiting for the token fetch
      // to complete, so there weren't enough tokens to go around.
      throw new Error('No tokens available after interval ' + interval + ' token fetch.');
    }
  });
}

/**
 *
 * @param interval
 * @returns {*}
 */
function getTokenFetchPromise(interval) {
  if (!tokenFetchPromiseMap[interval]) {
    // Atomically increment the rate limit counter to obtain a rate limit token.
    tokenFetchPromiseMap[interval] = incrementOpCountPromise(interval).catch(function (error) {
      // The increment failed because last_op_count reached its maximum. Try to reset the count.
      return resetRateLimitPromise(interval).then(function () {
        // The rate limit was reset. Try one more time to increment it.
        return incrementOpCountPromise(interval).catch(function (error) {
          throw new Error('Rate limit exceeded immediately after it was reset: ' + error);
        });
      });
    }).then(function (newOpCount) {
      tokenFetchPromiseMap[interval] = null;
      for (var i = Number(newOpCount) - TOKEN_BATCH_SIZE + 1; i <= newOpCount; i++) {
        rateLimitTokenMap[interval].push(i);
      }
    }, function (error) {
      // The rate limit was exceeded and the reset failed. Do not reuse this promise.
      tokenFetchPromiseMap[interval] = null;
      return Promise.reject(error);
    });
  }
  return tokenFetchPromiseMap[interval];
}

var lastReset = {};

/**
 *
 * @param {number} interval
 * @param lastResetTimeMs
 * @param onSuccess
 * @param onError
 */
function resetRateLimitPromise(interval) {
  var lastResetTimePromise = getLastResetTimePromise(interval);
  var currentTimePromise = getCurrentTimePromise();
  return Promise.all([lastResetTimePromise, currentTimePromise]).then(function (results) {
    var lastResetTimeMs = results[0];
    var currentTimeMs = results[1];
    var nextResetTimeMs = lastResetTimeMs + interval * 1000;

    if (currentTimeMs < nextResetTimeMs) {
      // It is too soon to reset this rate limit.
      var timeRemaining = Math.ceil((nextResetTimeMs - currentTimeMs) / 1000);
      return Promise.reject('rate limit exceeded. please wait ' + timeRemaining + ' seconds before retrying.');
    }

    if (lastResetTimeMs === lastReset.time) {
      // Another request from this client has already been made to reset this timestamp.
      // Return the promise from that other request.
      return lastReset.promise;
    }

    // Enough time has passed for this rate limit to be reset.
    var channelRef = getDatabase(Applab.channelId);
    var limitCounterData = {
      last_reset_time: Firebase.ServerValue.TIMESTAMP,
      last_op_count: 0
    };
    var channelData = {};
    channelData['counters/limits/' + interval] = limitCounterData;
    channelData['data/limits/' +  interval + '/used_ops'] = null;
    lastReset.time = lastResetTimeMs;
    lastReset.promise = channelRef.update(channelData).catch(function (error) {
      // Our reset request failed. Check to see if another client's reset attempt succeeded.
      var limitRef = channelRef.child('counters').child('limits').child(interval);
      return limitRef.once('value').then(function (limitSnapshot) {
        var newResetTimeMs = limitSnapshot.child('last_reset_time').val() || 0;
        if (newResetTimeMs <= lastResetTimeMs) {
          return Promise.reject('Failed to reset rate limit.  ' + error);
        } else {
          // Our reset request failed, but the timestamp was updated, so we assume
          // that another client's reset attempt succeeded.
        }
      });
    });

    return lastReset.promise;
  });
}

/**
 *
 * @param interval
 */
function incrementOpCountPromise(interval) {
  var opCountRef = getDatabase(Applab.channelId).child('counters').child('limits').child(interval).child('last_op_count');
  var increment = incrementOpCountData.bind(this, interval);
  return opCountRef.transaction(increment).then(function (transactionResult) {
    if (!transactionResult.committed) {
      return Promise.reject('aborting increment transaction, max op count reached.');
    } else {
      return transactionResult.snapshot.val();
    }
  });
}

/**
 * Update function for a Firebase transaction to increment a rate limit counter.
 * @param {number} interval The rate limit interval.
 * @param {number} opCountData The number of operations on this rate limit
 *     interval since the last reset.
 * @returns {*} new value for opCountData, or undefined if the transaction should be aborted.
 */
function incrementOpCountData(interval, opCountData) {
  opCountData = opCountData || 0;
  if (opCountData < RATE_LIMITS[interval]) {
    return opCountData + TOKEN_BATCH_SIZE;
  } else {
    // The op count cannot be incremented. Abort the transaction.
    return;
  }
}

/**
 * @param {String} tableName

 */
function getServerDataPromise(tableName) {
  var tokenMapPromise = getRateLimitTokenMapPromise();
  var tableRef = getTable(Applab.channelId, tableName);
  var rowCountsPromise = tableRef.child('row_count').once('value').then(function (snapshot) {
    return snapshot.val();
  });
  return Promise.all([tokenMapPromise, rowCountsPromise]).then(function (results) {
    return {
      tokenMap: results[0],
      rowCounts: results[1]
    };
  });
 }

function getCurrentTimePromise() {
  var serverTimeRef = getDatabase(Applab.channelId).child('server_time').child(firebaseUserId);
  return serverTimeRef.set(Firebase.ServerValue.TIMESTAMP).then(function () {
    serverTimeRef.onDisconnect().remove();
    return serverTimeRef.once('value').then(function (currentTimeSnapshot) {
      return currentTimeSnapshot.val();
    });
  });
}

function getLastResetTimePromise(interval) {
  var lastResetTimeRef = getDatabase(Applab.channelId).child('counters').child('limits')
    .child(interval).child('last_reset_time');
  return lastResetTimeRef.once('value').then(function (lastResetTimeSnapshot) {
    return lastResetTimeSnapshot.val() || 0;
  });
}


function updateRowCount(recordId, rowCounts, channelDataData, tableName, delta) {
  var rowCountIndex = recordId % ROW_COUNT_BUCKETS;
  rowCounts = rowCounts || {};
  var newRowCount = (rowCounts[rowCountIndex] || 0) + delta;
  channelDataData['tables/' + tableName + '/row_count/' + rowCountIndex] = newRowCount;
}

function getWriteRecordPromise(tableName, recordId, record, rowCountChange) {
  return getServerDataPromise(tableName).then(function (serverData) {
    var channelDataData = {};
    var recordString = record === null ? null : JSON.stringify(record);
    channelDataData['tables/' + tableName + '/records/' + recordId] = recordString;
    channelDataData['tables/' + tableName + '/target_record_id'] = (String(recordId));
    if (rowCountChange) {
      updateRowCount(recordId, serverData.rowCounts, channelDataData, tableName, rowCountChange);
    }
    addRateLimitTokens(channelDataData, serverData.tokenMap);
    console.log('FirebaseStorage.createRecord channelDataData:');
    console.log(channelDataData);

    var channelDataRef = getDatabase(Applab.channelId).child('data');
    return channelDataRef.update(channelDataData);
  });
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
  getNextIdPromise(tableName).then(function (nextId) {
    record.id = nextId;
    var rowCountChange = 1;
    getWriteRecordPromise(tableName, record.id, record, rowCountChange).catch(function (error) {
      // TODO(dave): throw an error instead of retrying if row_count/N or last_reset_time
      // have not changed since the previous attempt.
      console.log('retrying createRecord once after error: ' + error);
      return getWriteRecordPromise(tableName, record.id, record, rowCountChange);
    }).catch(function (error) {
      console.log('retrying createRecord twice after error: ' + error);
      return getWriteRecordPromise(tableName, record.id, record, rowCountChange);
    }).then(function () {
      onSuccess(record);
    }, function (error) {
      onError(error);
    });
  }, onError);
};

/**
 * Populate the rate limit metadata in channelData needed to make the
 * request succeed, using the rate limit info in limitsData.
 * @param channelDataData
 * @param tokenMap
 */
function addRateLimitTokens(channelDataData, tokenMap) {
  RATE_LIMIT_INTERVALS.forEach(function (interval) {
    var token = tokenMap[interval];
    channelDataData['limits/' + interval + '/used_ops/' + token] = true;
    channelDataData['limits/' + interval + '/target_op_id'] = token;
  });
}

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
  var rowCountChange = 0;
  getWriteRecordPromise(tableName, record.id, record, rowCountChange).catch(function (error) {
    console.log('retrying createRecord once after error: ' + error);
    return getWriteRecordPromise(tableName, record.id, record, rowCountChange);
  }).catch(function (error) {
    console.log('retrying createRecord twice after error: ' + error);
    return getWriteRecordPromise(tableName, record.id, record, rowCountChange);
  }).then(function () {
    // TODO: We need to handle the 404 case, probably by attempting a read.
    onComplete(record, true);
  }, function (error) {
    onError(error);
  });
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function (boolean)} onComplete Function to call on success, or if the
 *     record id is not found.
 * @param {function(string, number)} onError Function to call with an error message
 *     and http status in case of other types of failures.
 */
FirebaseStorage.deleteRecord = function (tableName, record, onComplete, onError) {
  var rowCountChange = -1;
  getWriteRecordPromise(tableName, record.id, null, rowCountChange).catch(function (error) {
    console.log('retrying createRecord once after error: ' + error);
    return getWriteRecordPromise(tableName, record.id, null, rowCountChange);
  }).catch(function (error) {
    console.log('retrying createRecord twice after error: ' + error);
    return getWriteRecordPromise(tableName, record.id, null, rowCountChange);
  }).then(function () {
    // TODO: We need to handle the 404 case, probably by attempting a read.
    onComplete(true);
  }, function (error) {
    onError(error);
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
