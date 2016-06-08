/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';
import $ from 'jquery';

/** @enum {string} */
export const CHANGE_INTERFACE_MODE = 'CHANGE_INTERFACE_MODE';

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!GameLabInterfaceMode} interfaceMode
 * @returns {function}
 */
module.exports.changeInterfaceMode = function (interfaceMode) {
  return function (dispatch) {
    $(window).trigger('appModeChanged');
    dispatch({
      type: CHANGE_INTERFACE_MODE,
      interfaceMode: interfaceMode
    });
  };
};
