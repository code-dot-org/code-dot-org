/** @file App Lab redux module */
import { ActionType } from './actions';
import { ApplabInterfaceMode } from './constants';
import data from '../storage/redux/data';
import screens from './redux/screens';
import {reducers as jsDebuggerReducers} from '../lib/tools/jsdebugger/redux';
import {reducer as maker} from '../lib/kits/maker/redux';

// State model?

// Selectors

// Actions

// Reducers
function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

export const reducers = {
  ...jsDebuggerReducers,
  maker,
  data,
  interfaceMode,
  screens,
};
