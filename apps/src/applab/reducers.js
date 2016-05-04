/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var ActionType = require('./actions').ActionType;
var combineReducers = require('../redux').combineReducers;
var constants = require('./constants');
var ApplabInterfaceMode = constants.ApplabInterfaceMode;
var instructions = require('../redux/instructions');

function currentScreenId(state, action) {
  state = state || null;

  switch (action.type) {
    case ActionType.CHANGE_SCREEN:
      return action.screenId;
    default:
      return state;
  }
}

var levelInitialState = {
  assetUrl: function () {},
  isDesignModeHidden: undefined,
  isEmbedView: undefined,
  isReadOnlyWorkspace: undefined,
  isShareView: undefined,
  isViewDataButtonHidden: undefined
};

function interfaceMode(state, action) {
  state = state || ApplabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

var rootReducer = combineReducers({

});

module.exports = {
  currentScreenId: currentScreenId,
  interfaceMode: interfaceMode,
  instructions: instructions.default
};
