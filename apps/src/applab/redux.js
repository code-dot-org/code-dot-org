/** @file App Lab redux module */
import _ from 'lodash';
import { ApplabInterfaceMode } from './constants';
import data from '../storage/redux/data';
import screens from './redux/screens';
import {reducers as jsDebuggerReducers} from '../lib/tools/jsdebugger/redux';
import {
  reducer as maker,
  actions as makerActions,
  selectors as makerSelectors,
} from '../lib/kits/maker/redux';

// Selectors

export const selectors = {
  // Curry maker selectors so they accept the root state.
  maker: _.mapValues(makerSelectors, selector => state => selector(state.maker)),
};

// Actions

/** @enum {string} */
const CHANGE_INTERFACE_MODE = 'applab/CHANGE_INTERFACE_MODE';

/**
 * Change the interface mode between Design Mode and Code Mode
 * @param {!ApplabInterfaceMode} interfaceMode
 * @returns {{type: string, interfaceMode: ApplabInterfaceMode}}
 */
export function changeInterfaceMode(interfaceMode) {
  if (!interfaceMode) {
    throw new Error("Expected an interace mode!");
  }
  return {
    type: CHANGE_INTERFACE_MODE,
    interfaceMode: interfaceMode
  };
}

export const actions = {
  changeInterfaceMode,
  maker: makerActions,
};

// Reducers

function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case CHANGE_INTERFACE_MODE:
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
