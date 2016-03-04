/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var ActionType = require('./Actions').ActionType;

function rootReducer(state, action) {
  if (typeof state === 'undefined') {
    state = {};
  }

  switch (action.type) {
    case ActionType.SET_LEVEL_PROPS:
      if (typeof action.levelProps.assetUrl !== 'undefined') {
        state.assetUrl = action.levelProps.assetUrl;
      }
      return state;

    default:
      return state;
  }
}

module.exports = { rootReducer: rootReducer };
