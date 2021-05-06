/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
import {
  CHANGE_INTERFACE_MODE,
  VIEW_ANIMATION_JSON,
  HIDE_ANIMATION_JSON,
  TOGGLE_GRID_OVERLAY
} from './actions';
import {reducers as jsDebuggerReducers} from '@cdo/apps/lib/tools/jsdebugger/redux';
import animationList from './animationListModule';
import animationPicker from './AnimationPicker/animationPickerModule';
import animationTab from './AnimationTab/animationTabModule';
import locationPicker from './spritelab/locationPickerModule';
import textConsole from './spritelab/textConsoleModule';
import spritelabInputList from './spritelab/spritelabInputModule';
import locales from '@cdo/apps/redux/localesRedux';
var errorDialogStack = require('./errorDialogStackModule').default;
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
