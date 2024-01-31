import FirebaseStorage from './firebaseStorage';
import {init} from './firebaseUtils';
import _ from 'lodash';

const DatablockStorage = {...FirebaseStorage};

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

DatablockStorage.subscribeToListOfProjectTables = function (
  onTableAdded,
  onTableRemoved
) {
  getTableNames().then(tableNames => {
    tableNames.forEach(onTableAdded);
  });
};

function loadTableAndColumns({
  tableName,
  isSharedTable,
  onColumnsChanged,
  onRecordsChanged,
}) {
  readRecords({tableName, isSharedTable}).then(records => {
    console.log('Got a response from readRecords: ', records);

    // FIXME: unfirebase, we are currently inferring the columns from the
    // data values, but based on our schema, we should be loading them
    // from DatablockStorageTables column columns.
    console.warn(
      'FIXME DatablockStorage.subscribeToTable: onColumnsChanged is not yet implemented to load from the SQL table'
    );
    const columnNames = new Set(records.flatMap(record => Object.keys(record)));
    onColumnsChanged(Array.from(columnNames));

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


export function initDatablockStorage(config) {
  console.log('LOADING DATABLOCK STORAGE SHIM!!!');
  init(config);
  return DatablockStorage;
}

export default DatablockStorage;
