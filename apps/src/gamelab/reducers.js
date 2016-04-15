/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('../lodash');
var ActionType = require('./actions').ActionType;
var animationPicker = require('./AnimationPicker/reducers').animationPicker;
var animationTab = require('./AnimationTab/reducers').animationTab;
var combineReducers = require('redux').combineReducers;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
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

var levelInitialState = {
  assetUrl: function () {},
  isEmbedView: undefined,
  isShareView: undefined
};

function level(state, action) {
  state = state || levelInitialState;

  switch (action.type) {
    case ActionType.SET_INITIAL_LEVEL_PROPS:
      var allowedKeys = [
        'assetUrl',
        'isEmbedView',
        'isShareView'
      ];
      Object.keys(action.props).forEach(function (key) {
        if (-1 === allowedKeys.indexOf(key)) {
          throw new Error('Property "' + key + '" may not be set using the ' +
              action.type + ' action.');
        }
      });
      return _.assign({}, state, action.props);

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
      // ONLY FOR TESTING - REMOVE BEFORE SHIP!
      if (action.metadata.length === 0) {
        return animationsInitialState;
      }
      return action.metadata;

    case ActionType.SET_ANIMATION_NAME:
      return state.map(function (animState) {
        return animation(animState, action)
      });

    default:
      return state;
  }
}

var gamelabReducer = combineReducers({
  animationPicker: animationPicker,
  animationTab: animationTab,
  animations: animations,
  interfaceMode: interfaceMode,
  level: level
});

module.exports = { gamelabReducer: gamelabReducer };
