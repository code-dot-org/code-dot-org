/** @file App Lab redux module */
import {ApplabInterfaceMode} from '../constants';
import data from '../../storage/redux/data';
import screens from './screens';
import {reducers as jsDebuggerReducers} from '../../lib/tools/jsdebugger/redux';
import {reducer as maker} from '../../lib/kits/maker/redux';

export const REDIRECT_RESPONSE = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNSUPPORTED: 'unsupported'
};

// Selectors

// Actions

/** @enum {string} */
const CHANGE_INTERFACE_MODE = 'applab/CHANGE_INTERFACE_MODE';
const ADD_REDIRECT_NOTICE = 'applab/ADD_REDIRECT_NOTICE';
const DISMISS_REDIRECT_NOTICE = 'applab/DISMISS_REDIRECT_NOTICE';
const SET_LEVEL_DATA = 'applab/SET_LEVEL_DATA';

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
 * Add a redirect notice to our stack
 * @param {string} response
 * @param {string} url
 * @returns {{type: string, approved: bool, url: string}}
 */
function addRedirectNotice(response, url) {
  return {
    type: ADD_REDIRECT_NOTICE,
    response: response,
    url: url
  };
}

/**
 * Remove the first redirect notice from our stack
 * @returns {{type: string}}
 */
function dismissRedirectNotice() {
  return {
    type: DISMISS_REDIRECT_NOTICE
  };
}

/**
 * Store data about the current Applab level (e.g., level name).
 * @returns {{type: string, levelData: object}}
 */
function setLevelData(data) {
  return {
    type: SET_LEVEL_DATA,
    data
  };
}

export const actions = {
  changeInterfaceMode,
  addRedirectNotice,
  dismissRedirectNotice,
  setLevelData
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
  state = state || [];

  switch (action.type) {
    case ADD_REDIRECT_NOTICE:
      // Add a redirect notice to our stack of notices
      return [
        {
          response: action.response,
          url: action.url
        }
      ].concat(state);
    case DISMISS_REDIRECT_NOTICE:
      // Dismiss the top-most redirect on the stack of notices
      if (state.length > 0) {
        return state.slice(1);
      } else {
        return state;
      }
    default:
      return state;
  }
}

function level(state, action) {
  state = state || [];

  switch (action.type) {
    case SET_LEVEL_DATA:
      return {
        ...state,
        ...action.data
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
  screens,
  level
};
