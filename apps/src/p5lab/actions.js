/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import $ from 'jquery';

import {setAllowInstructionsResize} from '../redux/instructions';

import {P5LabInterfaceMode} from './constants';

/** @enum {string} */
export const CHANGE_INTERFACE_MODE = 'CHANGE_INTERFACE_MODE';

export const VIEW_ANIMATION_JSON = 'gamelab/VIEW_ANIMATION_JSON';
export const HIDE_ANIMATION_JSON = 'gamelab/HIDE_ANIMATION_JSON';

export const TOGGLE_GRID_OVERLAY = 'gamelab/TOGGLE_GRID_OVERLAY';

export const REQUEST_LOCATION = 'gamelab/REQUEST_LOCATION';
export const CANCEL_LOCATION_SELECTION = 'gamelab/CANCEL_LOCATION_SELECTION';
export const SELECT_LOCATION = 'gamelab/SELECT_LOCATION';
export const UPDATE_LOCATION = 'gamelab/UPDATE_LOCATION';

export const CLEAR_CONSOLE = 'spritelab/CLEAR_CONSOLE';
export const ADD_MESSAGE = 'spritelab/ADD_MESSAGE';

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!P5LabInterfaceMode} interfaceMode
 * @returns {function}
 */
export function changeInterfaceMode(interfaceMode) {
  return function (dispatch) {
    $(window).trigger('appModeChanged');
    dispatch({
      type: CHANGE_INTERFACE_MODE,
      interfaceMode: interfaceMode,
    });
    dispatch(
      setAllowInstructionsResize(interfaceMode === P5LabInterfaceMode.CODE)
    );
  };
}

export function toggleGridOverlay(showGridOverlay) {
  return function (dispatch) {
    dispatch({
      type: TOGGLE_GRID_OVERLAY,
      showGridOverlay: showGridOverlay,
    });
  };
}

export function viewAnimationJson(animationJson) {
  return {
    type: VIEW_ANIMATION_JSON,
    content: animationJson,
  };
}

export function hideAnimationJson() {
  return {type: HIDE_ANIMATION_JSON};
}
