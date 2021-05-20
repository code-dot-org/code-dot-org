/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
import {
  CHANGE_INTERFACE_MODE,
  VIEW_ANIMATION_JSON,
  HIDE_ANIMATION_JSON,
  TOGGLE_GRID_OVERLAY
} from './actions';
import {reducers as jsDebuggerReducers} from '@cdo/apps/lib/tools/jsdebugger/redux';
import animationList from './redux/animationList';
import animationPicker from './redux/animationPicker';
import animationTab from './redux/animationTab';
import locationPicker from './redux/locationPicker';
import textConsole from './redux/textConsole';
import spritelabInputList from './redux/spritelabInput';
import locales from '@cdo/apps/redux/localesRedux';
var errorDialogStack = require('./redux/errorDialogStack').default;
var P5LabInterfaceMode = require('./constants').P5LabInterfaceMode;

function interfaceMode(state, action) {
  state = state || P5LabInterfaceMode.CODE;

  switch (action.type) {
    case CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

const defaultAnimationJsonViewerState = {isOpen: false, content: null};
function animationJsonViewer(state, action) {
  state = state || defaultAnimationJsonViewerState;
  switch (action.type) {
    case VIEW_ANIMATION_JSON:
      return {isOpen: true, content: action.content};
    case HIDE_ANIMATION_JSON:
      return defaultAnimationJsonViewerState;
    default:
      return state;
  }
}

function gridOverlay(state, action) {
  state = state || false;

  switch (action.type) {
    case TOGGLE_GRID_OVERLAY:
      return action.showGridOverlay;
    default:
      return state;
  }
}

module.exports = {
  ...jsDebuggerReducers,
  animationPicker,
  animationTab,
  animationList,
  errorDialogStack,
  interfaceMode,
  animationJsonViewer,
  gridOverlay,
  locationPicker,
  textConsole,
  spritelabInputList,
  locales
};
