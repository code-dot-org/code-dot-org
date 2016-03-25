/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('lodash');
var ActionType = require('./actions').ActionType;
var combineReducers = require('redux').combineReducers;
var constants = require('./constants');
var ApplabInterfaceMode = constants.ApplabInterfaceMode;

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
    case ActionType.SET_LEVEL_PROPS:
      var allowedKeys = [
        'assetUrl',
        'isDesignModeHidden',
        'isEmbedView',
        'isReadOnlyWorkspace',
        'isShareView',
        'isViewDataButtonHidden',
        'instructionsMarkdown'
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

var instructionsInitialState = {
  collapsed: false,
  // represents the uncollapsed height
  height: 0
};

function instructions(state, action) {
  state = state || instructionsInitialState;

  if (action.type === ActionType.TOGGLE_INSTRUCTIONS_COLLAPSED) {
    return _.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === ActionType.SET_INSTRUCTIONS_HEIGHT) {
    return _.assign({}, state, {
      height: action.height
    });
  }

  return state;
}

var rootReducer = combineReducers({
  currentScreenId: currentScreenId,
  level: level,
  interfaceMode: interfaceMode,
  instructions: instructions
});

module.exports = { rootReducer: rootReducer };
