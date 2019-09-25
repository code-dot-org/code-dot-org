import {
  ColumnType,
  castValue,
  isBoolean,
  isNumber,
  toBoolean
} from './dataBrowser/dataUtils';
import parseCsv from 'csv-parse';
import {
  init,
  loadConfig,
  fixFirebaseKey,
  getRecordsRef,
  getProjectDatabase,
  getSharedDatabase,
  resetConfigForTesting,
  isInitialized,
  validateFirebaseKey
} from './firebaseUtils';
import {
  enforceTableCount,
  incrementRateLimitCounters,
  getLastRecordId,
  updateTableCounters
} from './firebaseCounters';
import {
  addColumnName,
  deleteColumnName,
  renameColumnName,
  addMissingColumns,
  getColumnsRef
} from './firebaseMetadata';
import {tableType} from './redux/data';

/**
 * Namespace for Firebase storage.
 */
const FirebaseStorage = {};

// Upper bound on the number of additional characters needed in the JSON representation
// of a record when an 'id' field (up to 10 digits) is added to it, e.g. ' "id":1234567890'.
const RECORD_ID_PADDING = 16;

function getKeysRef() {
  let kv = getProjectDatabase().child('storage/keys');
  return kv;
}

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function (Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function (string, number)} onError Function to call on error with error msg and http status.
 */
FirebaseStorage.getKeyValue = function(key, onSuccess, onError) {
  key = fixKeyName(key, onError);

  const keyRef = getKeysRef().child(key);
  keyRef.once(
    'value',
    snapshot => {
      // Return undefined if the key was not found, otherwise return the decoded value.
      const value =
        snapshot.val() === null ? undefined : JSON.parse(snapshot.val());
      onSuccess(value);
    },
    onError
  );
};

// Some projects which were created on DynamoDB attempt to write to keys or table names
// which contain characters which are illegal in firebase paths. Rename these keys and
// tables so that these apps don't break. Also warn because this behavior is dangerous
// as it could lead to unintentional data collisions.

function fixKeyName(key, onError) {
  const newKey = fixFirebaseKey(key);
  if (newKey !== key) {
    onError(
      `The key was renamed from "${key}" to "${newKey}" because the characters ` +
        '".", "$", "#", "[", "]", and "/" are not allowed in key names.'
    );
    key = newKey;
  }
  return key;
}

function fixTableName(tableName, onError) {
  const newTableName = fixFirebaseKey(tableName);
  if (newTableName !== tableName) {
    onError(
      `The table was renamed from "${tableName}" to "${newTableName}" because the characters ` +
        '".", "$", "#", "[", "]", and "/" are not allowed in table names.'
    );
    tableName = newTableName;
  }
  return tableName;
}

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function (string, number)} onError Function to call on error with error msg and
 *    http status.
 */
FirebaseStorage.setKeyValue = function(key, value, onSuccess, onError) {
  key = fixKeyName(key, onError);

  // Store the value as a string representing a JSON value, or delete the key if the
  // value is undefined. For compatibility with parsers
  // which require JSON texts (such as Ruby's), this can be converted to a JSON text via:
  // `{v: ${jsonValue}}`. For terminology see: https://tools.ietf.org/html/rfc7159
  const jsonValue = value === undefined ? null : JSON.stringify(value);

  loadConfig()
    .then(config => {
      try {
        validateFirebaseKey(key);
      } catch (e) {
        return Promise.reject(`The key is invalid. ${e.message}`);
      }
      if (jsonValue && jsonValue.length > config.maxPropertySize) {
        return Promise.reject(
          `The value is too large. The maximum allowable size is ${
            config.maxPropertySize
          } bytes.`
        );
      }
      return incrementRateLimitCounters();
    })
    .then(() =>
      getKeysRef()
        .child(key)
        .set(jsonValue)
    )
    .then(onSuccess, onError);
};

/**
 * Deletes the key-value pair.
 * @param {string} key
 * @param {function ()} onSuccess
 * @param {function (string)} onError
 */
FirebaseStorage.deleteKeyValue = function(key, onSuccess, onError) {
  const keyRef = getKeysRef().child(key);
  keyRef.set(null).then(onSuccess, onError);
};

/**
 * Reads the record to determine whether it exists.
 * @param {string} tableName
 * @param {string} recordId
 * @returns {Promise<boolean>} whether the record exists
 */
function getRecordExistsPromise(tableName, recordId) {
  let recordRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records/${recordId}`
  );
  return recordRef.once('value').then(snapshot => snapshot.val() !== null);
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
FirebaseStorage.createRecord = function(tableName, record, onSuccess, onError) {
  tableName = fixTableName(tableName, onError);

  // Assign a unique id for the new record.
  const updateNextId = true;

  // Validate the table name and record before updating table counters, so that the
  // row count does not become inaccurate if the record is too large.
  validateRecord(record)
    .then(() => validateTableName(tableName))
    .then(() => incrementRateLimitCounters())
    .then(() => updateTableCounters(tableName, 1, updateNextId))
    .then(nextId => {
      record.id = nextId;
      const recordRef = getProjectDatabase().child(
        `storage/tables/${tableName}/records/${record.id}`
      );
      return recordRef.set(JSON.stringify(record));
    })
    .then(() => onSuccess(record), onError);
};

/**
 * Returns true if record matches the given search parameters, which are a map
 * from key name to expected value.
 */
function matchesSearch(record, searchParams) {
  let matches = true;
  Object.keys(searchParams || {}).forEach(key => {
    matches = matches && record[key] === searchParams[key];
  });
  return matches;
}

function validateTableName(tableName) {
  try {
    validateFirebaseKey(tableName);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(`The table name is invalid. ${e.message}`);
  }
}

function validateRecord(record, hasId) {
  if (!record) {
    return Promise.reject(`Invalid record: ${record}`);
  }
  if (hasId && !record.id) {
    return Promise.reject(`Missing record id: ${record.id}`);
  }
  if (!hasId && record.id) {
    return Promise.reject(`Unexpected record id: ${record.id}`);
  }
  return loadConfig().then(config => {
    // Allow some padding for the id field, so that we can validate the record before
    // the id field is added.
    if (
      JSON.stringify(record).length >
      config.maxRecordSize - RECORD_ID_PADDING
    ) {
      return Promise.reject(
        `The record is too large. The maximum allowable size is ${
          config.maxRecordSize
        } bytes.`
      );
    }
    return Promise.resolve();
  });
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
FirebaseStorage.readRecords = function(
  tableName,
  searchParams,
  onSuccess,
  onError
) {
  tableName = fixTableName(tableName, onError);

  const countersRef = getProjectDatabase().child('counters/tables/');
  // First, check if table exists using counters/tables/ as source of truth
  countersRef.once('value', countersSnapshot => {
    if (!countersSnapshot.val() || !countersSnapshot.val()[tableName]) {
      // Table doesn't exist. Return null instead of [] so we can show an error
      onSuccess(null);
      return;
    }
    let recordsRef = getRecordsRef(tableName);

    // Get all records in the table and filter them on the client.
    recordsRef.once(
      'value',
      recordsSnapshot => {
        let recordMap = recordsSnapshot.val() || {};
        let records = [];
        // Collect all of the records matching the searchParams.
        Object.keys(recordMap).forEach(id => {
          let record = JSON.parse(recordMap[id]);
          if (matchesSearch(record, searchParams)) {
            records.push(record);
          }
        });
        onSuccess(records);
      },
      onError
    );
  });
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
FirebaseStorage.updateRecord = function(
  tableName,
  record,
  onComplete,
  onError
) {
  tableName = fixTableName(tableName, onError);

  const recordJson = JSON.stringify(record);
  const recordRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records/${record.id}`
  );
  const hasId = true;

  // There is a race condition in which we might inaccurately report whether the operation
  // was successful or not. The alternative is a transaction, however this is not reliable
  // since transactions sometimes return null on their first attempt to read the data.
  validateRecord(record, hasId)
    .then(() => getRecordExistsPromise(tableName, record.id))
    .then(recordExists => {
      if (!recordExists) {
        onComplete(null, false);
      } else {
        incrementRateLimitCounters()
          .then(() => updateTableCounters(tableName, 0))
          .then(() => recordRef.set(recordJson))
          .then(() => onComplete(record, true), onError);
      }
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
FirebaseStorage.deleteRecord = function(
  tableName,
  record,
  onComplete,
  onError
) {
  tableName = fixTableName(tableName, onError);

  const recordRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records/${record.id}`
  );

  // There is a race condition in which we might inaccurately report whether the operation
  // was successful or not. The alternative is a transaction, however this is not reliable
  // since transactions sometimes return null on their first attempt to read the data.
  getRecordExistsPromise(tableName, record.id).then(recordExists => {
    if (!recordExists) {
      onComplete(false);
    } else {
      loadConfig()
        .then(() => incrementRateLimitCounters())
        .then(() => updateTableCounters(tableName, -1))
        .then(() => recordRef.set(null))
        .then(() => onComplete(true), onError);
    }
  });
};

/**
 * @type {Array.<string>} List of tables we are listening to.
 */
let listenedTables = [];

/**
 * Listens to tableName for any changes to the data it contains, and calls
 * onRecord with the record and eventType as follows:
 * - for 'create' events, returns the new record
 * - for 'update' events, returns the updated record
 * - for 'delete' events, returns a record containing the id of the deleted record
 * @param {string} tableName Table to listen to.
 * @param {function (Object, string)} onRecord Callback to call when
 * a change occurs with the record object (described above) and event type:
 * 'create', 'update' or 'delete'.
 * @param {function (string, number)} onError Callback to call with an error to show to the user and
 *   http status code.
 * @param {boolean} includeAll Optional Whether to include child_added events for records
 * which were in the table before onRecordEvent was called. Default: false.
 */
FirebaseStorage.onRecordEvent = function(
  tableName,
  onRecord,
  onError,
  includeAll
) {
  if (typeof onError !== 'function') {
    throw new Error(
      'onError is a required parameter to FirebaseStorage.onRecordEvent'
    );
  }
  if (!tableName) {
    onError(
      'Error listening for record events: missing required parameter "tableName"',
      400
    );
    return;
  }
  if (listenedTables.includes(tableName)) {
    onError(
      `onRecordEvent was already called for table "${tableName}". To avoid ` +
        'unexpected behavior in your program, you should only call onRecordEvent once ' +
        'per table, and use if/else statements to handle the different event types.'
    );
  }
  listenedTables.push(tableName);

  getLastRecordId(tableName).then(lastId => {
    const recordsRef = getRecordsRef(tableName);

    recordsRef.on('child_added', childSnapshot => {
      const record = JSON.parse(childSnapshot.val());
      if (includeAll || record.id > lastId) {
        onRecord(record, 'create');
      }
    });

    recordsRef.on('child_changed', childSnapshot => {
      onRecord(JSON.parse(childSnapshot.val()), 'update');
    });

    recordsRef.on('child_removed', oldChildSnapshot => {
      var record = JSON.parse(oldChildSnapshot.val());
      onRecord({id: record.id}, 'delete');
    });
  });
};

FirebaseStorage.resetRecordListener = function() {
  listenedTables.forEach(tableName => getRecordsRef(tableName).off());
  listenedTables = [];
};

FirebaseStorage.resetForTesting = function() {
  // Avoid the work of initializing the database if we didn't use it.
  if (!isInitialized()) {
    return;
  }

  FirebaseStorage.resetRecordListener();
  getProjectDatabase().set(null);

  resetConfigForTesting();
};

FirebaseStorage.addCurrentTableToProject = function(
  tableName,
  onSuccess,
  onError
) {
  return incrementRateLimitCounters()
    .then(loadConfig)
    .then(config => {
      return enforceTableCount(config, tableName);
    })
    .then(() => {
      getProjectDatabase()
        .child(`current_tables/${tableName}`)
        .set(true);
    })
    .then(onSuccess, onError);
};

FirebaseStorage.copyStaticTable = function(tableName, onSuccess, onError) {
  return incrementRateLimitCounters()
    .then(loadConfig)
    .then(config => {
      return enforceTableCount(config, tableName);
    })
    .then(() => {
      return getSharedDatabase()
        .child(`counters/tables/${tableName}`)
        .once('value');
    })
    .then(snapshot => {
      getProjectDatabase()
        .child(`counters/tables/${tableName}`)
        .set(snapshot.val());
    })
    .then(() => {
      return getSharedDatabase()
        .child(`storage/tables/${tableName}/records`)
        .once('value');
    })
    .then(snapshot => {
      getRecordsRef(tableName).set(snapshot.val());
    })
    .then(onSuccess, onError);
};

/**
 * Adds an entry for the table in Firebase under counters/tables, making the table
 * show up in the data browser and also count toward the table count limit.
 * @param {string} tableName
 * @param {function()} onSuccess
 * @param {function(string)} onError
 */
FirebaseStorage.createTable = function(tableName, onSuccess, onError) {
  return validateTableName(tableName)
    .then(incrementRateLimitCounters)
    .then(loadConfig)
    .then(config => {
      return enforceTableCount(config, tableName);
    })
    .then(() => {
      const countersRef = getProjectDatabase().child(
        `counters/tables/${tableName}`
      );
      countersRef
        .transaction(countersData => {
          if (countersData === null) {
            return {lastId: 0, rowCount: 0};
          }
          return countersData;
        })
        .then(transactionData => {
          const {committed} = transactionData;
          if (!committed) {
            return Promise.reject(
              `Unexpected error creating table "${tableName}"`
            );
          }
          return Promise.resolve();
        });
    })
    .then(onSuccess, onError);
};

/**
 * Delete an entire table from firebase storage, then reset its lastId and rowCount.
 * @param {string} tableName
 * @param {string} type
 * @param {function ()} onSuccess
 * @param {function (string)} onError
 */
FirebaseStorage.deleteTable = function(tableName, type, onSuccess, onError) {
  if (type === tableType.SHARED) {
    getProjectDatabase()
      .child(`current_tables/${tableName}`)
      .set(null)
      .then(onSuccess, onError);
  } else {
    const tableRef = getProjectDatabase().child(`storage/tables/${tableName}`);
    const countersRef = getProjectDatabase().child(
      `counters/tables/${tableName}`
    );
    tableRef
      .set(null)
      .then(() => countersRef.set(null))
      .then(() => getColumnsRef(getProjectDatabase(), tableName).set(null))
      .then(onSuccess, onError);
  }
};

/**
 * Delete all the rows from a table.
 * @param {string} tableName
 * @param {function ()} onSuccess
 * @param {function (string)} onError
 */
FirebaseStorage.clearTable = function(tableName, onSuccess, onError) {
  const tableRef = getProjectDatabase().child(`storage/tables/${tableName}`);
  tableRef
    .set(null)
    .then(() => {
      const rowCountRef = getProjectDatabase().child(
        `counters/tables/${tableName}/rowCount`
      );
      return rowCountRef.set(0);
    })
    .then(onSuccess, onError);
};

/**
 * Returns a list of existing tables. The counters/tables node is the source of truth for
 * whether a table exists. See fileoverview in firebaseCounters.js for more details.
 * @param {boolean} overwrite
 * @returns {Promise.<Object>} Promise containing a map with existing table names as keys,
 *   or an empty map if overwrite is true.
 */
function getExistingTables(overwrite) {
  if (overwrite) {
    return Promise.resolve({});
  }
  const tablesRef = getProjectDatabase().child('counters/tables');
  return tablesRef.once('value').then(snapshot => snapshot.val() || {});
}

/**
 * Converts records into a format that can be written to a table's `records` node in
 * firebase, overwriting the "id" field of each record if necessary.
 * @param {Array.<Object>} records Array of raw javascript objects representing records.
 * @returns {Object} Map representing records data, where each key is a record id, and
 *   each value is a JSON-encoded record containing an "id" field equal to the record id.
 */
function getRecordsData(records) {
  const recordsData = {};
  records.forEach((record, index) => {
    const id = index + 1;
    record.id = id;
    recordsData[id] = JSON.stringify(record);
  });
  return recordsData;
}

/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function} onError Function to call with an error in case of failure.
 */
FirebaseStorage.populateTable = function(
  jsonData,
  overwrite,
  onSuccess,
  onError
) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  // Ensure rate limit counters have been initialized, so that updates to the
  // counters/tables node will pass type definition checks in the security rules.
  incrementRateLimitCounters()
    .then(() => getExistingTables(overwrite))
    .then(existingTables => {
      const promises = [];
      let newTables;
      try {
        newTables = JSON.parse(jsonData);
      } catch (e) {
        return Promise.reject(
          `${e}\nwhile parsing initial table data: ${jsonData}`
        );
      }
      for (const tableName in newTables) {
        if (overwrite || existingTables[tableName] === undefined) {
          const newRecords = newTables[tableName];
          const recordsData = getRecordsData(newRecords);
          promises.push(overwriteTableData(tableName, recordsData));
        }
      }
      return Promise.all(promises);
    })
    .then(onSuccess, onError);
};

/**
 * @param {boolean} overwrite
 * @returns {Promise} Promise containing a map of existing key/value pairs, or an
 *   empty map if overwrite is true.
 */
function getExistingKeyValues(overwrite) {
  if (overwrite) {
    return Promise.resolve({});
  }
  return getKeysRef()
    .once('value')
    .then(snapshot => snapshot.val() || {});
}

/**
 * Populates the key/value store with initial data
 * @param {string} jsonData The json data that represents the keys/value pairs in the
 *   format of:
 *   {
 *     "click_count": 5,
 *     "button_color": "blue"
 *   }
 * @param {bool} overwrite Whether to overwrite a key if it already exists.
 * @param {function ()} onSuccess Function to call on success.
 * @param {function} onError Function to call with an error in case of failure.
 */
FirebaseStorage.populateKeyValue = function(
  jsonData,
  overwrite,
  onSuccess,
  onError
) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  getExistingKeyValues(overwrite)
    .then(oldKeyValues => {
      let newKeyValues;
      try {
        newKeyValues = JSON.parse(jsonData);
      } catch (e) {
        return Promise.reject(
          `${e}\nwhile parsing initial key/value data: ${jsonData}`
        );
      }
      const keysData = {};
      for (const key in newKeyValues) {
        if (overwrite || oldKeyValues[key] === undefined) {
          keysData[key] = JSON.stringify(newKeyValues[key]);
        }
      }
      return keysData;
    })
    .then(keysData => getKeysRef().update(keysData))
    .then(onSuccess, onError);
};

FirebaseStorage.addColumn = function(
  tableName,
  columnName,
  onSuccess,
  onError
) {
  return addColumnName(tableName, columnName).then(onSuccess, onError);
};

/**
 * Delete every instance of the specified column name currently in the table.
 * @param {string} tableName
 * @param {string} columnName
 * @param {function()} onSuccess
 * @param {function(*)} onError
 */
FirebaseStorage.deleteColumn = function(
  tableName,
  columnName,
  onSuccess,
  onError
) {
  const recordsRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records`
  );
  recordsRef
    .once('value')
    .then(snapshot => {
      let recordsData = snapshot.val() || {};
      Object.keys(recordsData).forEach(recordId => {
        const record = JSON.parse(recordsData[recordId]);
        delete record[columnName];
        recordsData[recordId] = JSON.stringify(record);
      });
      return recordsData;
    })
    .then(recordsData => recordsRef.set(recordsData))
    .then(() => deleteColumnName(tableName, columnName))
    .then(onSuccess, onError);
};

/**
 * Rename every instance of the specified column name currently in the table. This is
 * unsafe in that we do not check whether data already exists in the new column.
 * @param {string} tableName
 * @param {string} oldName
 * @param {string} newName
 * @param {function()} onSuccess
 * @param {function(*)} onError
 */
FirebaseStorage.renameColumn = function(
  tableName,
  oldName,
  newName,
  onSuccess,
  onError
) {
  if (!tableName) {
    onError(
      'tableName is a required parameter to FirebaseStorage.renameColumn'
    );
    return;
  }
  const recordsRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records`
  );
  recordsRef
    .once('value')
    .then(snapshot => {
      let recordsData = snapshot.val() || {};
      // Preserve column order.
      Object.keys(recordsData).forEach(recordId => {
        const oldRecord = JSON.parse(recordsData[recordId]);
        let newRecord = {};
        Object.keys(oldRecord).forEach(oldKey => {
          const newKey = oldKey === oldName ? newName : oldKey;
          newRecord[newKey] = oldRecord[oldKey];
        });
        recordsData[recordId] = JSON.stringify(newRecord);
      });
      return recordsData;
    })
    .then(recordsData => recordsRef.set(recordsData))
    .then(() => renameColumnName(tableName, oldName, newName))
    .then(onSuccess, onError);
};

/**
 * Modifies the record[columnName] to type columnType, if the field can be converted
 * to that type. Returns whether or not the field was converted.
 * @param {Object} records Javascript object representing the record.
 * @param {string} columnName
 * @param {ColumnType} columnType The type to convert the column to.
 * @returns {boolean} Whether the field was converted.
 */

function coerceRecord(record, columnName, columnType) {
  const value = record[columnName];
  if (typeof value === 'undefined') {
    return true;
  }
  switch (columnType) {
    case ColumnType.STRING:
      record[columnName] = String(value);
      return true;
    case ColumnType.NUMBER:
      if (isNumber(value)) {
        record[columnName] = parseFloat(value);
        return true;
      }
      return false;
    case ColumnType.BOOLEAN:
      if (isBoolean(value)) {
        record[columnName] = toBoolean(value);
        return true;
      }
      return false;
    default:
      throw new Error(`Unexpected column type ${columnType}`);
  }
}

/**
 *
 * @param {string} tableName
 * @param {string} columnName
 * @param {ColumnType} columnType The type to convert the column to.
 * @param onSuccess
 * @param onError
 */
FirebaseStorage.coerceColumn = function(
  tableName,
  columnName,
  columnType,
  onSuccess,
  onError
) {
  const recordsRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records`
  );
  recordsRef
    .once('value')
    .then(snapshot => {
      const recordsData = snapshot.val() || {};
      let allConverted = true;
      Object.keys(recordsData).forEach(recordId => {
        const record = JSON.parse(recordsData[recordId]);
        allConverted =
          allConverted && coerceRecord(record, columnName, columnType);
        recordsData[recordId] = JSON.stringify(record);
      });
      if (!allConverted) {
        onError(
          `Not all values in column "${columnName}" could be converted to type "${columnType}".`
        );
      }
      return recordsRef.set(recordsData);
    })
    .then(onSuccess, onError);
};

/**
 * Parses a CSV string into records data in a format that can be written into the
 * records node of a firebase table.
 * @param {string} csvData
 * @returns {Promise} A promise containing recordsData or an error message.
 */
function parseRecordsDataFromCsv(csvData) {
  return new Promise((resolve, reject) => {
    parseCsv(csvData, {columns: true}, (error, records) => {
      if (error) {
        return reject(error);
      }
      resolve(records);
    });
  }).then(records => {
    let recordsData = {};
    records.forEach((record, index) => {
      const id = index + 1;
      for (const key in record) {
        record[key] = castValue(record[key]);
      }
      record.id = id;
      recordsData[id] = JSON.stringify(record);
    });
    return recordsData;
  });
}

/**
 * Validates that the records data does not exceed size limits.
 * @param recordsData The records data to validate.
 * @returns {Promise} A promise containing recordsData or an error message.
 */
function validateRecordsData(recordsData) {
  return loadConfig().then(config => {
    if (Object.keys(recordsData).length > config.maxTableRows) {
      return Promise.reject(
        `Import failed because the data is too large. ` +
          `A table may only contain ${config.maxTableRows} rows.`
      );
    }
    if (
      Object.keys(recordsData).some(
        id => recordsData[id].length > config.maxRecordSize
      )
    ) {
      return Promise.reject(
        `Import failed because one of of the records is too large. ` +
          `The maximum allowable size is ${config.maxRecordSize} bytes.`
      );
    }
    return recordsData;
  });
}

/**
 * Overwrites the table with new contents, and updates the table counters accordingly.
 * Rate limit counters are not updated.
 * @param {string} tableName
 * @param recordsData
 * @returns {Promise} A promise which is successful if all writes were successful.
 */
function overwriteTableData(tableName, recordsData) {
  const recordsRef = getProjectDatabase().child(
    `storage/tables/${tableName}/records`
  );
  const countersRef = getProjectDatabase().child(
    `counters/tables/${tableName}`
  );
  return getColumnsRef(getProjectDatabase(), tableName)
    .set(null)
    .then(() => recordsRef.set(recordsData))
    .then(() => {
      // Work around security rule validation checks.
      return countersRef.set(null);
    })
    .then(() => {
      const count = Object.keys(recordsData).length;
      return countersRef.set({
        lastId: count,
        rowCount: count
      });
    })
    .then(() => addMissingColumns(tableName));
}

FirebaseStorage.importCsv = function(
  tableName,
  tableDataCsv,
  onSuccess,
  onError
) {
  parseRecordsDataFromCsv(tableDataCsv)
    .then(recordsData => validateRecordsData(recordsData))
    .then(recordsData => overwriteTableData(tableName, recordsData))
    .then(onSuccess, onError);
};

export default FirebaseStorage;

export function initFirebaseStorage(config) {
  init(config);
  return FirebaseStorage;
}
