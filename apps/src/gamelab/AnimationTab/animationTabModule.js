/** @file Redux actions and reducer for the AnimationTab */
'use strict';

var combineReducers = require('redux').combineReducers;
var GameLabActionType = require('../actions').ActionType;

var SELECT_ANIMATION = 'AnimationTab/SELECT_ANIMATION';

exports.reducer = combineReducers({
  selectedAnimation: selectedAnimation
});

function selectedAnimation(state, action) {
  state = state || '';
  switch (action.type) {
    case GameLabActionType.ADD_ANIMATION_AT:
      return action.animationProps.key;
    case SELECT_ANIMATION:
      return action.animationKey;
    default:
      return state;
  }
}

var actions = exports.actions = {};

/**
 * Select an animation in the animation list.
 * @param {!string} animationKey
 * @returns {{type: string, animationKey: string}}
 */
actions.selectAnimation = function (animationKey) {
  return { type: SELECT_ANIMATION, animationKey: animationKey };
};
