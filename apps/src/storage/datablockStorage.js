import FirebaseStorage from './firebaseStorage';
import {init} from './firebaseUtils';
import {filterRecords} from './storageCommon';

const DatablockStorage = {...FirebaseStorage};

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

async function readRecords(tableName, searchParams) {
  const response = await _fetch('read_records', 'GET', {
    table_name: tableName,
  });
  const json = (await response.json()).map(record => record.json);
  console.log('json is ', json);
  return filterRecords(json, searchParams);
}

DatablockStorage.readRecords = function (
  tableName,
  searchParams,
  onSuccess,
  onError
) {
  console.log('Using the overridden DatablockStorage method readRecords');
  return readRecords(tableName, searchParams).then(onSuccess, onError);
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

export function initDatablockStorage(config) {
  console.log('LOADING DATABLOCK STORAGE SHIM!!!');
  init(config);
  return DatablockStorage;
}

export default DatablockStorage;
