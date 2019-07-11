/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import $ from 'jquery';
import * as utils from '../utils';
import {
  pickNewAnimation,
  show,
  Goal
} from './AnimationPicker/animationPickerModule';
import {GameLabInterfaceMode} from './constants';

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
 * @param {!GameLabInterfaceMode} interfaceMode
 * @param {boolean} spritelabDraw - If true, opens the animation tab to a new animation
 * @returns {function}
 */
export function changeInterfaceMode(interfaceMode, spritelabDraw) {
  //Add a resize event on each call to changeInterfaceMode to ensure
  //proper rendering of droplet and code mode. Similar solution in applab.
  setTimeout(() => utils.fireResizeEvent(), 0);
  return function(dispatch) {
    $(window).trigger('appModeChanged');
    dispatch({
      type: CHANGE_INTERFACE_MODE,
      interfaceMode: interfaceMode
    });
    if (interfaceMode === GameLabInterfaceMode.ANIMATION && spritelabDraw) {
      dispatch(show(Goal.NEW_ANIMATION));
      dispatch(pickNewAnimation());
    }
  };
}

export function toggleGridOverlay(showGridOverlay) {
  return function(dispatch) {
    dispatch({
      type: TOGGLE_GRID_OVERLAY,
      showGridOverlay: showGridOverlay
    });
  };
}

export function viewAnimationJson(animationJson) {
  return {
    type: VIEW_ANIMATION_JSON,
    content: animationJson
  };
}

export function hideAnimationJson() {
  return {type: HIDE_ANIMATION_JSON};
}
