/**
 * @file Redux reducer for data mode in App Lab.
 * @see http://redux.js.org/docs/basics/Reducers.html
 */

import { Record } from 'immutable';
import { DataView } from '../constants';

const CHANGE_VIEW = `data/CHANGE_VIEW`;

const DataState = Record({
  view: DataView.OVERVIEW,
  tableName: ''
});

const initialState = new DataState();

export default function (state = initialState, action) {
  switch (action.type) {
    case CHANGE_VIEW:
      return state.set('view', action.view).set('tableName', action.tableName);
    default:
      return state;
  }
}

export const changeView = (view, tableName) => ({
  type: CHANGE_VIEW,
  view,
  tableName
});
