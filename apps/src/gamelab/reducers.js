/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
import {
  CHANGE_INTERFACE_MODE,
  VIEW_ANIMATION_JSON,
  HIDE_ANIMATION_JSON,
  TOGGLE_GRID_OVERLAY,
  SET_MOBILE_CONTROLS_CONFIG
} from './actions';
import {reducers as jsDebuggerReducers} from '../lib/tools/jsdebugger/redux';
import animationList from './animationListModule';
import animationPicker from './AnimationPicker/animationPickerModule';
import animationTab from './AnimationTab/animationTabModule';
import locationPicker from './locationPickerModule';
var errorDialogStack = require('./errorDialogStackModule').default;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;


function interfaceMode(state, action) {
  state = state || GameLabInterfaceMode.CODE;

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

const defaultMobileControlsConfigState = {
  spaceButtonVisible: true,
  dpadVisible: true,
  dpadFourWay: true,
  mobileOnly: true,
};
function mobileControlsConfig(state, action) {
  state = state || defaultMobileControlsConfigState;

  switch (action.type) {
    case SET_MOBILE_CONTROLS_CONFIG:
      return action.mobileControlsConfig;
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
  defaultMobileControlsConfigState,
  mobileControlsConfig,
};
