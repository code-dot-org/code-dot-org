/** @file Redux reducer functions for App Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var ActionType = require('./actions').ActionType;

var initialState = {
  assetUrl: function () {},
  isDesignModeHidden: undefined,
  isEmbedView: undefined,
  isReadOnlyWorkspace: undefined,
  isShareView: undefined,
  isViewDataButtonHidden: undefined,
  currentScreenId: null
};

function rootReducer(state, action) {
  state = state || initialState;

  switch (action.type) {
    case ActionType.CHANGE_SCREEN:
      return $.extend({}, state, {
        currentScreenId: action.screenId
      });

    case ActionType.SET_LEVEL_PROPS:
      var newState = $.extend({}, state);
      [
        'assetUrl',
        'isDesignModeHidden',
        'isEmbedView',
        'isReadOnlyWorkspace',
        'isShareView',
        'isViewDataButtonHidden'
      ].forEach(function (propName) {
        if (typeof action.props[propName] !== 'undefined') {
          newState[propName] = action.props[propName];
        }
      });
      return newState;

    default:
      return state;
  }
}

module.exports = { rootReducer: rootReducer };
