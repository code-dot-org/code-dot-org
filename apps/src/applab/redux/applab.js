/** @file App Lab redux module */
import {ApplabInterfaceMode} from '../constants';
import data from '../../storage/redux/data';
import screens from './screens';
import {reducers as jsDebuggerReducers} from '../../lib/tools/jsdebugger/redux';
import {reducer as maker} from '../../lib/kits/maker/redux';

// Selectors

// Actions

/** @enum {string} */
const CHANGE_INTERFACE_MODE = 'applab/CHANGE_INTERFACE_MODE';
const TOGGLE_REDIRECT_NOTICE = 'applab/TOGGLE_REDIRECT_NOTICE';

/**
 * Change the interface mode between Design Mode and Code Mode
 * @param {!ApplabInterfaceMode} interfaceMode
 * @returns {{type: string, interfaceMode: ApplabInterfaceMode}}
 */
function changeInterfaceMode(interfaceMode) {
  if (!interfaceMode) {
    throw new Error('Expected an interace mode!');
  }
  return {
    type: CHANGE_INTERFACE_MODE,
    interfaceMode: interfaceMode
  };
}

/**
 * Change the state of whether we are displaying a redirect notice or not.
 * @param {!bool} displaying
 * @returns {{type: string, displaying: bool}}
 */
function toggleRedirectNotice(displaying, approved, url) {
  return {
    type: TOGGLE_REDIRECT_NOTICE,
    displaying: displaying,
    approved: approved,
    url: url
  };
}

export const actions = {
  changeInterfaceMode,
  toggleRedirectNotice
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

function redirectDisplay(state, action) {
  state = state || {displaying: false, approved: false, url: ''};
  switch (action.type) {
    case TOGGLE_REDIRECT_NOTICE:
      return {
        displaying: action.displaying,
        approved: action.approved,
        url: action.url
      };
    default:
      return state;
  }
}

export const reducers = {
  ...jsDebuggerReducers,
  maker,
  data,
  interfaceMode,
  redirectDisplay,
  screens
};
