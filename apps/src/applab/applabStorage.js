import {getColumnsRef, onColumnsChange} from '../storage/firebaseMetadata'; // TODO: unfirebase
import {
  getProjectDatabase, // TODO: unfirebase
  getSharedDatabase, // TODO: unfirebase
  getPathRef, // TODO: unfirebase
  unescapeFirebaseKey, // TODO: unfirebase
} from '../storage/firebaseUtils'; // TODO: unfirebase
import {updateTableColumns, updateTableRecords} from '../storage/redux/data';

import {getStore} from '../redux';
import _ from 'lodash';

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
