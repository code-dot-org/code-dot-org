/**
 * @file Redux reducer for data mode in App Lab.
 * @see http://redux.js.org/docs/basics/Reducers.html
 */

import { Record } from 'immutable';
import { DataView } from '../constants';

const ADD_TABLE_NAME = 'data/ADD_TABLE_NAME';
const CHANGE_VIEW = 'data/CHANGE_VIEW';
const DELETE_TABLE_NAME = 'data/DELETE_TABLE_NAME';
const UPDATE_TABLE_DATA = 'data/UPDATE_TABLE_DATA';
const UPDATE_KEY_VALUE_DATA = 'data/UPDATE_KEY_VALUE_DATA';

const DataState = Record({
  view: DataView.OVERVIEW,
  tableListMap: {},
  tableName: '',
  tableData: {},
  keyValueData: {}
});

const initialState = new DataState();

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_TABLE_NAME:
      return state.set('tableListMap', Object.assign({}, state.tableListMap, {
        [action.tableName]: true
      }));
    case CHANGE_VIEW:
      // Discard table data when not viewing a table, so that we don't momentarily
      // show data for the wrong table when we return to the table view.
      if (action.view !== DataView.TABLE) {
        state = state.set('tableData', {});
      }
      return state.set('view', action.view).set('tableName', action.tableName);
    case DELETE_TABLE_NAME: {
      let map = Object.assign({}, state.tableListMap);
      delete map[action.tableName];
      return state.set('tableListMap', map);
    }
    case UPDATE_KEY_VALUE_DATA:
      return state.set('keyValueData', action.keyValueData);
    case UPDATE_TABLE_DATA:
      return state.set('tableData', action.tableData);
    default:
      return state;
  }
}

/**
 * Action which adds a table name to the table list map, if it doesn't exist already.
 * @param {string} tableName
 */
export const addTableName = tableName => ({
  type: ADD_TABLE_NAME,
  tableName
});

export const changeView = (view, tableName) => ({
  type: CHANGE_VIEW,
  view,
  tableName
});

/**
 * Action which deletes a table name from the table list map, if it exists in the map.
 * @param {string} tableName
 */

export const deleteTableName = tableName => ({
  type: DELETE_TABLE_NAME,
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
