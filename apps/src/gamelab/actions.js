/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import $ from 'jquery';
import * as utils from '../utils';

/** @enum {string} */
export const CHANGE_INTERFACE_MODE = 'CHANGE_INTERFACE_MODE';

export const VIEW_ANIMATION_JSON = 'gamelab/VIEW_ANIMATION_JSON';
export const HIDE_ANIMATION_JSON = 'gamelab/HIDE_ANIMATION_JSON';

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!GameLabInterfaceMode} interfaceMode
 * @returns {function}
 */
export function changeInterfaceMode(interfaceMode) {
  //Add a resize event on each call to changeInterfaceMode to ensure
  //proper rendering of droplet and code mode. Similar solution in applab.
  setTimeout(() => utils.fireResizeEvent(), 0);
  return function (dispatch) {
    $(window).trigger('appModeChanged');
    dispatch({
      type: CHANGE_INTERFACE_MODE,
      interfaceMode: interfaceMode
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
