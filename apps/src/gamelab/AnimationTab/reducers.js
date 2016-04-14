/** @file Redux reducer functions for the Game Lab Animation Tab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var ActionType = require('./actions').ActionType;
var combineReducers = require('redux').combineReducers;


function selectedAnimation(state, action) {
  state = state || '';
  switch (action.type) {
    case ActionType.SELECT_ANIMATION:
      return action.animationKey;
    default:
      return state;
  }
}

var animationTab = combineReducers({
  selectedAnimation: selectedAnimation
});

module.exports = { animationTab: animationTab };
