/** @file Redux reducer functions for the Game Lab Animation Tab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var ActionType = require('./actions').ActionType;
var animationPicker = require('../AnimationPicker/reducers').animationPicker;
var GameLabActionType = require('../actions').ActionType;
var combineReducers = require('redux').combineReducers;


function selectedAnimation(state, action) {
  state = state || '';
  switch (action.type) {
    case GameLabActionType.ADD_ANIMATION_AT:
      return action.animationProps.key;
    case ActionType.SELECT_ANIMATION:
      return action.animationKey;
    default:
      return state;
  }
}

var animationPickerFlowInitialState = {
  isPickerShowing: false
};

function animationPickerFlow(state, action) {
  state = state || animationPickerFlowInitialState;
  switch (action.type) {
    case ActionType.BEGIN_PICKING_ANIMATION:
      return {
        isPickerShowing: true,
        destination: action.destination
      };
    case ActionType.FINISH_PICKING_ANIMATION:
      return animationPickerFlowInitialState;
    case ActionType.CANCEL_PICKING_ANIMATION:
      return animationPickerFlowInitialState;
    default:
      return state;
  }
}

var animationTab = combineReducers({
  animationPicker: animationPicker,
  animationPickerFlow: animationPickerFlow,
  selectedAnimation: selectedAnimation
});

module.exports = {
  animationTab: animationTab
};
