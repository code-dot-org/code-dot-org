/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('../lodash');
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
    case ActionType.SET_INITIAL_LEVEL_PROPS:
      var allowedKeys = [
        'assetUrl',
        'isDesignModeHidden',
        'isEmbedView',
        'isReadOnlyWorkspace',
        'isShareView',
        'isViewDataButtonHidden',
        'instructionsMarkdown',
        'instructionsInTopPane',
        'puzzleNumber',
        'stageTotal'
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
  height: 300,
  maxHeight: 0,
  inTopPane: false
};

function instructions(state, action) {
  state = state || instructionsInitialState;

  // TODO - we'll want to think about how to handle state that is common across
  // apps. For example, this (and eventually all of instructions) belongs in
  // a studioApps related store.
  if (action.type === ActionType.SET_INSTRUCTIONS_IN_TOP_PANE &&
      action.inTopPane !== state.inTopPane) {
    return _.assign({}, state, {
      inTopPane: action.inTopPane
    });
  }

  if (action.type === ActionType.TOGGLE_INSTRUCTIONS_COLLAPSED) {
    return _.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === ActionType.SET_INSTRUCTIONS_HEIGHT &&
      action.height !== state.height) {
    return _.assign({}, state, {
      height: action.height
    });
  }

  if (action.type === ActionType.SET_INSTRUCTIONS_MAX_HEIGHT &&
      action.maxHeight !== state.maxHeight) {
    return _.assign({}, state, {
      maxHeight: action.maxHeight
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
