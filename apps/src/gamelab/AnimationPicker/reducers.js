/** @file Redux reducer functions for the AnimationPicker component.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var AnimationPickerAction = require('./actions').AnimationPickerAction;
var combineReducers = require('redux').combineReducers;

function isShowing(state, action) {
  state = state || false;

  switch (action.type) {
    case AnimationPickerAction.SHOW_ANIMATION_PICKER:
      return true;
    case AnimationPickerAction.HIDE_ANIMATION_PICKER:
      return false;
    default:
      return state;
  }
}

function onComplete(state, action) {
  state = state || function () {};

  switch (action.type) {
    case AnimationPickerAction.SHOW_ANIMATION_PICKER:
      return action.onComplete;
    case AnimationPickerAction.HIDE_ANIMATION_PICKER:
      return function () {};
    default:
      return state;
  }
}

function onCancel(state, action) {
  state = state || function () {};

  switch (action.type) {
    case AnimationPickerAction.SHOW_ANIMATION_PICKER:
      return action.onCancel;
    case AnimationPickerAction.HIDE_ANIMATION_PICKER:
      return function () {};
    default:
      return state;
  }
}

module.exports = {
  animationPicker: combineReducers({
    isShowing: isShowing,
    onComplete: onComplete,
    onCancel: onCancel
  })
};
