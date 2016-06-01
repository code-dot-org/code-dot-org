/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var ActionType = require('./actions').ActionType;
var constants = require('./constants');
var ApplabInterfaceMode = constants.ApplabInterfaceMode;
var screens = require('./redux/screens');

function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

module.exports = {
  interfaceMode: interfaceMode,
  screens: screens.default
};
