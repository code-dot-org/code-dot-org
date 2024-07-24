import _ from 'lodash';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// DatablockStorage powers the "Data" tab in App Lab and Game Lab, including the
// datasets library, and the data blocks such as `readRecords` and `getKeyValue`.
//
// DatablockStorage.* methods are thin wrappers over the corresponding methods
// found in apps/controllers/datablock_storage_controller.rb
//
// See datablock_storage_controller.rb for more detailed documentation.

const DatablockStorage = {};
let channelId = undefined;

export function initDatablockStorage({channelId: _channelId}) {
  channelId = _channelId;
  return DatablockStorage;
}

function urlFor(func_name) {
  return `/datablock_storage/${channelId}/` + func_name;
}

async function _fetch(path, method, params) {
  let response;
  if (method.toUpperCase() === 'GET') {
    response = await fetch(urlFor(path) + '?' + new URLSearchParams(params), {
      method: 'GET',
    });
  } else {
    response = await fetch(urlFor(path), {
      method,
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      credentials: 'same-origin',
    });
  }
  if (!response.ok) {
    throw await response.json();
  }
  return response;
}

async function getKeyValue(key) {
  const response = await _fetch('get_key_value', 'GET', {key});
  const json = await response.json();
  return json === null ? undefined : json;
}

DatablockStorage.getKeyValue = function (key, onSuccess, onError) {
  return getKeyValue(key).then(onSuccess, onError);
};

DatablockStorage.setKeyValue = function (key, value, onSuccess, onError) {
  value = value === undefined ? null : value;
  _fetch('set_key_value', 'POST', {
    key,
    value: JSON.stringify(value),
  }).then(() => onSuccess(), onError);
};

async function createRecord(tableName, record) {
  const response = await _fetch('create_record', 'POST', {
    table_name: tableName,
    record_json: JSON.stringify(record),
  });
  return await response.json();
}

DatablockStorage.createRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  createRecord(tableName, record).then(onSuccess, onError);
};

DatablockStorage.updateRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  _fetch('update_record', 'PUT', {
    table_name: tableName,
    record_id: record.id,
    record_json: JSON.stringify(record),
  })
    .then(response => response.json())
    .then(record => {
      onSuccess(record, !!record);
    }, onError);
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
  return readRecords({tableName, searchParams}).then(onSuccess, onError);
};

DatablockStorage.deleteRecord = function (
  tableName,
  record,
  onSuccess,
  onError
) {
  _fetch('delete_record', 'DELETE', {
    table_name: tableName,
    record_id: record.id,
  }).then(() => onSuccess(true), onError);
};

async function getTableNames({isSharedTable = false} = {}) {
  const response = await _fetch('get_table_names', 'GET', {
    is_shared_table: isSharedTable,
  });
  return await response.json();
}

DatablockStorage.getTableNames = function () {
  return getTableNames();
};

function loadTableAndColumns({
  tableName,
  isSharedTable,
  onColumnsChanged,
  onRecordsChanged,
}) {
  readRecords({tableName, isSharedTable}).then(records => {
    getColumnsForTable({tableName, isSharedTable}).then(onColumnsChanged);

    // DataTableView.getTableJson() expects an array of JSON strings
    // which it then parses as JSON, and then stringifies again 🙈
    // see: https://github.com/code-dot-org/code-dot-org/blob/208ed1f6733ca2524cc91bdfa696ba98c3250f47/apps/src/storage/dataBrowser/DataTableView.jsx/#L89-L93
    //
    // This is a relic of how our F*rebase records were stored
    // and a future improvement might be to optimize this.
    const recordStrings = records.map(record => JSON.stringify(record));
    onRecordsChanged(recordStrings);
  });
}

DatablockStorage.loadTable = function (
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

DatablockStorage.getKeyValuePairs = function (onKeyValuePairsChanged) {
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

DatablockStorage.createTable = function (tableName, onSuccess, onError) {
  _fetch('create_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
};

DatablockStorage.deleteTable = function (tableName, onSuccess, onError) {
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

DatablockStorage.exportCsvUrl = function (tableName) {
  return (
    urlFor('export_csv') + '?' + new URLSearchParams({table_name: tableName})
  );
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

async function getColumn({tableName, columnName}) {
  const response = await _fetch('get_column', 'GET', {
    table_name: tableName,
    column_name: columnName,
  });
  return await response.json();
}

DatablockStorage.getColumn = function (
  tableName,
  columnName,
  onSuccess,
  onError
) {
  return getColumn({tableName, columnName}).then(onSuccess, onError);
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
  return _fetch('populate_tables', 'PUT', {
    tables_json:
      typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData),
  });
};

DatablockStorage.populateKeyValue = function (jsonData, onSuccess, onError) {
  _fetch('populate_key_values', 'PUT', {
    key_values_json: JSON.stringify(jsonData),
  }).then(onSuccess, onError);
};

// fetch the library manifest used to populate the "Data Library" browser
// see: datablock_storage_library_manifest.rb
DatablockStorage.getLibraryManifest = function () {
  return _fetch('get_library_manifest', 'GET').then(response =>
    response.json()
  );
};

async function getColumnsForTable({tableName, isSharedTable = false}) {
  const response = await _fetch('get_columns_for_table', 'GET', {
    table_name: tableName,
    is_shared_table: isSharedTable,
  });
  const json = await response.json();
  return json;
}

// returns an array of strings for each of the columns in the table
// Note this diverges a little from the F*rebase version, which takes a tableType param
// which we do not need since we implement this on the backend.
DatablockStorage.getColumnsForTable = function (tableName) {
  return getColumnsForTable({tableName});
};

// @return {Promise<boolean>} whether the project has any data in it
DatablockStorage.projectHasData = function () {
  return _fetch('project_has_data', 'GET', {}).then(response =>
    response.json()
  );
};

// deletes all datablock storage data for this project,
// used only one place, applab.js config.afterClearPuzzle()
DatablockStorage.clearAllData = function (onSuccess, onError) {
  _fetch('clear_all_data', 'DELETE', {}).then(onSuccess, onError);
};

// This is a new method for DatablockStorage which replaces the above APIs
DatablockStorage.addSharedTable = function (tableName, onSuccess, onError) {
  return _fetch('add_shared_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
};

/* TESTING RELATED FUNCTIONS */

// Deletes the entire database for the project, including data and config
DatablockStorage.resetForTesting = function () {
  return _fetch('clear_all_data', 'DELETE', {});
};

DatablockStorage.resetRecordListener = function () {};

export default DatablockStorage;
