import {getStore} from '../../redux';
import {DataView} from '../constants';
import {
  tableType,
  addTableName,
  deleteTableName,
  updateTableColumns,
  updateTableRecords,
  updateKeyValueData,
  updateTableList,
} from '../redux/data';
import {isDatablockStorage, isFirebaseStorage} from '../storage';

let lastView;
let lastTableName;
let lastStorage;

export function refreshCurrentDataView() {
  // TODO: post-firebase-cleanup, remove if guard, but keep the contents: #56994
  if (isDatablockStorage()) {
    loadDataForView(lastStorage, lastView, null, lastTableName);
  }
}

/**
 * Given a particular view in the data sets browser, invoke appropriate
 * commands to the storageBackend() loading the data needed for that view.
 * @param {StorageBackend} storage - firebaseStorage or datablockStorage
 * @param {DataView} view
 * @param {string} oldTableName - a previously subscribed table name, for firebase to unsubscribe
 * @param {string} newTableName - name of the table being displayed, if any
 */
export function loadDataForView(storage, view, oldTableName, newTableName) {
  // TODO: post-firebase-cleanup, remove oldTableName: #56994

  // Save for later use in refreshCurrentDataView()
  lastView = view;
  lastTableName = newTableName;
  lastStorage = storage;

  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
  }

  // TODO: post-firebase-cleanup, remove this conditional: #56994
  if (isFirebaseStorage()) {
    storage.unsubscribeFromKeyValuePairs();
    if (oldTableName) {
      storage.unsubscribeFromTable(oldTableName);
    }
  }

  switch (view) {
    case DataView.PROPERTIES: {
      // Triggered when the Key Value Pairs tab is brought up
      storage.getKeyValuePairs(keyValueData => {
        getStore().dispatch(updateKeyValueData(keyValueData));
      });
      return;
    }
    case DataView.TABLE: {
      // Triggered when we browse a specific table
      storage.loadTable(
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

      // TODO: post-firebase-cleanup, remove this conditional: #56994
      if (isFirebaseStorage()) {
        // Firebase
        storage.subscribeToListOfProjectTables(
          (tableName, tableType) =>
            getStore().dispatch(addTableName(tableName, tableType)),
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
