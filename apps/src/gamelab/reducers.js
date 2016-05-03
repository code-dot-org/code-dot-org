/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('../lodash');
var ActionType = require('./actions').ActionType;
var animationPicker = require('./AnimationPicker/animationPickerModule').default;
var animationTab = require('./AnimationTab/animationTabModule').default;
var combineReducers = require('../redux').combineReducers;
var errorDialogStack = require('./errorDialogStackModule').default;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
var instructions = require('../redux/instructions');
var utils = require('../utils');

function interfaceMode(state, action) {
  state = state || GameLabInterfaceMode.CODE;

  switch (action.type) {
    case ActionType.CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

function animation(state, action) {
  state = state || { key: utils.createUuid() };

  switch (action.type) {
    case ActionType.SET_ANIMATION_NAME:
      if (state.key === action.animationKey) {
        return _.assign({}, state, {
          name: action.name
        });
      }
      return state;

    default:
      return state;
  }
}

function animations(state, action) {
  state = state || [];

  switch (action.type) {

    case ActionType.ADD_ANIMATION_AT:
      return [].concat(
          state.slice(0, action.index),
          action.animationProps,
          state.slice(action.index));

    case ActionType.DELETE_ANIMATION:
      return state.filter(function (animation) {
        return animation.key !== action.animationKey;
      });

    case ActionType.SET_INITIAL_ANIMATION_METADATA:
      return action.metadata;

    case ActionType.SET_ANIMATION_NAME:
      return state.map(function (animState) {
        return animation(animState, action);
      });

    default:
      return state;
  }
}

var gamelabReducer = combineReducers({
  animationPicker: animationPicker,
  animationTab: animationTab,
  animations: animations,
  errorDialogStack: errorDialogStack,
  interfaceMode: interfaceMode,
  instructions: instructions.default
});

module.exports = { gamelabReducer: gamelabReducer };
