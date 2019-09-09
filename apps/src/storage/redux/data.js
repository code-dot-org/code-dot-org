/**
 * @file Redux reducer for data mode in App Lab.
 * @see http://redux.js.org/docs/basics/Reducers.html
 */

import {Record} from 'immutable';
import {DataView} from '../constants';

const ADD_TABLE_NAME = 'data/ADD_TABLE_NAME';
const CHANGE_VIEW = 'data/CHANGE_VIEW';
const DELETE_TABLE_NAME = 'data/DELETE_TABLE_NAME';
const UPDATE_TABLE_COLUMNS = 'data/UPDATE_TABLE_COLUMNS';
const UPDATE_TABLE_RECORDS = 'data/UPDATE_TABLE_RECORDS';
const UPDATE_KEY_VALUE_DATA = 'data/UPDATE_KEY_VALUE_DATA';
const SHOW_WARNING = 'data/SHOW_WARNING';
const CLEAR_WARNING = 'data/CLEAR_WARNING';
const SHOW_PREVIEW = 'data/SHOW_PREVIEW';
const HIDE_PREVIEW = 'data/HIDE_PREVIEW';

/**
 * Types which a column can be coerced to.
 * @enum {string}
 */
export const tableType = {
  SHARED: 'shared',
  PROJECT: 'project'
};

const DataState = Record({
  view: DataView.OVERVIEW,
  tableListMap: {},
  tableName: '',
  tableColumns: [],
  tableRecords: {},
  keyValueData: {},
  warningTitle: '',
  warningMsg: '',
  isWarningDialogOpen: false,
  isPreviewOpen: false
});

const initialState = new DataState();

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_TABLE_NAME:
      return state.set(
        'tableListMap',
        Object.assign({}, state.tableListMap, {
          [action.tableName]: action.tableType
        })
      );
    case CHANGE_VIEW:
      // Discard table data when not viewing a table, so that we don't momentarily
      // show data for the wrong table when we return to the table view.
      if (action.view !== DataView.TABLE) {
        state = state.set('tableRecords', {});
      }
      return state.set('view', action.view).set('tableName', action.tableName);
    case DELETE_TABLE_NAME: {
      let map = Object.assign({}, state.tableListMap);
      delete map[action.tableName];
      return state.set('tableListMap', map);
    }
    case UPDATE_KEY_VALUE_DATA:
      return state.set('keyValueData', action.keyValueData);
    case UPDATE_TABLE_COLUMNS:
      if (state.tableName === action.tableName) {
        return state.set('tableColumns', action.tableColumns);
      }
      return state;
    case UPDATE_TABLE_RECORDS:
      if (state.tableName === action.tableName) {
        return state.set('tableRecords', action.tableRecords);
      }
      return state;
    case SHOW_WARNING:
      return state
        .set('warningMsg', action.warningMsg)
        .set('warningTitle', action.warningTitle)
        .set('isWarningDialogOpen', true);
    case CLEAR_WARNING:
      return state
        .set('warningMsg', '')
        .set('warningTitle', '')
        .set('isWarningDialogOpen', false);
    case SHOW_PREVIEW:
      return state
        .set('isPreviewOpen', true)
        .set('tableName', action.tableName);
    case HIDE_PREVIEW:
      return state.set('isPreviewOpen', false).set('tableName', '');
    default:
      return state;
  }
}

/**
 * Action which adds a table name to the table list map, if it doesn't exist already.
 * @param {string} tableName
 */
export const addTableName = (tableName, tableType) => ({
  type: ADD_TABLE_NAME,
  tableName,
  tableType
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

export const updateTableColumns = (tableName, tableColumns) => ({
  type: UPDATE_TABLE_COLUMNS,
  tableName,
  tableColumns
});

export const updateTableRecords = (tableName, tableRecords) => ({
  type: UPDATE_TABLE_RECORDS,
  tableName,
  tableRecords
});

export const showWarning = (warningMsg, warningTitle) => ({
  type: SHOW_WARNING,
  warningMsg,
  warningTitle
});

export const clearWarning = () => ({
  type: CLEAR_WARNING
});

export const showPreview = tableName => ({type: SHOW_PREVIEW, tableName});

export const hidePreview = () => ({type: HIDE_PREVIEW});
