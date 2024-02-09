import {getStore} from '../../redux';
import {DataView} from '../constants';
import {
  tableType,
  addTableName,
  deleteTableName,
  updateTableColumns,
  updateTableRecords,
  updateKeyValueData,
  setLibraryManifest,
  updateTableList,
} from '../redux/data';
import {isDatablockStorage,isFirebaseStorage} from '../storage';

let lastView;
let lastTableName;
let lastStorage;

export function refreshCurrentDataView() {
  if (isDatablockStorage()) {
    loadDataForView(lastStorage, lastView, null, lastTableName);
  }

  // FIXME: unfirebase
  // If using firebase storage, this is a no-op because firebase
  // uses subscriptions and updates the redux store automatically.
}

/**
 * When we
 * @param {DataView} view
 */
export function loadDataForView(storage, view, oldTableName, newTableName) {
  // Save for later use in refreshCurrentDataView()
  lastView = view;
  lastTableName = newTableName;
  lastStorage = storage;

  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
  }
  
  if (isFirebaseStorage()) {
    storage.unsubscribeFromKeyValuePairs();
    if (oldTableName) {
      storage.unsubscribeFromTable(oldTableName);
    }
  }

  switch (view) {
    case DataView.PROPERTIES: {
      // Triggered when the Key Value Pairs tab is brought up
      storage.subscribeToKeyValuePairs(keyValueData => {
        getStore().dispatch(updateKeyValueData(keyValueData));
      });
      return;
    }
    case DataView.TABLE: {
      // Triggered when we browse a specific table
      storage.subscribeToTable(
        newTableName,
        columnNames =>
          getStore().dispatch(updateTableColumns(newTableName, columnNames)),
        records =>
          getStore().dispatch(updateTableRecords(newTableName, records))
      );
      return;
    }
    case DataView.OVERVIEW: {
      // Initialize redux's list of tables from firebase, and keep it up to date as
      // new tables are added and removed.

      // FIXME: unfirebase, this should probably key off of
      // something better than which function exists, e.g.
      // if (Applab.storage.STORAGE_NAME === 'firebase') {
      // OR
      // if (Applab.storage.STORAGE_NAME === firebase.STORAGE_NAME) {
      if (storage.subscribeToListOfProjectTables) {
        // Firebase
        storage.subscribeToListOfProjectTables(
          tableName =>
            getStore().dispatch(addTableName(tableName, tableType.PROJECT)),
          tableName => getStore().dispatch(deleteTableName(tableName))
        );
      } else {
        // Datablock Storage
        storage.getTableNames().then(tableNames => {
          const tableListMap = Object.fromEntries(
            tableNames.map(tableName => [tableName, tableType.PROJECT])
          );
          getStore().dispatch(updateTableList(tableListMap));
        });
      }
      return;
    }
    default:
      return;
  }
}