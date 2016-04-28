/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var ActionType = require('./actions').ActionType;
var combineReducers = require('redux').combineReducers;
var constants = require('./constants');
var ApplabInterfaceMode = constants.ApplabInterfaceMode;
var instructions = require('../redux/instructions');
var isRunning = require('../redux/isRunning');

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

function level(state, action) {
  state = state || levelInitialState;

  switch (action.type) {
    case ActionType.SET_INITIAL_LEVEL_PROPS:
      var allowedKeys = [
        'assetUrl',
        'channelId',
        'isDesignModeHidden',
        'isEmbedView',
        'isReadOnlyWorkspace',
        'isShareView',
        'isProjectLevel',
        'isSubmittable',
        'isSubmitted',
        'isViewDataButtonHidden',
        'instructionsMarkdown',
        'instructionsInTopPane',
        'puzzleNumber',
        'stageTotal',
        'showDebugButtons',
        'showDebugConsole',
        'showDebugWatch',
      ];
      Object.keys(action.props).forEach(function (key) {
        if (-1 === allowedKeys.indexOf(key)) {
          throw new Error('Property "' + key + '" may not be set using the ' +
              action.type + ' action.');
        }
      });
      return $.extend({}, state, action.props);

    default:
      return state;
  }
}

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
  currentScreenId: currentScreenId,
  level: level,
  interfaceMode: interfaceMode,
  instructions: instructions.default,
  isRunning: isRunning.default
});

module.exports = { rootReducer: rootReducer };
