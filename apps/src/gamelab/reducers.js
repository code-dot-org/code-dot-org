/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var _ = require('../lodash');
var ActionType = require('./actions').ActionType;
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

var gamelabReducer = combineReducers({
  interfaceMode: interfaceMode,
  level: level
});

module.exports = {gamelabReducer: gamelabReducer};
