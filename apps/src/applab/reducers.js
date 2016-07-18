/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

import { ActionType } from './actions';
import { ApplabInterfaceMode } from './constants';
import data from './redux/data';
import screens from './redux/screens';

function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

export {
  data,
  interfaceMode,
  screens
};
