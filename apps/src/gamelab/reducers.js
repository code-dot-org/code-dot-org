/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('../lodash');
var ActionType = require('./actions').ActionType;
var animationPicker = require('./AnimationPicker/reducers').animationPicker;
var animationTab = require('./AnimationTab/reducers').animationTab;
var combineReducers = require('redux').combineReducers;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;

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

var animationsInitialState = [
  // {
  //   "name": "animation1",
  //   "frameRate": 10,
  //   "key": "animation1_key",
  //   "version": "111111",
  //   "frameWidth": 400,
  //   "frameHeight": 200,
  //   "frameCount": 8,
  //   "framesPerRow": 5
  // }
];

function animations(state, action) {
  state = state || animationsInitialState;
  
  switch (action.type) {
    case ActionType.DELETE_ANIMATION:
      return state.filter(function (animation) {
        return animation.key !== action.animationKey;
      });
    case ActionType.SET_INITIAL_ANIMATION_METADATA:
      return action.metadata;
    case ActionType.SET_ANIMATION_NAME:
      for (var i = 0; i < state.length; i++) {
        if (state[i].key === action.animationKey) {
          state[i] = _.assign({}, state[i], {
            name: action.name
          });
        }
      }
      return state.slice();
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
