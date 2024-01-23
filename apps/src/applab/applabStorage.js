import {getColumnsRef, onColumnsChange} from '../storage/firebaseMetadata'; // TODO: unfirebase
import {
  getProjectDatabase, // TODO: unfirebase
  getSharedDatabase, // TODO: unfirebase
  getPathRef, // TODO: unfirebase
  unescapeFirebaseKey, // TODO: unfirebase
} from '../storage/firebaseUtils'; // TODO: unfirebase
import {
  tableType,
  addTableName,
  deleteTableName,
  updateTableColumns,
  updateTableRecords,
  updateKeyValueData,
} from '../storage/redux/data';
import {DataView} from '../storage/constants';
import {getStore} from '../redux';
import _ from 'lodash';

// Initialize redux's list of tables from firebase, and keep it up to date as
// new tables are added and removed.
export function subscribeToListOfProjectTables(store) {
  // Subscribe to the list of regular tables in the current project
  const tableRef = getPathRef(getProjectDatabase(), 'counters/tables');
  tableRef.on('child_added', snapshot => {
    // TODO: unfirebase
    let tableName =
      typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key;
    tableName = unescapeFirebaseKey(tableName); // TODO: unfirebase
    store.dispatch(addTableName(tableName, tableType.PROJECT));
  });
  tableRef.on('child_removed', snapshot => {
    // TODO: unfirebase
    let tableName =
      typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key;
    tableName = unescapeFirebaseKey(tableName); // TODO: unfirebase
    store.dispatch(deleteTableName(tableName));
  });

  // Subscribe to the list of shared tables, aka "current tables"
  // these are like "Spotify Viral 50", but we'll also put deduped
  // stock tables here

  // /v3/channels/<channel_id>/current_tables tracks which
  // current tables the project has imported. Here we initialize the
  // redux list of current tables and keep it in sync
  let currentTableRef = getPathRef(getProjectDatabase(), 'current_tables'); // TODO: unfirebase
  currentTableRef.on('child_added', snapshot => {
    let tableName =
      typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key;
    tableName = unescapeFirebaseKey(tableName); // TODO: unfirebase
    store.dispatch(addTableName(tableName, tableType.SHARED));
  });
  currentTableRef.on('child_removed', snapshot => {
    let tableName =
      typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key;
    tableName = unescapeFirebaseKey(tableName); // TODO: unfirebase
    store.dispatch(deleteTableName(tableName));
  });
}

// Load data (and setup listeners in the case of Firebase) for
// the given shared table (i.e. the stock tables like Words)
// This triggers when you hit the [Preview] button from the
// data library browser.
export function onDataPreview(tableName) {
  // Fetch the list of columns into the redux store
  onColumnsChange(getSharedDatabase(), tableName, columnNames => {
    getStore().dispatch(updateTableColumns(tableName, columnNames));
  });
  // Fetch the data records into the redux store
  getPathRef(getSharedDatabase(), `storage/tables/${tableName}/records`).once(
    'value',
    snapshot => {
      getStore().dispatch(updateTableRecords(tableName, snapshot.val()));
    }
  );
}

/**
 * When we
 * @param {DataView} view
 */
export function onDataViewChange(view, oldTableName, newTableName) {
  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
  }

  if (oldTableName) {
    const projectStorageRef = getPathRef(getProjectDatabase(), 'storage');
    const sharedStorageRef = getPathRef(getSharedDatabase(), 'storage');
    // Unlisten from previous data view. This should not interfere with events listened to
    // by onRecordEvent, which listens for added/updated/deleted events, whereas we are
    // only unlistening from 'value' events here.
    getPathRef(projectStorageRef, 'keys').off('value');
    getPathRef(projectStorageRef, `tables/${oldTableName}/records`).off(
      'value'
    );
    getPathRef(sharedStorageRef, `tables/${oldTableName}/records`).off('value');
    getColumnsRef(getProjectDatabase(), oldTableName).off();
  }

  switch (view) {
    case DataView.PROPERTIES: {
      // Triggered when the Key Value Pairs tab is brought up
      console.log('view=DataView.PROPERTIES');
      const projectStorageRef = getPathRef(getProjectDatabase(), 'storage');
      getPathRef(projectStorageRef, 'keys').on('value', snapshot => {
        if (snapshot) {
          let keyValueData = snapshot.val();
          // "if all of the keys are integers, and more than half of the keys between 0 and
          // the maximum key in the object have non-empty values, then Firebase will render
          // it as an array."
          // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
          // Coerce it to an object here, if needed, so we can unescape the keys
          if (Array.isArray(keyValueData)) {
            keyValueData = Object.assign({}, keyValueData);
          }
          keyValueData = _.mapKeys(
            keyValueData,
            (_, key) => unescapeFirebaseKey(key) // TODO: unfirebase
          );
          getStore().dispatch(updateKeyValueData(keyValueData));
        }
      });
      return;
    }
    case DataView.TABLE: {
      // Triggered when we browse a specific table
      console.log('view=DataView.TABLE');
      let newTableType = getStore().getState().data.tableListMap[newTableName];
      const db =
        newTableType === tableType.PROJECT
          ? getProjectDatabase()
          : getSharedDatabase();
      onColumnsChange(db, newTableName, columnNames => {
        getStore().dispatch(updateTableColumns(newTableName, columnNames));
      });

      getPathRef(
        getPathRef(db, 'storage'),
        `tables/${newTableName}/records`
      ).on('value', snapshot => {
        getStore().dispatch(updateTableRecords(newTableName, snapshot.val()));
      });
      return;
    }
    default:
      console.log(`view=${view}`);
      return;
  }
}
