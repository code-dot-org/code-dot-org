import {init} from './firebaseUtils';
import _ from 'lodash';

const DatablockStorage = {};

/*

Docs useful to have in here while implementing
// FIXME: unfirebase, remove this comment before merging PR

Records table:

channelID: VARCHAR(22),
tableName: VARCHAR(768),
recordID: INT,
json: JSON
Tables table:

Tables table:
channelID: VARCHAR(22),
tableName: VARCHAR(768),
columns: JSON,
isSharedTable: VARCHAR(768), // if it points to a shared/stock table, load records using this table name instead
columns (JSON) might look like: ['id', 'Word'], note this assumes the columnIDs (like -Mw7ENQB6uKfQYc0kI8U) that are present in Firebase are not actually used. It doesn't look like they are, e.g. firebaseStorage.js references columns by name not by ID.

KeyValuePairs table:

channelID: VARCHAR(22),
key: VARCHAR(768), 
value: VARCHAR(4096), -- v3.config.channels.maxPropertySize, see `rules.bolt`
VARCHAR sizes:

Firebase validation rules:

maxPropertySize:4096 // value length of a key value pair
maxRecordSize:4096 // max length of a record
maxTableCount:10 // this doesn't seem to be encorced in rules.bolt?
maxTableRows: 20000 // number of records inside a table
maxKeySize: 768 // this is a firebase limit

Stock/Shared tables are also stored in Records and Tables but use a fixed channelID: channelID: shared
*/

function getAuthToken() {
  const tokenDOM = document.querySelector('meta[name="csrf-token"]');
  if (!tokenDOM) {
    throw new Error('Could not find CSRF token');
  }
  return tokenDOM.content;
}

function urlFor(func_name) {
  // FIXME: this doesn't work for all URLs where this can be loaded from
  // e.g. http://localhost-studio.code.org:3000/projects/applab/Yp05MnSdVubn04tBoEZn_g/edit/
  // vs http://localhost-studio.code.org:3000/projects/applab/Yp05MnSdVubn04tBoEZn_g
  return '../datablock_storage/' + func_name;
}

function _fetch(path, method, params) {
  if (method.toUpperCase() === 'GET') {
    return fetch(
      urlFor(path) +
        '?' +
        new URLSearchParams({
          ...params,
          authenticity_token: getAuthToken(),
        }),
      {
        method: 'GET',
      }
    );
  } else {
    return fetch(urlFor(path), {
      method,
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getAuthToken(),
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });
  }
}

async function getKeyValue(key) {
  const response = await _fetch('get_key_value', 'GET', {key});
  const json = await response.json();
  console.log('json is ', json);
  return json === null ? undefined : json;
}

DatablockStorage.getKeyValue = function (key, onSuccess, onError) {
  console.log('Using the overridden DatablockStorage method getKeyValue');
  return getKeyValue(key).then(onSuccess, onError);
};

DatablockStorage.setKeyValue = function (key, value, onSuccess, onError) {
  console.log('Using the overridden DatablockStorage method setKeyValue');

  _fetch('set_key_value', 'POST', {
    key,
    value: JSON.stringify(value),
  }).then(onSuccess, onError);
};

async function createRecord(tableName, record) {
  const response = await _fetch('create_record', 'POST', {
    table_name: tableName,
    record_json: JSON.stringify(record),
  });
  console.log('response is ', response);
  return await response.json();
}

DatablockStorage.createRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  console.log('Using the overridden DatablockStorage method createRecord');
  createRecord(tableName, record).then(
    newRecord => onSuccess(newRecord),
    onError
  );
};

DatablockStorage.updateRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  console.log('Using the overridden DatablockStorage method updateRecord');

  _fetch('update_record', 'PUT', {
    table_name: tableName,
    record_id: record.id,
    record_json: JSON.stringify(record),
  }).then(onSuccess, onError);
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

function filterRecords(recordList, searchParams) {
  return recordList.filter(record => {
    return matchesSearch(record, searchParams);
  });
}

async function readRecords({
  tableName,
  searchParams = false,
  isSharedTable = false,
}) {
  const response = await _fetch('read_records', 'GET', {
    table_name: tableName,
    is_shared_table: isSharedTable,
  });
  const json = await response.json();
  return searchParams ? filterRecords(json, searchParams) : json;
}

DatablockStorage.readRecords = function (
  tableName,
  searchParams,
  onSuccess,
  onError
) {
  console.log('Using the overridden DatablockStorage method readRecords');
  return readRecords({tableName, searchParams}).then(onSuccess, onError);
};

DatablockStorage.deleteRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  console.log('Using the overridden DatablockStorage method deleteRecord');

  _fetch('delete_record', 'DELETE', {
    table_name: tableName,
    record_id: record.id,
  }).then(onSuccess, onError);
};

async function getTableNames() {
  const response = await _fetch('get_table_names', 'GET', {});
  return await response.json();
}

// DIFFERENCE BETWEEN FIREBASESTORAGE AND DATABLOCKSTORAGE //

// FIREBASE VERSION USES THIS:
// DatablockStorage.subscribeToListOfProjectTables = function (
//   onTableAdded,
//   onTableRemoved
// ) {
//   getTableNames().then(tableNames => {
//     tableNames.forEach(onTableAdded);
//   });
// };
DatablockStorage.subscribeToListOfProjectTables = undefined;

// DATABLOCK STORAGE VERSION USES THIS:
DatablockStorage.getTableNames = function () {
  return getTableNames();
};

// END DIFFERENCE BETWEEN FIREBASESTORAGE AND DATABLOCKSTORAGE //

async function getColumnsForTable(tableName) {
  const response = await _fetch('get_columns_for_table', 'GET', {table_name: tableName});
  const json = await response.json();
  return json;
}

function loadTableAndColumns({
  tableName,
  isSharedTable,
  onColumnsChanged,
  onRecordsChanged,
}) {
  readRecords({tableName, isSharedTable}).then(records => {
    console.log('Got a response from readRecords: ', records);

    // We used to get columns by inferring them from the records:
    //
    // // FIXME: unfirebase, we are currently inferring the columns from the
    // // data values, but based on our schema, we should be loading them
    // // from DatablockStorageTables column columns.
    // console.warn(
    //   'FIXME DatablockStorage.subscribeToTable: onColumnsChanged is not yet implemented to load from the SQL table'
    // );
    // const columnNames = new Set(records.flatMap(record => Object.keys(record)));
    // onColumnsChanged(Array.from(columnNames));

    getColumnsForTable(tableName).then(onColumnsChanged)

    // DataTableView.getTableJson() expects an array of JSON strings
    // which it then parses as JSON, and then stringifies again 🙈
    // see: https://github.com/code-dot-org/code-dot-org/blob/208ed1f6733ca2524cc91bdfa696ba98c3250f47/apps/src/storage/dataBrowser/DataTableView.jsx/#L89-L93
    //
    // This is a relic of how our Firebase records were stored
    // and a future improvement might be to optimize this.
    const recordStrings = records.map(record => JSON.stringify(record));
    onRecordsChanged(recordStrings);
  });
}

DatablockStorage.subscribeToTable = function (
  tableName,
  onColumnsChanged,
  onRecordsChanged
) {
  loadTableAndColumns({
    tableName,
    isSharedTable: false,
    onColumnsChanged,
    onRecordsChanged,
  });
};

DatablockStorage.subscribeToKeyValuePairs = function (onKeyValuePairsChanged) {
  _fetch('get_key_values', 'GET', {})
    .then(response => response.json())
    .then(json => {
      onKeyValuePairsChanged(_.mapValues(json, value => JSON.stringify(value)));
    });
};

DatablockStorage.previewSharedTable = function (
  sharedTableName,
  onColumnsChanged,
  onRecordsChanged
) {
  loadTableAndColumns({
    tableName: sharedTableName,
    isSharedTable: true,
    onColumnsChanged,
    onRecordsChanged,
  });
};

DatablockStorage.unsubscribeFromTable = function (tableName) {
  // Used by FirebaseStorage, but we don't need it for DatablockStorage
  // since we don't hold subscriptions.
};

DatablockStorage.unsubscribeFromKeyValuePairs = function () {
  // Used by FirebaseStorage, but we don't need it for DatablockStorage
  // since we don't hold subscriptions.
};

DatablockStorage.createTable = function (tableName, onSuccess, onError) {
  _fetch('create_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
};

DatablockStorage.deleteTable = function (tableName, type, onSuccess, onError) {
  // FIXME: unfirebase, we ignore type, which is used by the Firebase implementation
  // to decide whether to nullify a `current_tables/` ref or a ``storage/tables/` ref.
  // Instead, we handle this in the backend, where we have a column in the tables table
  // to specify which type of table it is.
  _fetch('delete_table', 'DELETE', {
    table_name: tableName,
  }).then(onSuccess, onError);
};

DatablockStorage.clearTable = function (tableName, onSuccess, onError) {
  _fetch('clear_table', 'DELETE', {
    table_name: tableName,
  }).then(onSuccess, onError);
};

DatablockStorage.importCsv = function (
  tableName,
  tableDataCsv,
  onSuccess,
  onError
) {
  _fetch('import_csv', 'POST', {
    table_name: tableName,
    table_data_csv: tableDataCsv,
  }).then(onSuccess, onError);
};

DatablockStorage.addColumn = function (
  tableName,
  columnName,
  onSuccess,
  onError
) {
  _fetch('add_column', 'POST', {
    table_name: tableName,
    column_name: columnName,
  }).then(onSuccess, onError);

  throw 'Not implemented yet';
};

// Delete the column definition AND filters all rows to remove the offending JSON property
DatablockStorage.deleteColumn = function (
  tableName,
  columnName,
  onSuccess,
  onError
) {
  _fetch('delete_column', 'DELETE', {
    table_name: tableName,
    column_name: columnName,
  }).then(onSuccess, onError);
};

DatablockStorage.renameColumn = function (
  tableName,
  oldName,
  newName,
  onSuccess,
  onError
) {
  _fetch('rename_column', 'PUT', {
    table_name: tableName,
    old_column_name: oldName,
    new_column_name: newName,
  }).then(onSuccess, onError);
};

DatablockStorage.coerceColumn = function (
  tableName,
  columnName,
  columnType,
  onSuccess,
  onError
) {
  _fetch('coerce_column', 'PUT', {
    table_name: tableName,
    column_name: columnName,
    column_type: columnType,
  }).then(onSuccess, onError);
};

DatablockStorage.deleteKeyValue = function (key, onSuccess, onError) {
  _fetch('delete_key_value', 'DELETE', {
    key,
  }).then(onSuccess, onError);
};

// Used to inject levelbuilder defined data tables into the current project (see applab.js)
/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @returns {Promise} which resolves when all table data has been written
 */
DatablockStorage.populateTable = function (jsonData) {
  _fetch('populate_tables', 'POST', {
    tables_json: jsonData,
  });
  throw 'Not implemented yet';
};

DatablockStorage.populateKeyValue = function (jsonData, onSuccess, onError) {
  _fetch('populate_key_values', 'POST', {
    key_values_json: jsonData,
  }).then(onSuccess, onError);
  throw 'Not implemented yet';
};

// gets a list of all the shared or current tables available in the data browser
DatablockStorage.getLibraryManifest = function () {
  return getTableNames();
};

// returns an array of strings for each of the columns in the table
DatablockStorage.getColumnsForTable = function (tableName, tableType) {
  return getColumnsForTable(tableName);
};

// @return {Promise<boolean>} whether the project channelID (configured at initFirebaseStorage) exists
DatablockStorage.channelExists = function () {
  return _fetch('channel_exists', 'GET', {});
};

// deletes the entire channel in firebase
// used only one place, applab.js config.afterClearPuzzle()
DatablockStorage.clearAllData = function (onSuccess, onError) {
  _fetch('clear_all_data', 'DELETE', {}).then(onSuccess, onError);
  throw 'Not implemented yet';
};

// Current tables are live updated, the data is NOT copied into
// the student project, instead a new type of firebase node is created
// like /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/current_tables/Daily Weather
// as opposed to a normal table that would be like
// /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/storage/tables/Daily Weather
//
// Current tables can be found in https://console.firebase.google.com/project/cdo-v3-shared/database/cdo-v3-shared/data/~2Fv3~2Fchannels~2Fshared~2Fmetadata~2Fmanifest~2Ftables
// where the table has `current: true` set in the manifest object
DatablockStorage.addCurrentTableToProject = function (
  tableName,
  onSuccess,
  onError
) {
  _fetch('add_shared_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
  throw 'Not implemented yet';
};

// Makes a project-local copy of one of the tables stored at /v3/channels/shared/storage/tables
DatablockStorage.copyStaticTable = function (tableName, onSuccess, onError) {
  _fetch('add_shared_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
  throw 'Not implemented yet';
};

/* TESTING RELATED FUNCTIONS */

// Deletes the entire database for the project, including data and config
DatablockStorage.resetForTesting = function () {
  return _fetch('clear_all_data', 'DELETE', {});
};

DatablockStorage.resetRecordListener = function () {};

export function initDatablockStorage(config) {
  return DatablockStorage;
}

export default DatablockStorage;
