/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import $ from 'jquery';
import * as utils from '../utils';

/** @enum {string} */
export const CHANGE_INTERFACE_MODE = 'CHANGE_INTERFACE_MODE';

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!GameLabInterfaceMode} interfaceMode
 * @returns {function}
 */
module.exports.changeInterfaceMode = function (interfaceMode) {
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
};
