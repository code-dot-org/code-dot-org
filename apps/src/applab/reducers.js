/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
import { ActionType } from './actions';
import { ApplabInterfaceMode } from './constants';
import data from '../storage/redux/data';
import screens from './redux/screens';
import {reducers as jsDebuggerReducers} from '../lib/tools/jsdebugger/redux';

function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

export default {
  ...jsDebuggerReducers,
  data,
  interfaceMode,
  screens
};
