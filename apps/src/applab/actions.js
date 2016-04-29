/** @file Redux action-creators for App Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var utils = require('../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum(
  'CHANGE_SCREEN',
  'CHANGE_INTERFACE_MODE'
);

/**
 * Change the interface mode between Design Mode and Code Mode
 * @param {!ApplabInterfaceMode} interfaceMode
 * @returns {{type: ActionType, interfaceMode: ApplabInterfaceMode}}
 */
module.exports.changeInterfaceMode = function (interfaceMode) {
  return {
    type: ActionType.CHANGE_INTERFACE_MODE,
    interfaceMode: interfaceMode
  };
};

/**
 * Change the active app screen while designing the app.
 * Note: Runtime screen changes are a separate operation, currently handled
 * in applab.js
 * @param {!string} screenId
 * @returns {{type: ActionType, screenId: string}}
 */
module.exports.changeScreen = function (screenId) {
  return {
    type: ActionType.CHANGE_SCREEN,
    screenId: screenId
  };
};
