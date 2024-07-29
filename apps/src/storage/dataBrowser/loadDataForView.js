import {getStore} from '../../redux';
import {DataView} from '../constants';
import {
  tableType,
  updateTableColumns,
  updateTableRecords,
  updateKeyValueData,
  updateTableList,
} from '../redux/data';

let lastView;
let lastTableName;
let lastStorage;

export function refreshCurrentDataView() {
  loadDataForView(lastStorage, lastView, lastTableName);
}

/**
 * Given a particular view in the data sets browser, invoke appropriate
 * commands to the storageBackend() loading the data needed for that view.
 * @param {StorageBackend} storage
 * @param {DataView} view
 * @param {string} newTableName - name of the table being displayed, if any
 */
export function loadDataForView(storage, view, newTableName) {
  // Save for later use in refreshCurrentDataView()
  lastView = view;
  lastTableName = newTableName;
  lastStorage = storage;

  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
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
      // Initialize redux's list of tables from Datablock Storage, and keep it up to date as
      // new tables are added and removed.

      // Datablock Storage
      storage.getTableNames().then(tableNames => {
        const tableListMap = Object.fromEntries(
          tableNames.map(tableName => [tableName, tableType.PROJECT])
        );
        getStore().dispatch(updateTableList(tableListMap));
      });

      return;
    }
    default:
      return;
  }
}
