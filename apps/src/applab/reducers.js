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
var constants = require('./constants');
var ApplabMode = constants.ApplabMode;

var initialState = {
  assetUrl: function () {},
  isDesignModeHidden: undefined,
  isEmbedView: undefined,
  isReadOnlyWorkspace: undefined,
  isShareView: undefined,
  isViewDataButtonHidden: undefined,
  mode: ApplabMode.CODE,
  currentScreenId: null
};

function rootReducer(state, action) {
  state = state || initialState;

  switch (action.type) {
    case ActionType.CHANGE_SCREEN:
      if (state.currentScreenId === action.screenId) {
        return state;
      }
      return $.extend({}, state, {
        currentScreenId: action.screenId
      });

    case ActionType.CHANGE_MODE:
      if (state.mode === action.mode) {
        return state;
      }
      return $.extend({}, state, {
        mode: action.mode
      });

    case ActionType.SET_LEVEL_PROPS:
      var allowedKeys = [
        'assetUrl',
        'isDesignModeHidden',
        'isEmbedView',
        'isReadOnlyWorkspace',
        'isShareView',
        'isViewDataButtonHidden'
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

module.exports = { rootReducer: rootReducer };
