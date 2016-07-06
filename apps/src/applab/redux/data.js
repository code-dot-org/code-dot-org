/**
 * @file Redux reducer for data mode in App Lab.
 * @see http://redux.js.org/docs/basics/Reducers.html
 */

import { Record } from 'immutable';
import { DataView } from '../constants';

const CHANGE_VIEW = 'data/CHANGE_VIEW';
const UPDATE_TABLE_DATA = 'data/UPDATE_TABLE_DATA';
const UPDATE_KEY_VALUE_DATA = 'data/UPDATE_KEY_VALUE_DATA';

const DataState = Record({
  view: DataView.OVERVIEW,
  tableName: '',
  tableData: {},
  keyValueData: {}
});

const initialState = new DataState();

export default function (state = initialState, action) {
  switch (action.type) {
    case CHANGE_VIEW:
      // Discard table data when not viewing a table, so that we don't momentarily
      // show data for the wrong table when we return to the table view.
      if (action.view !== DataView.TABLE) {
        state = state.set('tableData', {});
      }
      return state.set('view', action.view).set('tableName', action.tableName);
    case UPDATE_KEY_VALUE_DATA:
      return state.set('keyValueData', action.keyValueData);
    case UPDATE_TABLE_DATA:
      return state.set('tableData', action.tableData);
    default:
      return state;
  }
}

export const changeView = (view, tableName) => ({
  type: CHANGE_VIEW,
  view,
  tableName
});

export const updateKeyValueData = keyValueData => ({
  type: UPDATE_KEY_VALUE_DATA,
  keyValueData
});

export const updateTableData = tableData => ({
  type: UPDATE_TABLE_DATA,
  tableData
});
