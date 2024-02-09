import _ from 'lodash';

const DatablockStorage = {};

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
  }).then((record) => {
    onSuccess(record, !!record)
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

// This is only called if isDatablockStorage()
DatablockStorage.getTableNames = function () {
  return getTableNames();
};

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
    getColumnsForTable(tableName).then(onColumnsChanged)

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
  _fetch('populate_tables', 'PUT', {
    tables_json: JSON.stringify(jsonData),
  });
};

DatablockStorage.populateKeyValue = function (jsonData, onSuccess, onError) {
  _fetch('populate_key_values', 'PUT', {
    key_values_json: JSON.stringify(jsonData),
  }).then(onSuccess, onError);
};

// gets a list of all the shared or current tables available in the data browser
DatablockStorage.getLibraryManifest = function () {
  return getTableNames({isSharedTable: true}).then(tableNames => {
    console.log('FOUND SHARED TABLES', tableNames);
    // FIXME, unfirebase, we don't have this implemented yet
    // see: issue on implementing the library manifest system here:
    // https://github.com/code-dot-org/code-dot-org/issues/56472
    const EXAMPLE_MANIFEST_FROM_FIREBASE = {
      categories: [
        {
          datasets: [
            '100 Birds of the World',
            'Bee Colonies',
            'Cats',
            'Dogs',
            'Endangered Species of Canada',
            'Palmer Penguins',
          ],
          name: 'Animals',
          published: true,
        },
      ],
      tables: [
        {
          current: false,
          description:
            'Data and images about 100 different species of birds around the world',
          docUrl: 'https://studio.code.org/data_docs/100-birds/',
          name: '100 Birds of the World',
          published: true,
        },
        {
          current: true,
          description:
            'Live weather five-day forecast data for 100 cities. Updates daily with expected weather conditions.',
          docUrl: 'https://studio.code.org/data_docs/daily-weather/',
          lastUpdated: 1707480317000,
          name: 'Daily Weather',
          published: true,
        },
      ],
    };
    console.error(
      'DatablockStorage.getLibraryManifest is NOT IMPLEMENTED YET, returning stock EXAMPLE_MANIFEST_FROM_FIREBASE:',
      EXAMPLE_MANIFEST_FROM_FIREBASE
    );
    return EXAMPLE_MANIFEST_FROM_FIREBASE;
  });
};

// returns an array of strings for each of the columns in the table
// Note this diverges a little from the F*rebase version, which takes a tableType param
// which we do not need since we implement this on the backend.
DatablockStorage.getColumnsForTable = function (tableName) {
  return getColumnsForTable({tableName});
};

// @return {Promise<boolean>} whether the project channelID (configured at initF*rebaseStorage) exists
DatablockStorage.channelExists = function () {
  return _fetch('channel_exists', 'GET', {});
};

// deletes all datablock storage data for this channel,
// used only one place, applab.js config.afterClearPuzzle()
DatablockStorage.clearAllData = function (onSuccess, onError) {
  _fetch('clear_all_data', 'DELETE', {}).then(onSuccess, onError);
};

// FIXME: unfirebase, remove this before merging PR
//
// See issue about implementing the library manifest system here:
// https://github.com/code-dot-org/code-dot-org/issues/56472
//
// Current tables are live updated, the data is NOT copied into
// the student project, instead a new type of f*rebase node is created
// like /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/current_tables/Daily Weather
// as opposed to a normal table that would be like
// /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/storage/tables/Daily Weather
//
// Current tables can be found in https://console.firebase.google.com/project/cdo-v3-shared/database/cdo-v3-shared/data/~2Fv3~2Fchannels~2Fshared~2Fmetadata~2Fmanifest~2Ftables
// where the table has `current: true` set in the manifest object
// DatablockStorage.addCurrentTableToProject = function (
//   tableName,
//   onSuccess,
//   onError
// ) {
//   _fetch('add_shared_table', 'POST', {
//     table_name: tableName,
//   }).then(onSuccess, onError);
// };
//
// Makes a project-local copy of one of the tables stored at /v3/channels/shared/storage/tables
// DatablockStorage.copyStaticTable = function (tableName, onSuccess, onError) {
//   // We don't differentiate between static and current shared tables
//   // they are both just pointers to the 'shared' channel's tables.
//   _fetch('add_shared_table', 'POST', {
//     table_name: tableName,
//   }).then(onSuccess, onError);
// };

// This is a new method for DatablockStorage which replaces the above APIs
DatablockStorage.addSharedTable = function (
  tableName,
  onSuccess,
  onError
) {
  _fetch('add_shared_table', 'POST', {
    table_name: tableName,
  }).then(onSuccess, onError);
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

// FIXME: unfirebase, remove this before merging PR
console.warn("Setting window.DatablockStorage for easier debugging, turn off before merging PR");
window.DatablockStorage = DatablockStorage;

export default DatablockStorage;
